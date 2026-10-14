# Stage 1: Build React Frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app/web
COPY apps/web/package*.json ./
RUN npm install
COPY apps/web/ ./
RUN npm run build

# Stage 2: Python / Django Production Server
FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY apps /app/apps
COPY manage.py /app/manage.py
COPY pytest.ini /app/pytest.ini

# Copy built frontend assets from Stage 1 into Django template/static directory
COPY --from=frontend-builder /app/web/dist /app/apps/web/dist

# Collect static files for WhiteNoise
RUN python manage.py collectstatic --noinput

EXPOSE 8000

# Start Gunicorn WSGI server
CMD ["sh", "-c", "gunicorn apps.api.config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3 --timeout 120"]
