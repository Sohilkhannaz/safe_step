#!/usr/bin/env python3
"""Export an aggregate CSV summary without exporting individual responses."""

import csv
import json
import sqlite3
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DATABASE = ROOT / "survey_data" / "responses.sqlite3"
QUESTIONS_FILE = ROOT / "data" / "survey_questions.json"
OUTPUT = ROOT / "survey_data" / "response_summary.csv"


def main():
    if not DATABASE.exists():
        raise SystemExit("No survey database found. Run the server and collect responses first.")

    questions = json.loads(QUESTIONS_FILE.read_text(encoding="utf-8"))
    with sqlite3.connect(DATABASE) as connection:
        rows = connection.execute(
            "SELECT answers_json FROM survey_responses"
        ).fetchall()
    responses = [json.loads(row[0]) for row in rows]
    OUTPUT.parent.mkdir(mode=0o700, exist_ok=True)

    with OUTPUT.open("w", newline="", encoding="utf-8") as csv_file:
        writer = csv.writer(csv_file)
        writer.writerow(["Question", "Answer option", "Count", "Percent", "Valid responses"])
        for question in questions:
            question_id = question["id"]
            valid_answers = [
                response[question_id]
                for response in responses
                if question_id in response
            ]
            denominator = len(valid_answers)
            for option in question["options"]:
                count = valid_answers.count(option)
                percentage = (count / denominator * 100) if denominator else 0
                writer.writerow([
                    question["question"],
                    option,
                    count,
                    f"{percentage:.1f}",
                    denominator,
                ])

    print(f"Exported aggregate counts for {len(responses)} responses to {OUTPUT}")
    print("The CSV contains question-level totals, not individual response records.")


if __name__ == "__main__":
    main()
