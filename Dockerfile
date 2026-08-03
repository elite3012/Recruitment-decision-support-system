FROM node:20-bookworm-slim AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps
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
# Hugging Face Spaces runs CPU inference; avoid bundling the CUDA runtime.
RUN pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu "torch>=2.2.0" \
    && pip install --no-cache-dir -r backend/requirements-space.txt

COPY backend/ ./backend/
COPY seed.py ./seed.py
COPY scripts/ ./scripts/
RUN mkdir -p ./data
COPY data/demo_seed.json ./data/demo_seed.json
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:7860/api/health', timeout=3)" || exit 1

CMD ["python", "scripts/start_hf_space.py"]
