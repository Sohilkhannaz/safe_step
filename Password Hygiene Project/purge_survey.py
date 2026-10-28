#!/usr/bin/env python3
"""Delete survey responses 90 days after the configured survey closing date."""

import argparse
import os
import sqlite3
from datetime import date, timedelta
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DATABASE = Path(os.environ.get(
    "SURVEY_DATABASE",
    str(ROOT / "survey_data" / "responses.sqlite3"),
))
RETENTION_DAYS = 90


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--confirm",
        action="store_true",
        help="confirm permanent deletion of every stored survey response",
    )
    args = parser.parse_args()
    close_date_value = os.environ.get("SURVEY_CLOSE_DATE")
    if not close_date_value:
        raise SystemExit("Set SURVEY_CLOSE_DATE to the survey closing date (YYYY-MM-DD) first.")
    try:
        close_date = date.fromisoformat(close_date_value)
    except ValueError as error:
        raise SystemExit("SURVEY_CLOSE_DATE must use YYYY-MM-DD format.") from error

    eligible_date = close_date + timedelta(days=RETENTION_DAYS)
    if date.today() < eligible_date:
        raise SystemExit(
            f"Responses are eligible for deletion on {eligible_date.isoformat()} or later."
        )
    if not args.confirm:
        raise SystemExit("No responses deleted. Re-run with --confirm to permanently delete them.")
    if not DATABASE.exists():
        raise SystemExit(f"Survey database does not exist: {DATABASE}")

    try:
        with sqlite3.connect(DATABASE) as connection:
            deleted = connection.execute("DELETE FROM survey_responses").rowcount
            connection.commit()
            connection.execute("VACUUM")
    except sqlite3.Error as error:
        raise SystemExit(f"Could not purge the response database: {error}") from error
    print(f"Deleted {deleted} survey responses from {DATABASE}.")


if __name__ == "__main__":
    main()
