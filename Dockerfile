# Multi-stage build for DarkSpot AI Production Suite
# Stage 1: Build Next.js frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend ./
# Build Next.js with origin rewrites
ENV NEXT_PUBLIC_API_URL=""
RUN npm run build

# Stage 2: Unified Python + Node Production Runtime
FROM python:3.10-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    NODE_ENV=production \
    PORT=10000

# Install Node.js 20 and system build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend source code
COPY backend ./backend

# Copy frontend build and node_modules from builder
COPY --from=frontend-builder /app/frontend ./frontend

# Copy production orchestration script
COPY run_production.py ./run_production.py

# Render exposes PORT environment variable
EXPOSE 10000

CMD ["python", "run_production.py"]
