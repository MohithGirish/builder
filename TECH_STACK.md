# Tech Stack — Builder AI Platform

> Two-sided AI matchmaking marketplace connecting Builders and Investors through scored compatibility and real-time deal collaboration.

---

## Frontend

| Layer | Technology | Version | Role |
|-------|-----------|---------|------|
| UI Framework | **React** | 18.3 | Component tree, virtual DOM rendering |
| Build Tool | **Vite** | 5.4 | ES-module dev server, optimized production bundles |
| Routing | **React Router DOM** | v6 | Client-side SPA routing with nested layouts |
| Styling | **Tailwind CSS** | 3.4 | Utility-first CSS, zero-runtime design tokens |
| Icons | **Lucide React** | 0.446 | Consistent SVG icon system |
| Real-Time Client | **Socket.io-client** | 4.8 | Bidirectional WebSocket transport for dealroom chat |
| Production Server | **Nginx** | (alpine) | Static asset serving inside Docker container |

**Design Philosophy:** Premium minimalist aesthetic — high-contrast typography, ample whitespace, modular component library (`<ProjectCard />`, `<MatchScoreBadge />`, `<FilterSidebar />`).

---

## Backend API

| Layer | Technology | Version | Role |
|-------|-----------|---------|------|
| Runtime | **Node.js** | LTS | Event-loop server, non-blocking I/O |
| Framework | **Express** | 4.19 | HTTP routing, middleware pipeline |
| Authentication | **JSON Web Tokens (JWT)** | jsonwebtoken 9.0 | Stateless auth with access + refresh token rotation |
| Password Hashing | **bcryptjs** | 2.4 | Adaptive cost-factor password storage |
| ORM | **Sequelize** | 6.37 | Model definitions, associations, query abstraction |
| DB Driver | **pg** | 8.11 | Native PostgreSQL wire protocol |
| Migrations | **sequelize-cli** | 6.6 | Version-controlled schema migration files |
| Input Validation | **Joi** | 17.13 | Schema-based request body validation |
| Real-Time Server | **Socket.io** | 4.8 | WebSocket event bus; message persistence to DB |
| File Uploads | **Multer** | 1.4 | Multipart form-data handling |
| Security Headers | **Helmet** | 7.1 | Sets hardened HTTP response headers |
| Rate Limiting | **express-rate-limit** | 7.3 | Per-IP throttling on auth and API routes |
| Logging | **Morgan** | 1.10 | HTTP access log middleware |
| Testing | **Jest + Supertest** | 29.7 / 7.0 | Unit and integration tests, in-process HTTP assertions |
| Dev Reload | **Nodemon** | 3.1 | File-watch restart in development |

**Auth architecture:** RBAC middleware guards every protected route, enforcing role claims (`Builder` / `Investor` / `Admin`) from the JWT payload before the controller runs.

---

## AI Matchmaking Microservice

| Layer | Technology | Version | Role |
|-------|-----------|---------|------|
| Language | **Python** | 3.x | Scoring algorithms, ML-ready isolation |
| Framework | **FastAPI** | 0.115 | Async REST API with auto-generated OpenAPI docs |
| ASGI Server | **Uvicorn** | 0.32 | High-performance async server with lifespan hooks |
| Data Validation | **Pydantic v2** | ≥ 2.10 | Request/response schema enforcement, type coercion |
| Config | **pydantic-settings** | ≥ 2.6 | `.env`-driven settings with typed model |
| Testing | **pytest + pytest-asyncio** | 8.3 / 0.24 | 59/59 async test coverage |
| HTTP Test Client | **httpx** | 0.27 | ASGI-native async test transport |

**Scoring model:** 5-dimension weighted engine — `Sector` · `Location` · `Investment Range` · `ROI Expectation` · `Risk Tolerance` — normalised to a 100-point `compatibility_score` with a `breakdown` JSON payload. Consumed by the Node.js backend via internal REST call.

---

## Data Layer

| Store | Technology | Version | Role |
|-------|-----------|---------|------|
| Primary Database | **PostgreSQL** | 16 (alpine) | All relational data: users, projects, dealrooms, messages |
| Cache / Pub-Sub | **Redis** | 7 (alpine) | WebSocket session state, token blacklisting, caching |

**Persistence guarantees:** Redis runs with `appendonly yes` (AOF). Every Socket.io chat message is also written to PostgreSQL for durable message history and offline catch-up on reconnect.

---

## Infrastructure & DevOps

| Concern | Technology | Details |
|---------|-----------|---------|
| Containerisation | **Docker** | Each service has its own `Dockerfile` with dev/prod multi-stage builds |
| Orchestration (local) | **Docker Compose** | Single `docker-compose.yml` spins up all 5 services with health checks |
| Cloud — Frontend | **AWS Amplify** | CI/CD-connected static + SSR hosting |
| Cloud — Backend | **AWS Elastic Beanstalk / ECS** | Managed container or PaaS deployment target |
| Reverse Proxy | **Nginx** | Production frontend container; proxies `/api` to backend |
| Secrets | **`.env` files** | Never committed; injected at runtime via `env_file` in Compose |

**Network topology (local):** All containers share a private `builder_net` bridge network. Only ports `3000`, `5000`, `8000`, `5432`, and `6379` are published to the host.

---

## Architecture at a Glance

```
Browser
  │  HTTP/WS
  ▼
Nginx (port 3000)          ← React SPA (Vite build)
  │  /api/*  →  REST
  ▼
Node.js / Express (port 5000)
  │  JWT · RBAC · Sequelize
  ├── PostgreSQL (port 5432)   ← persistent storage
  ├── Redis (port 6379)        ← WebSocket state / cache
  ├── Socket.io                ← real-time dealroom events
  └── internal REST  →  FastAPI AI Service (port 8000)
                              └── 5-dim compatibility score
```

---

## Key Design Decisions

- **Microservice boundary on AI:** Scoring logic is fully isolated in Python, callable by any consumer. Lets the model layer evolve (classical weights today, ML tomorrow) without touching the Node.js codebase.
- **Stateless auth at scale:** JWT + refresh-token rotation means zero server-side session state — horizontally scalable from day one.
- **Real-time with persistence:** Socket.io events write to PostgreSQL, so no message is lost on disconnect; clients request missed history on reconnect.
- **Docker-first parity:** Local Compose setup mirrors the AWS production topology, eliminating environment drift between dev and prod.
