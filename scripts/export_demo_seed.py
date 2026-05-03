import json
import sqlite3
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "data" / "app.db"
OUTPUT_PATH = ROOT / "data" / "demo_seed.json"

TABLE_COLUMNS = {
    "jobs": [
        "job_id",
        "job_title",
        "company_name",
        "company_overview",
        "job_description",
        "job_requirements",
        "benefits",
        "job_address",
        "job_type",
        "career_level",
        "industry",
        "location",
        "years_of_experience",
        "salary",
    ],
    "candidates": [
        "user_id",
        "user_name",
        "industry",
        "desired_job",
        "workplace_desired",
        "desired_salary",
        "age",
        "target",
        "skills",
        "degree",
        "work_experience",
        "gender",
        "location",
        "marriage",
    ],
}


def fetch_rows(connection: sqlite3.Connection, table: str) -> list[dict]:
    columns = TABLE_COLUMNS[table]
    cursor = connection.execute(f"select {', '.join(columns)} from {table}")
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def main() -> None:
    if not DB_PATH.exists():
        raise FileNotFoundError(f"Missing source database: {DB_PATH}")

    connection = sqlite3.connect(DB_PATH)
    try:
        payload = {
            "version": 1,
            "source": "local SQLite export for Hugging Face Spaces demo bootstrapping",
            "jobs": fetch_rows(connection, "jobs"),
            "candidates": fetch_rows(connection, "candidates"),
        }
    finally:
        connection.close()

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(
        f"Wrote {OUTPUT_PATH} "
        f"({len(payload['jobs'])} jobs, {len(payload['candidates'])} candidates)"
    )


if __name__ == "__main__":
    main()
