# Voltura — Electricity Management API

FastAPI backend for the Electricity Management Dashboard: Power Purchase, Open Access,
Generation, Consumption, Peak Demand, Billing & Settlement, Analytics, Alerts, and
Data Upload (Excel/CSV/JSON), with JWT auth and role-based access control.

## Stack
FastAPI · SQLAlchemy 2.0 · Alembic · PostgreSQL · JWT (python-jose) · Pandas (file ingestion)
**Python 3.14.4** (pinned in `Dockerfile`; use the same version locally for parity)

## Quick start (Docker)

```bash
cp .env.example .env
# edit .env — at minimum set JWT_SECRET_KEY to a long random value
docker compose up --build
```

This starts Postgres, runs migrations (`alembic upgrade head`), seeds roles/permissions
and a super admin account, and serves the API at `http://localhost:8000`.

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health check: `http://localhost:8000/health`

Default super admin login (change immediately): see `SUPERADMIN_EMAIL` /
`SUPERADMIN_PASSWORD` in `.env`.

## Local setup without Docker

Requires Python 3.14.4 (or another 3.14.x — check `pyreadiness.org/3.14` first if you
substitute a dependency not pinned here, as a few smaller packages are still catching up).

```bash
python3.14 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# point DATABASE_URL at a local Postgres instance

alembic upgrade head
uvicorn app.main:app --reload
```

## Project layout

```
app/
  core/         settings, JWT, RBAC matrix, logging, domain exceptions
  db/           SQLAlchemy engine/session, base classes, first-boot seeding
  models/       ORM models (one file per domain)
  schemas/      Pydantic request/response DTOs
  repositories/ data access layer (Repository pattern)
  services/     business logic (Service layer)
  api/v1/       routes + dependencies (auth, RBAC, pagination)
  middleware/   logging, error handling, rate limiting
alembic/        migrations (0001 schema, 0002 seed roles/permissions)
```

## Architecture notes

- **Clean layering**: routes never touch the database directly — they call a service,
  which calls a repository. Routes also never construct SQLAlchemy queries.
- **RBAC**: enforced via `require_permission(Permission.X)` as a route dependency,
  checked against the matrix in `app/core/permissions.py` — not hardcoded role checks.
- **File uploads** are two-phase: `POST /uploads/{type}` validates and stages rows
  (nothing written to domain tables yet); `POST /uploads/{id}/commit` persists them.
- **Soft deletes** on financial/master records (`deleted_at`), never hard-deleted.
- **Audit log** is append-only and decoupled from business tables.

## Running migrations

```bash
# generate a new migration after changing models
alembic revision --autogenerate -m "describe the change"

# apply
alembic upgrade head

# rollback one step
alembic downgrade -1
```

## Tests

```bash
pytest
```
