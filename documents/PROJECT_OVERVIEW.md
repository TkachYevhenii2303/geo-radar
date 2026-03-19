# Project Overview

GEO Radar it's a web analytics & SEO monitoring tool.

## Architecture

### Backend (NestJS)

- **Location**: `apps/api/`
- **Frameworks**: NestJS + TypeScript
- **Database**: PostgreSQL 16 + TypeORM 0.3
- **Architecture**: Modular (feature-based NestJS modules)
- **Documentation**: Swagger UI at `http://localhost:8080/api/docs`

#### Key Modules

Each feature is a self-contained NestJS module in `apps/api/src/modules/`

- **[authModule](../apps/api/src/modules/auth/)** - auth functions, token management
- **[healthModule](../apps/api/src/modules/health/)** - health checks via @nestjs/terminus'

#### Module Pattern

Each module follows:

```
module.ts → controller.ts → service.ts
controller.spec.ts
entities/
dto/
```

#### Global Configuration

- **[Error handling](../apps/api/src/configs/handlers/global-error-handler.filter.ts)** - Global error handling
- **[Database config](../apps/api/src/configs/database/typeorm.config.ts)** - Config for database connection
- **[Throttling](../apps/api/src/app.module.ts)** - 100 requests/min default
- **[CORS](../apps/api/src/main.ts)** - Configurable origins

### Frontend (NextJS)

- **Location**: `apps/ui/`
- **Frameworks**: NextJS + TypeScript
- **UI Library**: Mantine 8 + TailwindCSS 4
- **State Management**: React Context
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

#### Route Groups (NextKS app Router)

- **[(auth)](<../apps/ui/app/(auth)/>)** - public routes: `/login`, `/signup`
- **[(protected)](<../apps/ui/app/(protected)/>)** authenticated routes: `/`, `/health`

#### UI app Directories

- [components](../apps/ui/components/) - Feature-based components: `auth/`, `health/`, `shared/`
- [context](../apps/ui/context/) - React contexts
- [services](../apps/ui/api/) - Axios-based API client services
- [middleware](../apps/ui/middleware.ts) - Route protection with refresh token validation
- [libs](../apps/ui/lib/) - Shared utility libraries
- [hooks](../apps/ui/hooks/) - Custom React hooks

### Database

- **Engine**: PostgreSQL 16 (via Docker)
- **ORM**: TypeORM 0.3 with repository pattern
- **Connection config**: `apps/api/src/configs/database/typeorm.config.ts`

#### Environment Variables

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=geo_radar_database
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
```

### Tests

- **Framework**: Jest + ts-jest
- **Unit test files**: `*.spec.ts` alongside source files
- **E2E test files**: `*.e2e-spec.ts` in `apps/api/test/`
- **E2E config**: `apps/api/test/jest-e2e.json`
- **k6 config** `apps/api/k6`

#### Test Commands

```bash
yarn test            # run all unit tests
yarn test:watch      # watch mode
yarn test:cov        # coverage report (output: ../coverage)
yarn test:debug      # debug mode
yarn test:e2e        # e2e tests
```
