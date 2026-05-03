import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "data" / "app.db"


def main() -> None:
    os.environ.setdefault("DATABASE_PATH", str(DB_PATH))
    os.environ.setdefault("HF_HOME", str(ROOT / "data" / "processed" / "hf_cache"))
    os.environ.setdefault("TRANSFORMERS_CACHE", str(ROOT / "data" / "processed" / "hf_cache"))

    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not DB_PATH.exists():
        subprocess.check_call([sys.executable, str(ROOT / "seed.py")], cwd=ROOT)

    port = os.getenv("PORT", "7860")
    os.chdir(ROOT / "backend")
    subprocess.check_call([
        sys.executable,
        "-m",
        "uvicorn",
        "main:app",
        "--host",
        "0.0.0.0",
        "--port",
        port,
    ])


if __name__ == "__main__":
    main()
