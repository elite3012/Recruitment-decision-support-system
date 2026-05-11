---
title: RecruitAI
emoji: 💼
colorFrom: teal
colorTo: cyan
sdk: docker
pinned: false
license: mit
short_description: AI-assisted recruitment decision support system
---

# RecruitAI

RecruitAI is an AI-assisted recruitment decision support system built for screening jobs and candidates with a human-in-the-loop workflow. It combines semantic matching, structured scoring, recruiter actions, dashboard monitoring, and CRUD administration in one web application.

The repository is used for both:

- the GitHub source project
- the Hugging Face Docker Space deployment

## What It Does

- Ranks candidates against a selected job description using semantic similarity plus business rules
- Breaks the final score into explainable components such as skill overlap, experience fit, and location fit
- Lets recruiters record `Shortlist`, `Hold`, and `Reject` decisions with notes
- Tracks decision history and top-level recruitment KPIs
- Supports admin-side CRUD for jobs and candidates
- Ships with demo seed data for local runs and public demo deployment

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Query, Zustand
- Backend: FastAPI, Pydantic, SQLAlchemy
- AI/NLP: sentence-transformers, PyTorch, scikit-learn
- Database: SQLite
- Deployment: Docker, Hugging Face Spaces

## Key Screens

- Dashboard
- Job catalog
- Candidate ranking
- Candidate detail and score breakdown
- Decision history
- Master data CRUD
- Account settings

## Project Structure

```text
Recruitment-decision-support-system/
├── backend/
│   ├── main.py                  # FastAPI application and API routes
│   ├── inference/              # Runtime orchestration for matching services
│   └── src/
│       ├── actions/            # Recruiter decision workflows
│       ├── features/           # Feature extraction helpers
│       ├── models/             # Embedding and matching logic
│       └── storage/            # SQLAlchemy models and database access
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI modules
│   │   ├── pages/              # Screen-level views
│   │   ├── api/                # API client
│   │   └── store/              # Zustand state
│   └── package.json
├── data/
│   └── demo_seed.json          # Demo jobs and candidates
├── reports/
│   ├── assets/                 # Report diagrams
│   ├── generate_ism_report.py  # Optional report generator
│   └── RecruitAI_ISM_Report.docx
├── scripts/
│   └── start_hf_space.py       # Docker Space entrypoint
├── seed.py                     # Local/demo database bootstrap
├── start.bat                   # Windows quick start
├── start.ps1                   # PowerShell quick start
└── Dockerfile
```

## Local Quick Start

### Option 1: Windows starter scripts

Use one of the built-in startup scripts:

```bat
start.bat
```

or

```powershell
.\start.ps1
```

These scripts will:

- create `.venv` if needed
- install backend dependencies
- seed `data/app.db` if it does not exist
- install frontend dependencies if `frontend/node_modules` is missing
- launch the backend on `http://localhost:8000`
- launch the frontend on `http://localhost:5173`

Default local login:

```text
Username: admin
Password: admin123
```

### Option 2: Manual startup

#### Backend

```bash
python -m venv .venv
source .venv/bin/activate        # macOS / Linux
# .\.venv\Scripts\activate       # Windows PowerShell
pip install -r backend/requirements.txt
python seed.py
cd backend
uvicorn main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API and Auth Notes

- The backend exposes FastAPI routes under the same application server
- Local development uses token-based auth
- The default admin user can change password from the account settings screen
- FastAPI interactive docs are available at:

```text
http://localhost:8000/docs
```

## AI Matching Logic

RecruitAI uses sentence embeddings to compare meaning, not just exact keywords. That helps the system match paraphrased job descriptions and candidate profiles more robustly than a simple ATS keyword filter.

The scoring logic combines:

- semantic text similarity
- extracted skill overlap
- experience match
- location compatibility

This makes the system more suitable as a decision-support tool rather than a rigid pass/fail filter.

## Demo Data

The repository includes `data/demo_seed.json`. On first startup:

- `seed.py` creates `data/app.db`
- demo jobs and candidates are loaded automatically

This keeps the project easy to run for demos, testing, and grading.

## Docker and Hugging Face Spaces

This repo is configured as a Docker Space.

- The frontend is built in the Docker image
- The backend serves both API routes and the built frontend
- The app listens on port `7860` in the Space environment
- If the database is missing, the container seeds it from `data/demo_seed.json`

For additional deployment notes, see [README_HF_SPACES.md](./README_HF_SPACES.md).

## Report Assets

The `reports/` folder contains project-specific ISM report materials:

- `generate_ism_report.py` generates diagrams and the report document
- `assets/` contains exported diagrams used by the report
- `RecruitAI_ISM_Report.docx` is the generated project report artifact

If you want to regenerate the report locally, install the script's document/image dependencies first, then run:

```bash
python reports/generate_ism_report.py
```

## Current Limitations

- SQLite is suitable for demo and classroom deployment, not high-concurrency production use
- Default credentials should be rotated immediately outside local/demo environments
- Free Hugging Face storage is ephemeral, so demo edits may reset after restart
- The system supports recruiter decision-making, but it should not be treated as a fully autonomous hiring authority

## License

This project is released under the MIT License. See [LICENSE](./LICENSE).
