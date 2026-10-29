#!/usr/bin/env python3
"""Website and survey API, runnable locally or through a production WSGI server."""

import json
import logging
import os
import sqlite3
import threading
import time
from contextlib import contextmanager
from pathlib import Path

from flask import Flask, abort, jsonify, request, send_from_directory
from werkzeug.exceptions import RequestEntityTooLarge
from werkzeug.middleware.proxy_fix import ProxyFix


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "survey_data"
DATABASE = Path(os.environ.get(
    "SURVEY_DATABASE",
    str(DATA_DIR / "responses.sqlite3"),
))
QUESTIONS_FILE = ROOT / "data" / "survey_questions.json"
MAX_REQUEST_BYTES = 16_384
RATE_LIMIT_WINDOW_SECONDS = 15 * 60
RATE_LIMIT_MAX_SUBMISSIONS = 10
SUBMISSIONS_BY_ADDRESS = {}
SUBMISSIONS_LOCK = threading.Lock()
PAGE_FILES = {
    "index.html",
    "password-guide.html",
    "data-protection.html",
    "quiz.html",
    "survey.html",
    "analysis.html",
    "resources.html",
}

with QUESTIONS_FILE.open(encoding="utf-8") as questions_file:
    QUESTIONS = json.load(questions_file)

ALLOWED_ANSWERS = {
    question["id"]: set(question["options"])
    for question in QUESTIONS
}

app = Flask(__name__, static_folder=None)
app.config["MAX_CONTENT_LENGTH"] = MAX_REQUEST_BYTES
logging.getLogger("werkzeug").disabled = True
if os.environ.get("RENDER") or os.environ.get("RENDER_EXTERNAL_URL"):
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1)


@contextmanager
def database_connection():
    connection = sqlite3.connect(DATABASE, timeout=5)
    connection.row_factory = sqlite3.Row
    try:
        with connection:
            yield connection
    finally:
        connection.close()


def initialise_database():
    DATABASE.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    with sqlite3.connect(DATABASE) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS survey_responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                answers_json TEXT NOT NULL
            )
            """
        )
    try:
        DATABASE.chmod(0o600)
    except OSError:
        if os.name != "nt":
            raise


@app.after_request
def set_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data:; "
        "connect-src 'self'; "
        "form-action 'self'; "
        "base-uri 'self'; "
        "frame-ancestors 'none'; "
        "object-src 'none'"
    )
    if request.is_secure:
        response.headers["Strict-Transport-Security"] = "max-age=31536000"
    if request.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
    return response


@app.get("/healthz")
def health_check():
    return {"status": "ok"}, 200


@app.errorhandler(RequestEntityTooLarge)
def request_too_large(_error):
    if request.path.startswith("/api/"):
        return jsonify({"error": "The survey submission is too large."}), 413
    return "Request too large.", 413


@app.get("/api/survey/questions")
def survey_questions():
    return jsonify({"questions": QUESTIONS})


@app.get("/api/survey/count")
def survey_count():
    try:
        with database_connection() as connection:
            count = connection.execute(
                "SELECT COUNT(*) FROM survey_responses"
            ).fetchone()[0]
    except sqlite3.Error:
        app.logger.exception("Could not read the survey response count.")
        return jsonify({"error": "The response count is temporarily unavailable."}), 500
    return jsonify({"responses": count})


@app.get("/api/survey/analysis")
def survey_analysis():
    try:
        with database_connection() as connection:
            stored_answers = connection.execute(
                "SELECT answers_json FROM survey_responses"
            ).fetchall()
    except sqlite3.Error:
        app.logger.exception("Could not read survey responses for analysis.")
        return jsonify({"error": "Response analysis is temporarily unavailable."}), 500

    counts_by_question = {
        question["id"]: {option: 0 for option in question["options"]}
        for question in QUESTIONS
    }
    valid_by_question = {question["id"]: 0 for question in QUESTIONS}
    total_valid_answers = 0
    for row in stored_answers:
        try:
            answers = json.loads(row["answers_json"])
        except (json.JSONDecodeError, TypeError):
            continue
        if not isinstance(answers, dict):
            continue
        for question_id, options in counts_by_question.items():
            answer = answers.get(question_id)
            if answer in options:
                options[answer] += 1
                valid_by_question[question_id] += 1
                total_valid_answers += 1

    analysis_questions = []
    for question in QUESTIONS:
        question_id = question["id"]
        valid_responses = valid_by_question[question_id]
        analysis_questions.append({
            "id": question_id,
            "title": question["question"],
            "validResponses": valid_responses,
            "options": [
                {
                    "label": option,
                    "count": counts_by_question[question_id][option],
                    "percentage": round(
                        counts_by_question[question_id][option] * 100 / valid_responses,
                        1,
                    ) if valid_responses else 0,
                }
                for option in question["options"]
            ],
        })

    return jsonify({
        "totalResponses": len(stored_answers),
        "questionCount": len(QUESTIONS),
        "totalValidAnswers": total_valid_answers,
        "questions": analysis_questions,
    })


def submission_limit_exceeded(client_address):
    current_time = time.monotonic()
    with SUBMISSIONS_LOCK:
        recent_submissions = [
            submitted
            for submitted in SUBMISSIONS_BY_ADDRESS.get(client_address, [])
            if current_time - submitted < RATE_LIMIT_WINDOW_SECONDS
        ]
        if len(recent_submissions) >= RATE_LIMIT_MAX_SUBMISSIONS:
            SUBMISSIONS_BY_ADDRESS[client_address] = recent_submissions
            return True
        recent_submissions.append(current_time)
        SUBMISSIONS_BY_ADDRESS[client_address] = recent_submissions
        return False


@app.post("/api/survey")
def submit_survey():
    allowed_origin = (
        os.environ.get("SITE_ORIGIN")
        or os.environ.get("RENDER_EXTERNAL_URL")
        or request.host_url
    )
    origin = request.headers.get("Origin")
    if origin and allowed_origin and origin.rstrip("/") != allowed_origin.rstrip("/"):
        return jsonify({"error": "Please submit this form from the project website."}), 403
    if request.content_type != "application/json":
        return jsonify({"error": "The survey submission must use JSON."}), 415
    if request.content_length is None or request.content_length <= 0:
        return jsonify({"error": "The survey submission is empty."}), 400
    if request.content_length > MAX_REQUEST_BYTES:
        return jsonify({"error": "The survey submission is too large."}), 413

    submission = request.get_json(silent=True)
    if not isinstance(submission, dict) or submission.get("consent") is not True:
        return jsonify({"error": "Please confirm that you choose to participate."}), 400
    answers = submission.get("answers")
    if not isinstance(answers, dict) or set(answers) != set(ALLOWED_ANSWERS):
        return jsonify({"error": "Please answer every survey question."}), 400
    if any(
        not isinstance(answer, str) or answer not in ALLOWED_ANSWERS[question_id]
        for question_id, answer in answers.items()
    ):
        return jsonify({"error": "One or more answers are not valid choices."}), 400

    client_address = request.remote_addr or "unknown"
    if submission_limit_exceeded(client_address):
        return jsonify({
            "error": "Too many submissions from this browser. Please try again later."
        }), 429

    try:
        with database_connection() as connection:
            connection.execute(
                "INSERT INTO survey_responses (answers_json) VALUES (?)",
                (json.dumps(answers, ensure_ascii=False),),
            )
            connection.commit()
            count = connection.execute(
                "SELECT COUNT(*) FROM survey_responses"
            ).fetchone()[0]
    except sqlite3.Error:
        app.logger.exception("Could not save a survey response.")
        return jsonify({
            "error": "The response could not be saved. Please try again later."
        }), 500

    return jsonify({
        "message": "Thank you. Your response has been saved for project analysis.",
        "responses": count,
    }), 201


@app.route("/", defaults={"filename": "index.html"})
@app.route("/<path:filename>")
def website_files(filename):
    if filename in PAGE_FILES:
        return send_from_directory(ROOT, filename)
    if filename.startswith("assets/"):
        return send_from_directory(ROOT, filename)
    abort(404)


def main():
    initialise_database()
    host = os.environ.get("SURVEY_HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", os.environ.get("SURVEY_PORT", "8000")))
    print(f"Project website: http://{host}:{port}")
    print(f"Survey responses are stored in {DATABASE}.")
    app.run(host=host, port=port, threaded=True, use_reloader=False)


initialise_database()


if __name__ == "__main__":
    main()
