# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This repository is a Dockerized Medusa v2 commerce backend plus a Next.js 15 storefront:

- `medusa-backend/` is the Medusa server and admin app, running on port `9000` with HMR on `9001` in Docker.
- `medusa-frontend/` is the Next.js storefront, running on port `8000`.
- Root `docker-compose.yml` starts Postgres 15, Redis 7, the backend, and the frontend. In development it auto-runs backend migrations, seeds demo data when no regions exist, creates an admin user, and lets the frontend fetch the publishable key automatically.

## Common commands

### Full stack with Docker

```bash
# Build and start Postgres, Redis, Medusa backend, and Next storefront
docker compose up --build

# Start in background
docker compose up -d --build

# Stop containers
docker compose down

# Stop containers and remove named volumes/database state
docker compose down -v
```

Default local URLs:

- Storefront: `http://localhost:8000`
- Medusa backend/admin: `http://localhost:9000`
- Default Docker admin credentials: `admin@example.com` / `supersecret` unless overridden with `MEDUSA_ADMIN_EMAIL` and `MEDUSA_ADMIN_PASSWORD`.

### Backend (`medusa-backend/`)

Use Node 20+. Commands below use `npm` because the Dockerfile and startup scripts use `npm ci` / `npm run`.

```bash
cd medusa-backend
npm ci
npm run dev
npm run build
npm run start
npm run seed
npm run test:unit
npm run test:integration:http
npm run test:integration:modules
```

Run a single backend Jest test by passing the file after `--`, for example:

```bash
cd medusa-backend
npm run test:integration:http -- integration-tests/http/health.spec.ts
npm run test:unit -- src/path/to/file.unit.spec.ts
```

The backend test selector is controlled by `TEST_TYPE` in `jest.config.js`:

- `test:integration:http` matches `integration-tests/http/*.spec.[jt]s`
- `test:integration:modules` matches `src/modules/*/__tests__/**/*.[jt]s`
- `test:unit` matches `src/**/__tests__/**/*.unit.spec.[jt]s`

### Frontend (`medusa-frontend/`)

Commands below use `npm` to match the Dockerfile and checked-in `package-lock.json`.

```bash
cd medusa-frontend
npm ci
npm run dev
npm run build
npm run start
npm run lint
npm run analyze
```

There is currently no frontend test script in `medusa-frontend/package.json`.

## Architecture notes

### Backend

- `medusa-backend/medusa-config.ts` loads env for the current `NODE_ENV` and wires Medusa to `DATABASE_URL`, `REDIS_URL`, CORS env vars, JWT secret, and cookie secret.
- Custom Medusa API routes live under `medusa-backend/src/api/**/route.ts`.
  - `src/api/store/site-content/route.ts` exposes GET/POST site-content endpoints.
  - `src/api/publishable-key/route.ts` exposes a development-only publishable key endpoint when `ENABLE_DEV_PUBLISHABLE_KEY_ENDPOINT=true`.
- `src/lib/site-content.ts` stores editable content blocks directly in Postgres using a `site_content_blocks` table created lazily by `CREATE TABLE IF NOT EXISTS`. Writes are protected by the `x-content-admin-secret` header when `CONTENT_ADMIN_SECRET` is set.
- `src/scripts/seed.ts` creates the minimum catalog data: store currencies, Europe region, tax regions, a default shipping profile required by products, publishable API key, product categories, and demo products.
- `scripts/docker-start.js` waits for Postgres/Redis, runs migrations unless `AUTO_MIGRATE=false`, seeds only when no regions exist unless `AUTO_SEED=false`, creates the configured admin user unless `AUTO_ADMIN_USER=false`, then starts `npm run dev`.

### Frontend

- The storefront uses the Next.js App Router under `medusa-frontend/src/app/[countryCode]`. The country code is part of most storefront routes.
- `src/middleware.ts` fetches Medusa regions from `${MEDUSA_BACKEND_URL}/store/regions`, maps country codes, sets `_medusa_cache_id`, and redirects bare paths to a country-prefixed path. `NEXT_PUBLIC_DEFAULT_REGION` defaults to `dk`.
- `src/lib/config.ts` creates the Medusa JS SDK client using `MEDUSA_BACKEND_URL` and `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, then wraps SDK fetches to include the `x-medusa-locale` header when available.
- `src/lib/data/*` contains server-side data access and server actions for products, regions, collections, categories, localization, and content.
- `src/modules/*` contains the remaining storefront UI modules and templates for catalog browsing, layout, products, collections, and shared components.
- `src/components/*` contains custom storefront/layout/home/PLP/shop components used by the customized homepage and product listing experience.
- Homepage fallback content and navigation data are in `src/lib/data/homepage.ts`; persisted overrides are read/written through `src/lib/data/site-content.ts` and the backend `/store/site-content` route.
- TypeScript path aliases are configured from `medusa-frontend/src`: `@components/*`, `@lib/*`, `@modules/*`, and `@pages/*`.
- `next.config.js` currently ignores ESLint and TypeScript errors during production builds, so run `npm run lint` and targeted TypeScript checks manually when correctness matters.

## Environment and local development details

- Docker Compose provides default local env values, including `DATABASE_URL`, `REDIS_URL`, CORS origins, `CONTENT_ADMIN_SECRET=local-content-secret`, and `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=auto`.
- The frontend Docker startup script (`medusa-frontend/scripts/docker-start.js`) calls the backend `/publishable-key` endpoint until a seeded publishable key is available, then starts Next on `0.0.0.0:8000`.
- The default seeded commerce region is Europe with country codes `gb`, `de`, `dk`, `se`, `fr`, `es`, and `it`; storefront paths generally need one of these country prefixes, such as `/dk`.
