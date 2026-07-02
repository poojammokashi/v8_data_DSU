# Pinned to the exact 3.14.4 patch as requested, rather than the rolling
# 3.14-slim tag (which tracks the latest patch and will drift over time).
# Bump deliberately when moving to a newer patch.
FROM python:3.14.4-slim-bookworm

WORKDIR /app

# System deps for psycopg2 and pandas/openpyxl
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run as a non-root user — never run application containers as root.
RUN groupadd --gid 1000 appuser && \
    useradd --uid 1000 --gid appuser --shell /bin/bash --create-home appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
