---
title: RecruitAI
emoji: 💼
colorFrom: teal
colorTo: cyan
sdk: docker
pinned: false
license: mit
short_description: Recruitment decision support system
---

# RecruitAI

RecruitAI is a full-stack recruitment decision support system for screening jobs and candidates through a structured recruiter workflow.  
The project focuses on practical engineering areas such as API development, structured data handling, persistence, integration, testing, and deployment support.

## Project Summary

The system allows recruiters to:

- manage job and candidate records
- rank candidates against a selected job
- review candidate details and score breakdowns
- record `Shortlist`, `Hold`, and `Reject` decisions with notes
- track decision history and dashboard-level metrics

This is a decision-support tool, not an autonomous hiring system. Final decisions are still made by the recruiter.

## What This Project Demonstrates

This repository reflects hands-on work in:

- backend API development with FastAPI
- database modeling and persistence using SQLAlchemy and SQLite
- structured data workflows for jobs, candidates, matches, and recruiter actions
- frontend implementation for recruiter-facing workflows in React
- integration between UI, REST APIs, scoring logic, and storage
- local setup, Docker-based deployment, demo data seeding, and technical documentation

## Matching Approach

Candidate ranking combines:

- semantic text similarity from sentence embeddings
- skill overlap
- experience fit
- location compatibility

The goal is to make screening more consistent and easier to review, while keeping the output interpretable for human users.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, React Query, Zustand
- Backend: FastAPI, Pydantic, SQLAlchemy
- AI / NLP: sentence-transformers, PyTorch, scikit-learn
- Database: SQLite
- Deployment: Docker, Hugging Face Spaces

## Repository Structure

```text
Recruitment-decision-support-system/
├── backend/         FastAPI app, matching services, storage layer
├── frontend/        React application and recruiter-facing screens
├── data/            demo seed data and local SQLite database
├── reports/         supporting project documentation and report assets
├── scripts/         deployment/startup helpers
├── seed.py          local database bootstrap
├── start.bat        Windows quick start
├── start.ps1        PowerShell quick start
└── Dockerfile       container build for deployment
```

## Local Setup

### Quick start on Windows

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
- install frontend dependencies if needed
- start the backend on `http://localhost:8000`
- start the frontend on `http://localhost:5173`

Default local login:

```text
Username: admin
Password: admin123
```

### Manual setup

Backend:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
python seed.py
cd backend
uvicorn main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

### Docker

Build and start the complete application with Docker Compose:

```bash
docker compose up --build
```

Open `http://localhost:7860` after the container becomes healthy. SQLite data and the embedding cache are kept in the named `recruitai-data` volume.

To stop the service:

```bash
docker compose down
```

To reset the local container data, including the seeded database:

```bash
docker compose down -v
```

FastAPI docs are available at:

```text
http://localhost:8000/docs
```

## Deployment Notes

The repository is also configured for Hugging Face Docker Spaces.

- the frontend is built inside the Docker image
- the backend serves both the API and the built frontend
- the app runs on port `7860` in the Space environment
- demo data is seeded automatically if the database is missing

Additional deployment notes are available in [README_HF_SPACES.md](./README_HF_SPACES.md).

## Limitations

- SQLite is suitable for demo and coursework usage, not high-concurrency production workloads
- default credentials should be changed outside local/demo environments
- free Hugging Face storage is ephemeral, so demo-side data can reset after restart

## License

This project is released under the MIT License. See [LICENSE](./LICENSE).
