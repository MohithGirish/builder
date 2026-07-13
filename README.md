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
Nginx (port 3000)               ← React SPA (Vite build)
  │  /api/*  →  REST
  ▼
Node.js / Express (port 5000)
  │  JWT · RBAC · Sequelize
  ├── PostgreSQL (port 5432)    ← persistent storage
  ├── Redis     (port 6379)     ← cache
  └── Socket.io                 ← quote + verification notifications

FastAPI AI Service (ai_service/, port 8000)   ← not deployed
  └── 5-dimension compatibility score, no backend call site yet
```

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
cp backend/.env.example backend/.env
cp ai_service/.env.example ai_service/.env
```

Key variables to set in `backend/.env`:

```env
JWT_ACCESS_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
DB_HOST=postgres
DB_NAME=builder_ai_db
DB_USER=builder_admin
DB_PASSWORD=builder_secret_dev
REDIS_HOST=redis
```

**Optional:**

- `ANTHROPIC_API_KEY` (in `backend/.env`) — enables the Claude-powered conversational onboarding chat. Leave it blank to use the scripted onboarding questions. It's a standalone toggle, not tied to any account.
- `VITE_GOOGLE_MAPS_API_KEY` (in `frontend/.env.local`) — Google Maps Embed key for the project-detail and profile maps. Without it those maps show a deep-link fallback.
- `INTERNAL_API_KEY` (in `ai_service/.env`) — when set, the AI service requires a matching `X-Internal-Api-Key` header on `/api/v1/match/*`; leave blank in dev to disable enforcement. Only relevant if you run the AI service standalone — the backend does not call it yet.

> **Docker note:** the backend runs with `node_modules` in a named volume, so after adding a backend dependency, install it in the container (`docker compose exec backend npm install <pkg>`) or rebuild (`docker compose up -d --build backend`).

### 3. Start all services

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |

The AI engine is not part of the Compose stack. Run it standalone if you need it:
`cd ai_service && uvicorn app.main:app --port 8000` (docs at `/docs`).

### 4. Run database migrations

```bash
docker exec builder_ai_backend npx sequelize-cli db:migrate
```

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
