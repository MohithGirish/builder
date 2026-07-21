# Builder AI — Two-Sided AI Matchmaking Platform

A marketplace that connects **Builders** (founders, makers) with **Investors** through AI-driven compatibility scoring and secure real-time deal collaboration.

---

## What It Does

- Builders list projects and get matched with investors based on sector, location, investment range, ROI expectations, and risk tolerance
- Investors browse a scored discovery feed, request quotes on projects, and manage their portfolio pipeline
- Admins review builder verification submissions and oversee users and projects from an admin console
- An AI microservice calculates a 100-point **compatibility score** with a full breakdown for every Builder–Investor pair

---

## Architecture

```
Browser
  │  HTTP / WebSocket
  ▼
React SPA (Vite dev server, port 3000)   ← run locally, not containerized
  │  /api/*  →  proxied to :5000
  ▼
Node.js / Express (port 5000)            ← Docker
  │  JWT · RBAC · Sequelize
  ├── PostgreSQL (port 5432)    ← Docker · persistent storage
  ├── Redis     (port 6379)     ← Docker · cache
  └── Socket.io                 ← quote + verification notifications

FastAPI AI Service (ai_service/, port 8000)   ← not deployed
  └── 5-dimension compatibility score, no backend call site yet
```

Docker Compose runs the backend, PostgreSQL, and Redis. The frontend and the AI
service are run directly on the host.

The diagram above is the **local development** shape. Production differs — see
Deployment below.

---

## Deployment

Live on AWS in `ap-south-1` (Mumbai) since 2026-07-21.

| Surface | Where |
|---|---|
| Frontend | AWS Amplify Hosting — auto-deploys on every push to `main` |
| API | CloudFront → EC2 (`t3.micro`, Docker) |
| Database | PostgreSQL 16 container on the same instance, **no public port** |
| Cache | Redis 7 container, **no public port** |
| Secrets | SSM Parameter Store, injected at deploy time — never committed |

```
Browser
  ├─► Amplify Hosting            static SPA
  └─► CloudFront                 TLS termination for the API (no caching)
        │  http :80  — security group admits CloudFront edges only
        ▼
      EC2  ── Express ── PostgreSQL + Redis (private bridge network)
```

CloudFront fronts the API purely to terminate TLS: browsers block `fetch()` from
an HTTPS page to an HTTP origin, and Let's Encrypt will not issue certificates
for `*.amazonaws.com`, so with no custom domain this is the only zero-cost path.
It also carries the Socket.io WebSocket upgrade and the SSE onboarding stream —
hence its raised 60s origin read timeout.

**Deploying the backend.** There is no SSH access and no key pair; the instance
is driven entirely through SSM Send-Command:

```bash
aws ssm send-command --region ap-south-1 --instance-ids <instance-id> \
  --document-name AWS-RunShellScript \
  --parameters 'commands=["bash /opt/builderai/scripts/deploy-ec2.sh"]'
```

`scripts/deploy-ec2.sh` rebuilds `.env` from SSM, fast-forwards to `origin/main`,
rebuilds the containers, then runs migrations as an explicit release step.
`scripts/ec2-bootstrap.sh` is the instance user-data, and `scripts/backup-db.sh`
runs nightly via a systemd timer, shipping a verified `pg_dump` to S3.

Resource IDs, costs, and teardown order live in `claude-workspace/`, which is
gitignored — this repository is public.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express, Sequelize ORM, Socket.io |
| Auth | JWT (access + refresh token rotation), RBAC middleware |
| AI Engine | Python, FastAPI, Pydantic v2, Uvicorn |
| AI Onboarding | Claude conversational chat (`@anthropic-ai/sdk`, `claude-haiku-4-5`) — optional, with scripted fallback |
| Maps | Leaflet/OpenStreetMap (landing) · Google Maps Embed (project & profile) |
| Database | PostgreSQL 16 |
| Cache | Redis 7 (AOF persistence) |
| Infrastructure | Docker, Docker Compose, Nginx |
| Cloud target | AWS Amplify (FE), Elastic Beanstalk / ECS (BE) |

---

## Project Structure

```
builder_ai/
├── frontend/          # React + Vite SPA
├── backend/           # Node.js / Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/   # JWT auth, RBAC
│   │   ├── models/       # Sequelize models
│   │   ├── socket/       # Socket.io — quote + verification notifications
│   │   └── services/
│   └── db/migrations/
├── ai_service/        # Python FastAPI scoring microservice (standalone, not deployed)
│   └── app/
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- Git

### 1. Clone the repo

```bash
git clone git@github.com:LayeredAI-Inc/builderai.git
cd builderai
```

### 2. Set up environment variables

Copy the example env files and fill in your values:

```bash
cp backend/.env.example  backend/.env
cp frontend/.env.example frontend/.env.local
cp ai_service/.env.example ai_service/.env      # only if running the AI service
```

Every variable the code actually reads is listed below. Anything marked *optional*
has a working fallback — the app boots without it.

#### `backend/.env` — required

| Variable | Notes |
|---|---|
| `JWT_ACCESS_SECRET` | Signs the 15-minute access token. Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `DB_HOST` `DB_PORT` `DB_NAME` `DB_USER` `DB_PASSWORD` | PostgreSQL. Use `DB_HOST=postgres` under Docker Compose, `localhost` otherwise. |

> There is **no** `JWT_REFRESH_SECRET`. Refresh tokens are opaque random hex stored
> in the `refresh_tokens` table, not JWTs — there is nothing to sign them with.

#### `backend/.env` — optional

| Variable | Default behaviour if unset |
|---|---|
| `DATABASE_URL` | Alternative to the discrete `DB_*` vars; **takes precedence** over them. Managed hosts (RDS, Neon, Render) hand you this. |
| `REDIS_HOST` `REDIS_PORT` | No Redis → in-memory cache fallback. `REDIS_HOST=redis` under Compose. |
| `ADMIN_EMAIL` `ADMIN_PASSWORD` | **Required for `npm run db:seed`** — seeding throws if unset. Without an admin, `/admin` is unreachable and builder verifications can't be approved. The seeder refuses to escalate a pre-existing non-admin account under that email, and treats a *changed* `ADMIN_EMAIL` as a rename of the existing admin. |
| `EINFRA_PASSWORD` | Password for the seeded `builder@e-infra.in` showcase builder. **Mandatory when `NODE_ENV=production`.** Outside production the seeder falls back to a literal that is in public git history — that fallback must never reach a deployed environment, because the account is a verified builder that can read every quote request raised against its projects. |
| `DB_SSL` | Set to `false` only when PostgreSQL is co-located and unreachable from outside (e.g. the compose container, which does not speak SSL and fails with *"The server does not support SSL connections"*). Defaults to SSL **on** in production, which is what a managed database needs. |
| `ANTHROPIC_API_KEY` | AI onboarding chat is disabled; onboarding falls back to scripted questions. Standalone toggle, not tied to any account. |
| `EMAIL_USER` `EMAIL_PASS` | Quote emails are logged to the console instead of sent. Gmail address + 16-char **App Password** (needs 2FA on the Google account). |
| `FRONTEND_URL` | `http://localhost:3000`. Used to build email deep-links. |
| `WHATSAPP_PHONE_NUMBER_ID` `WHATSAPP_ACCESS_TOKEN` `WHATSAPP_API_VERSION` `WHATSAPP_TEMPLATE_NAME` `WHATSAPP_DEFAULT_COUNTRY_CODE` | WhatsApp quote confirmations are logged to console instead of sent. Credentials come from Meta for Developers → WhatsApp → API Setup. |
| `ALLOWED_ORIGINS` | `http://localhost:3000`. Comma-separated CORS allowlist. |
| `BCRYPT_ROUNDS` `RATE_LIMIT_WINDOW_MS` `RATE_LIMIT_MAX_REQUESTS` `AUTH_RATE_LIMIT_MAX` | Sane defaults (12 rounds; 100 req / 15 min; 10 auth req / 15 min). |
| `QUOTE_RATE_LIMIT_MAX` | `10` per 15 min. Caps the **public** `POST /quotes` and `POST /quotes/site-visit`. Both are unauthenticated and each sends mail to a *caller-supplied* address, so under the global limit alone they act as an open relay. Authenticated GETs on that router are exempt. |
| `TRUST_PROXY_HOPS` | `1`. Reverse-proxy hops in front of the app, so rate limiting sees real client IPs. Production only. |
| `NODE_ENV` `PORT` | `development`, `5000`. |

#### `frontend/.env.local`

Vite exposes these **to the browser** — never put a secret here.

| Variable | Notes |
|---|---|
| `VITE_BACKEND_URL` | Leave **empty** for same-origin; in dev the Vite proxy forwards `/api` to `:5000`. Set only if the API is on another origin. |
| `VITE_GOOGLE_MAPS_API_KEY` | *Optional.* Google **Maps Embed API** key for the project-detail and profile maps; without it they fall back to a deep-link. Restrict by HTTP referrer. The landing-page map uses Leaflet/OpenStreetMap and needs no key. |

#### `ai_service/.env` — only if you run the AI service

Not needed for normal development: the backend has no call site for this service and it isn't in the Compose stack.

| Variable | Notes |
|---|---|
| `INTERNAL_API_KEY` | *Optional.* When set, `/api/v1/match/*` requires a matching `X-Internal-Api-Key` header. Leave blank in dev to disable enforcement. Must equal the backend's `AI_SERVICE_API_KEY` once the two are wired together. |
| `APP_PORT` `LOG_LEVEL` `ALLOWED_ORIGINS` | `8000`, `info`, localhost origins. |

> **Docker note:** the backend runs with `node_modules` in a named volume, so after adding a backend dependency, install it in the container (`docker compose exec backend npm install <pkg>`) or rebuild (`docker compose up -d --build backend`).

### 3. Start the backend stack

```bash
docker-compose up --build        # backend + PostgreSQL + Redis
```

### 4. Run database migrations

```bash
docker exec builder_ai_backend npx sequelize-cli db:migrate
```

### 5. Start the frontend

The frontend is **not** in the Compose stack — run the Vite dev server on the host
(it proxies `/api` to the backend on :5000):

```bash
cd frontend && npm install && npm run dev
```

| Service | URL | Runs in |
|---|---|---|
| Frontend | http://localhost:3000 | host (`npm run dev`) |
| Backend API | http://localhost:5000 | Docker |
| PostgreSQL | localhost:5432 | Docker |
| Redis | localhost:6379 | Docker |

The AI engine is not part of the Compose stack either. Run it standalone if you need it:
`cd ai_service && uvicorn app.main:app --port 8000` (docs at `/docs`).

---

## Running Tests

**AI Engine (59 tests):**

```bash
cd ai_service
pytest
```

**Backend:**

```bash
cd backend
npm test
```

---

## User Roles

| Role | Capabilities |
|---|---|
| **Builder** | Create and manage projects, view match scores, respond to quote requests |
| **Investor** | Browse discovery feed, view scored matches, manage portfolio |
| **Admin** | Review builder verifications, oversee users and projects, view platform metrics |

---

## AI Scoring Model

The matchmaking engine scores Builder–Investor compatibility across 5 dimensions, normalised to 100 points:

| Dimension | Points |
|---|---|
| Sector alignment | 25 |
| Location preference | 20 |
| Investment range fit | 25 |
| ROI expectation match | 20 |
| Risk tolerance alignment | 10 |

The service returns a `compatibility_score` and `breakdown` object. It is **not wired in yet** — the backend has no call site for it, and the match scores shown in the dashboards come from hard-coded mock data (`frontend/src/data/realProjects.js`).

---

## Key Features

- **Discovery pages** — searchable, filterable directories for Builders, Investors, and Projects
- **Projects from the database** — the project list, landing map, and detail pages read `GET /api/v1/projects` (public, optional auth), routed by slug; builders see their own drafts, anonymous visitors only see active/completed listings
- **Quote requests** — investors request quotes on projects (styled email confirmation to both sides), track them live in **My Quotes**, and can delete a request (a cancellation email is sent and the record is purged). Persisted in the `quotes` table
- **Admin console** — `/admin`, guarded by an env-seeded admin account: platform metrics, a builder-verification approve/reject queue, and user/project oversight
- **Dashboards** — KPI cards, match lists, and Recharts analytics for both roles
- **Dealroom** — Coming Soon placeholder; the Socket.io chat handlers and REST routes exist but are deliberately not registered
- **AI onboarding** — Claude-powered conversational preference gathering, with a scripted-question fallback when no API key is set
- **Builder verification** — post-onboarding step collecting India statutory credentials (state RERA registration, PAN, GSTIN, CIN/LLPIN) plus optional track-record documents and industry memberships; format-validated inline, skippable in dev, status surfaced on the profile
- **Role-based profile maps** — Google Maps embed showing an investor's target regions or a builder's project locations
- **Interactive map** — Leaflet-powered project location map on the landing page
- **Account management** — role switching and account deletion guarded by email + password re-authentication
- **Auth** — JWT with refresh token rotation, protected routes, role-aware navigation

---

## License

Private — LayeredAI Inc.
