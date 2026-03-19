# Claude.md file

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation Structure

Read these on-demand based on task relevance:

- **[PROJECT_OVERVIEW](./documents/PROJECT_OVERVIEW.md)** — Module breakdown, project structure and architecture, shared patterns

## Monorepo Map

```
apps/api/          — NestJS backend     (port 8080, prefix /api)
apps/ui/           — Next.js frontend   (port 3000, App Router)
apps/workers/      — background workers (placeholder)
libs/contracts/    — shared types/contracts (placeholder)
docker/            — Docker Compose (PostgreSQL 16)
documents/         — detailed reference docs
```

## Ports & Key URLs (Localhost)

| Module     | URL                              |
| ---------- | -------------------------------- |
| API        | `http://localhost:8080/api`      |
| Swagger UI | `http://localhost:8080/api/docs` |
| Frontend   | `http://localhost:3000`          |
| PostgreSQL | `localhost:5432`                 |

## Essential Commands

```bash
# Infrastructure — start first
cd docker && docker compose up -d

# Backend
cd apps/api && yarn install
yarn start:dev       # dev server
yarn test            # unit tests
yarn test:cov        # coverage
yarn test:e2e        # e2e tests
yarn build           # production build

# Frontend
cd apps/ui && yarn install
yarn dev             # dev server
yarn build           # production build

```

## Environment Variables

**API** (`apps/api/.env`):

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=geo_radar_database
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

FRONTEND_URLS=http://localhost:3000
```

**UI** (`apps/ui/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```
