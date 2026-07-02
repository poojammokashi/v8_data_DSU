# Voltura — Electricity Management Dashboard

A full-stack electricity management platform for Power Purchase, Open Access,
Generation, Consumption, Peak Demand, Billing & Settlement, Analytics, Alerts,
and bulk data ingestion (Excel/CSV/JSON) — with JWT authentication and
role-based access control across four roles (Super Admin, Admin, Analyst, Viewer).

```
voltura/
├── frontend/   React 18 + Vite + Tailwind CSS — enterprise dashboard UI
└── backend/    FastAPI + SQLAlchemy + Alembic + PostgreSQL — REST API
```

This README covers both halves end to end: install, configure, run locally,
and deploy. Each subproject also has its own `README.md` with narrower,
project-specific detail — this document is the entry point.

---

## 1. Architecture at a glance

**Frontend** — React 18 (Vite), Tailwind CSS, React Router, Axios, React Hook
Form, Recharts, Framer Motion, Zustand. Domain-driven `features/` modules
(API calls + hooks) layered over a reusable `components/ui` library. Ships
with a mock-data mode (`VITE_USE_MOCK_API=true`) so the UI is fully usable
before the backend is running.

**Backend** — FastAPI with strict clean-architecture layering:

```
Route (HTTP only) -> Service (business logic) -> Repository (data access) -> SQLAlchemy ORM
```

RBAC is enforced via a permission matrix (`app/core/permissions.py`), never
hardcoded role checks. Every list endpoint shares one pagination contract.
File uploads are two-phase (validate then commit) so a bad file never
partially corrupts a table. JWT access + refresh tokens, with a dedicated
short-lived reset-token type for the forgot-password flow.

**Database** — PostgreSQL, versioned via Alembic migrations. Financial
fields use `Numeric`, never `Float`. Soft deletes (`deleted_at`) on
financial/master records. Append-only audit log decoupled from business
tables.

---

## 2. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 20.x or later | for the frontend (Vite 5 requirement) |
| Python | 3.14.4 | pinned in `backend/Dockerfile`; match locally for parity |
| PostgreSQL | 16.x | 14+ works; 16 is what's used in `docker-compose.yml` |
| Docker + Docker Compose | optional but recommended | fastest path to a working backend + database |

---

## 3. Quick start (Docker — recommended for the backend)

```bash
cd backend
cp .env.example .env
# edit .env — at minimum set JWT_SECRET_KEY to a long random value
docker compose up --build
```

This starts PostgreSQL, runs all Alembic migrations, seeds roles/permissions
and a Super Admin account, and serves the API at `http://localhost:8000`
(`/docs` for interactive Swagger UI).

Then, in a separate terminal, run the frontend against it:

```bash
cd frontend
cp .env.example .env
# set VITE_USE_MOCK_API=false to point at the real backend above
npm install
npm run dev
```

Open `http://localhost:5173`. Log in with the `SUPERADMIN_EMAIL` /
`SUPERADMIN_PASSWORD` from `backend/.env`.

If you'd rather explore the UI before standing up Postgres at all, skip the
backend entirely and leave `VITE_USE_MOCK_API=true` (the default) — every
page works against realistic in-memory seed data (`frontend/src/mocks/`).

---

## 4. PostgreSQL setup (manual, without Docker)

If you're not using `docker compose` for the database:

**macOS (Homebrew)**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian**
```bash
sudo apt update
sudo apt install postgresql-16 postgresql-contrib
sudo systemctl start postgresql
```

**Windows** — use the official installer at postgresql.org/download/windows,
or run Postgres via Docker Desktop instead (simplest on Windows).

**Create the database and user** (run as the `postgres` superuser):
```sql
CREATE USER voltura_user WITH PASSWORD 'voltura_pass';
CREATE DATABASE voltura_db OWNER voltura_user;
GRANT ALL PRIVILEGES ON DATABASE voltura_db TO voltura_user;
```

**Point the backend at it** — in `backend/.env`:
```
DATABASE_URL=postgresql+psycopg2://voltura_user:voltura_pass@localhost:5432/voltura_db
```

**Run migrations and seed data:**
```bash
cd backend
python3.14 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head              # creates schema + seeds roles/permissions
uvicorn app.main:app --reload     # also seeds the Super Admin account on first boot
```

**Verify:**
```bash
psql -U voltura_user -d voltura_db -c "\dt"   # should list ~17 tables
curl http://localhost:8000/health               # {"status":"ok",...}
```

---

## 5. Environment variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `APP_NAME` | `Voltura Electricity Management API` | Shown in Swagger docs |
| `APP_ENV` | `development` | `development` or `production` — controls debug behavior, hides `/docs` in prod |
| `API_V1_PREFIX` | `/api/v1` | Base path for all routes |
| `DEBUG` | `true` | Verbose error responses when true |
| `DATABASE_URL` | — | **Required.** SQLAlchemy connection string |
| `DB_POOL_SIZE` | `10` | SQLAlchemy connection pool size |
| `DB_MAX_OVERFLOW` | `20` | Extra connections allowed beyond pool size under load |
| `DB_ECHO` | `false` | Log every SQL statement (debug only) |
| `JWT_SECRET_KEY` | — | **Required.** Long random string; never commit a real value |
| `JWT_ALGORITHM` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token lifetime |
| `RESET_TOKEN_EXPIRE_MINUTES` | `30` | Password-reset link lifetime |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins |
| `FRONTEND_URL` | `http://localhost:5173` | Used to build links in transactional emails |
| `MAX_UPLOAD_SIZE_MB` | `10` | File upload size cap |
| `UPLOAD_TEMP_DIR` | `/tmp/voltura_uploads` | Scratch space during file parsing |
| `RATE_LIMIT_LOGIN` | `5/minute` | Login endpoint rate limit (slowapi syntax) |
| `LOG_LEVEL` | `INFO` | Python logging level |
| `LOG_JSON` | `true` | Structured JSON logs (set `false` for readable dev logs) |
| `SUPERADMIN_EMAIL` / `_PASSWORD` / `_NAME` | see `.env.example` | First-boot seed account — change the password immediately |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | Must match the backend's `API_V1_PREFIX` |
| `VITE_API_TIMEOUT` | `15000` | Axios request timeout (ms) |
| `VITE_APP_NAME` | `Voltura` | Shown in the UI |
| `VITE_APP_ENV` | `development` | `development` or `production` |
| `VITE_USE_MOCK_API` | `true` | `true` = use in-memory seed data, no backend needed; `false` = hit the real API |
| `VITE_ACCESS_TOKEN_KEY` | `voltura_access_token` | localStorage key (rarely needs changing) |
| `VITE_REFRESH_TOKEN_KEY` | `voltura_refresh_token` | localStorage key (rarely needs changing) |

Vite only exposes variables prefixed `VITE_` to client code — this is a Vite
constraint, not a Voltura one; never put secrets in frontend env vars, since
anything here ships in the built JS bundle.

---

## 6. Project structure explanation

### `backend/app/`

```
core/          settings (Pydantic), JWT + password hashing, RBAC permission
               matrix, structured logging, domain exception hierarchy
db/            SQLAlchemy engine/session, declarative base + mixins
               (UUID PK, timestamps, soft delete), first-boot seeding
models/        ORM models — one file per domain (user, power_purchase,
               billing, alert, file_upload, ...)
schemas/       Pydantic request/response DTOs — never expose ORM models
               directly over the API
repositories/  data access layer; routes/services never write raw
               SQLAlchemy queries outside this layer
services/      business logic — amount calculations, status-transition
               guards, cross-domain aggregation (analytics), file
               ingestion validation
api/v1/        route handlers + deps.py (auth/RBAC/pagination dependencies)
middleware/    request logging, global exception handler, rate limiting
tasks/         background-job entry points (alert evaluation, report
               rendering) — invoked on a schedule in production
```

Why this layering: a route file should only ever know about HTTP (parsing
the request, calling a service, shaping the response). A service should
only know about business rules, not SQL. A repository should only know
about persistence, not business rules. This means the service layer is
fully unit-testable without a database, and swapping the ORM or even the
web framework later touches only one layer at a time.

### `frontend/src/`

```
components/    pure, reusable, domain-agnostic UI (Button, Card, Modal,
               DataTable, chart widgets) — no API calls, no business logic
features/      domain-driven slices — one folder per domain (auth,
               dashboard, analytics, reports, users, alerts, uploads),
               each with api/ (Axios calls matching backend routes
               exactly) and hooks/ (React state wrapping those calls)
pages/         route-level composition — assembles layout + features +
               components, minimal logic of its own
layouts/       DashboardLayout (sidebar + navbar shell), AuthLayout
routes/        route tree, ProtectedRoute (auth guard), RoleBasedRoute
               (permission guard), centralized route path constants
store/         Zustand stores — auth, theme, UI state (sidebar collapse)
mocks/         seed data + mock API client, shaped identically to real
               backend responses so toggling VITE_USE_MOCK_API is a
               non-event for any component
```

The `components` vs `features` vs `pages` split is deliberate: `components`
never imports an API module; `features` owns API/data concerns per domain;
`pages` wires them together for a specific route. This keeps a reusable
`<DataTable>` reusable across every domain instead of becoming
billing-specific by accident.

---

## 7. Deployment

### Backend deployment (Docker — any host that runs containers)

```bash
cd backend
docker build -t voltura-api .
docker run -d \
  --name voltura-api \
  -p 8000:8000 \
  --env-file .env.production \
  voltura-api
```

Then run migrations against the production database once (not on every
container start, to avoid race conditions with multiple replicas):
```bash
docker run --rm --env-file .env.production voltura-api alembic upgrade head
```

**Platform-specific notes:**
- **Render / Railway / Fly.io** — point them at `backend/Dockerfile` directly; set env vars in their dashboard; add a managed Postgres add-on and use its connection string for `DATABASE_URL`.
- **AWS (ECS/Fargate)** — push the image to ECR, run behind an ALB, use RDS for Postgres. Set `APP_ENV=production` so `/docs` and `/redoc` are disabled.
- **Bare VM** — run via `docker compose` with the production env file, or run `uvicorn` directly behind nginx/Caddy as a reverse proxy + TLS terminator. Don't run the dev server (`--reload`) in production.

**Production checklist:**
- [ ] `JWT_SECRET_KEY` is a long random value, not the placeholder
- [ ] `APP_ENV=production` (disables `/docs`, `/redoc`)
- [ ] `DEBUG=false`
- [ ] `CORS_ORIGINS` is your actual frontend domain, not `localhost`
- [ ] `SUPERADMIN_PASSWORD` changed immediately after first login
- [ ] Database backups configured (this app does not manage its own backups)
- [ ] A real email provider wired into `app/utils/email.py` (currently logs instead of sending — see the comment in that file)

### Frontend deployment (static hosting — Vercel, Netlify, Cloudflare Pages, S3+CloudFront, or any static host)

```bash
cd frontend
npm install
npm run build      # outputs to frontend/dist/
```

`dist/` is a fully static build — deploy it to any static host:

- **Vercel / Netlify** — connect the repo, set build command `npm run build`, output directory `dist`, and set `VITE_API_BASE_URL` / `VITE_USE_MOCK_API=false` as environment variables in their dashboard. Both platforms auto-detect Vite projects.
- **S3 + CloudFront** — `aws s3 sync dist/ s3://your-bucket --delete`, invalidate the CloudFront distribution after each deploy.
- **Any nginx/Caddy host** — serve `dist/` as static files; since this is a client-side-routed SPA, configure a fallback to `index.html` for unknown paths (e.g. nginx `try_files $uri /index.html;`).

**Production checklist:**
- [ ] `VITE_USE_MOCK_API=false`
- [ ] `VITE_API_BASE_URL` points at your deployed backend's `/api/v1`
- [ ] Backend's `CORS_ORIGINS` includes this frontend's deployed domain
- [ ] HTTPS on both frontend and backend (mixed content will break the API calls otherwise)

---

## 8. Default credentials (development only)

After running migrations, a Super Admin account is seeded from
`backend/.env`:

```
Email:    superadmin@voltura.com   (SUPERADMIN_EMAIL)
Password: ChangeMe123!             (SUPERADMIN_PASSWORD)
```

Change this password immediately in any environment other than local
development. In mock-mode (frontend only, no backend), every seeded user
in `frontend/src/mocks/seedData.js` uses the password `Password123!` — this
applies only when `VITE_USE_MOCK_API=true` and has no bearing on the real
backend's credentials.

---

## 9. Further reading

- `backend/README.md` — backend-specific detail, Alembic migration commands
- `frontend/docs/API_RESPONSES.md` — sample request/response payloads for every endpoint
- Swagger UI at `http://localhost:8000/docs` once the backend is running — the authoritative, always-current API reference
