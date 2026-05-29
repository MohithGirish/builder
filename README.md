# Builder AI — Two-Sided AI Matchmaking Platform

A marketplace that connects **Builders** (founders, makers) with **Investors** through AI-driven compatibility scoring and secure real-time deal collaboration.

---

## What It Does

- Builders list projects and get matched with investors based on sector, location, investment range, ROI expectations, and risk tolerance
- Investors browse a scored discovery feed and manage their portfolio pipeline
- Both sides collaborate inside private **Dealrooms** — real-time chat with persistent message history
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
  ├── Redis     (port 6379)     ← WebSocket state / cache
  ├── Socket.io                 ← real-time dealroom events
  └── internal REST  →  FastAPI AI Service (port 8000)
                               └── 5-dimension compatibility score
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend | Node.js, Express, Sequelize ORM, Socket.io |
| Auth | JWT (access + refresh token rotation), RBAC middleware |
| AI Engine | Python, FastAPI, Pydantic v2, Uvicorn |
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
│   │   ├── socket/       # Socket.io dealroom handlers
│   │   └── services/
│   └── db/migrations/
├── ai_service/        # Python FastAPI scoring microservice
│   └── app/
├── docker-compose.yml
└── TECH_STACK.md
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
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
DB_HOST=postgres
DB_NAME=builder_ai_db
DB_USER=builder_admin
DB_PASSWORD=builder_secret_dev
REDIS_HOST=redis
AI_SERVICE_URL=http://ai_service:8000
```

### 3. Start all services

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| AI Engine | http://localhost:8000 |
| API Docs (FastAPI) | http://localhost:8000/docs |

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
| **Builder** | Create and manage projects, view match scores, access dealrooms |
| **Investor** | Browse discovery feed, view scored matches, manage portfolio, access dealrooms |
| **Admin** | Platform oversight and user management |

---

## AI Scoring Model

The matchmaking engine scores Builder–Investor compatibility across 5 dimensions, normalised to 100 points:

| Dimension | Weight |
|---|---|
| Sector alignment | 30% |
| Location preference | 20% |
| Investment range fit | 20% |
| ROI expectation match | 15% |
| Risk tolerance alignment | 15% |

The Node.js backend calls the AI service internally and returns a `compatibility_score` and `breakdown` object to the frontend.

---

## Key Features

- **Discovery pages** — searchable, filterable directories for Builders, Investors, and Projects
- **Dealrooms** — private real-time chat rooms with file sharing and full message persistence
- **Dashboards** — KPI cards, match lists, and SVG analytics charts for both roles
- **Interactive map** — Leaflet-powered project location map
- **Auth** — JWT with refresh token rotation, protected routes, role-aware navigation

---

## License

Private — LayeredAI Inc.
