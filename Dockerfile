FROM node:20-bookworm-slim AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=7860 \
    HF_HOME=/app/data/processed/hf_cache \
    TRANSFORMERS_CACHE=/app/data/processed/hf_cache \
    DATABASE_PATH=/app/data/app.db

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements-space.txt ./backend/requirements-space.txt
RUN pip install --no-cache-dir -r backend/requirements-space.txt

COPY backend/ ./backend/
COPY seed.py ./seed.py
COPY scripts/ ./scripts/
RUN mkdir -p ./data
COPY data/demo_seed.json ./data/demo_seed.json
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 7860

CMD ["python", "scripts/start_hf_space.py"]
