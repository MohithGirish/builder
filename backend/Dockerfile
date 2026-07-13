# ── Stage 1: dependencies ─────────────────────────────────────────────────────
FROM node:24-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# ── Stage 2: development ──────────────────────────────────────────────────────
FROM node:24-alpine AS development

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 5000
CMD ["npm", "run", "dev"]

# ── Stage 3: production ───────────────────────────────────────────────────────
FROM node:24-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001

COPY --from=deps /app/node_modules ./node_modules
COPY --chown=nodeuser:nodejs . .

USER nodeuser
EXPOSE 5000

# Boot serves traffic and nothing else. Migrations are a RELEASE step, run once
# per deploy (`npm run db:migrate`) — running them here races across replicas.
# Seeding is never a boot step: `db:seed` inserts the E-Infra demo builder and
# its five showcase projects, and it throws when ADMIN_EMAIL/ADMIN_PASSWORD are
# unset, which would crash-loop the container.
CMD ["node", "src/server.js"]
