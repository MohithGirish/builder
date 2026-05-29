# Project: Two-Sided AI Matchmaking Platform (Builders & Investors)

## 1. Project Overview
This project is a marketplace designed to connect "Builders" with "Investors" through AI-driven scoring and secure, real-time collaboration dealrooms. 

**Core User Roles:**
- `Builder`: Creates projects, seeks investment.
- `Investor`: Browses builders/projects, manages portfolio.
- `Admin`: Platform oversight.

## 2. Tech Stack Definition
- **Frontend:** React.js
- **Backend:** Node.js (Express/NestJS)
- **AI Microservice:** Python (FastAPI/Flask)
- **Database:** PostgreSQL (Relational data, Users, Projects) + Redis (WebSocket state/caching)
- **Real-Time:** WebSockets (Socket.io)
- **Infrastructure/Cloud:** AWS (Amplify for FE, Elastic Beanstalk/ECS for BE), Docker
- **Version Control:** Git

## 3. Architectural Rules & Boundaries

### Frontend (React.js)
- **Design System:** Enforce a premium, minimalistic visual aesthetic throughout the UI. Prioritize clean typography, ample whitespace, and high-contrast elements suitable for professional dealmaking.
- **Component Structure:** Build highly modular, reusable UI components (e.g., `<ProjectCard />`, `<MatchScoreBadge />`, `<FilterSidebar />`).
- **State Management:** Keep state as localized as possible. Use React Context only for global states like User Authentication and Theme.

### Backend (Node.js)
- **Authentication:** Strict implementation of JWT for stateless authentication.
- **Middleware:** All protected routes MUST pass through RBAC (Role-Based Access Control) middleware verifying the user's role (`Builder`, `Investor`, or `Admin`).
- **Performance:** Target sub-200ms response times for all standard CRUD operations.

### AI Matchmaking Engine (Python Microservice)
- Isolate the scoring logic (Sector, Location, ROI, Risk) into a dedicated Python microservice. 
- The Node.js backend should communicate with this service via internal REST APIs to fetch `compatibility_score` and `breakdown` JSON objects.

### Real-Time Dealroom (WebSockets)
- Ensure message persistence. All chat messages must be written to the database.
- Handle state recovery gracefully (e.g., fetching missed messages if a client temporarily disconnects).
- Isolate real-time events from standard HTTP traffic.

## 4. Development Workflow & Standards
- **Docker First:** All services (Frontend, Backend, AI Engine, Database) must run locally via `docker-compose`. Ensure Dockerfiles mimic the target AWS production environment as closely as possible.
- **Git Practices:** Write clear, descriptive commit messages. Keep commits scoped to specific features or fixes.
- **Security:** Never hardcode secrets, API keys, or JWT secrets. Always utilize `.env` files and strictly mock these variables in testing environments.

## 5. Agent Instructions (Claude Code)
When asked to write code or execute commands:
1. Always check the current directory context and `package.json`/`requirements.txt` before installing new dependencies.
2. If modifying the database schema, generate the corresponding migration files automatically.
3. Prioritize writing clean, documented code over quick hacks. Include JSDoc/Docstrings for complex business logic, especially in the matchmaking algorithms and WebSocket handlers.

## 6. File Documentation Rule (MANDATORY)
Every new source file created in this project MUST have a documentation comment block at the very top, before any imports or code. This rule applies to all files without exception.

- **`.jsx` / `.js` files:** Use a `/* ... */` block comment
- **`.py` files:** Use a triple-quoted `"""..."""` docstring
- **`.css` files:** Use a `/* ... */` block comment
- **`.json` files:** Skip — JSON does not support comments

The comment must cover (3–8 lines, plain English, no emojis):
- What the module/component is and its purpose
- What it exports or renders
- Its key responsibilities

Example for a React component:
```js
/*
 * ProjectCard.jsx — Reusable card component for displaying project summaries.
 *
 * Renders a project's title, builder name, location, funding progress bar,
 * sector tag, and a link to the project detail page. Accepts a single `project`
 * prop matching the PROJECTS data shape. Used in the Projects page and the
 * Home page discovery section.
 */
```