# Production Deployment Checklist

This guide prepares the project for one server with two public domains:

- `kidgofun.com`
- `ttgo.shop`

Both domains serve the same storefront. Caddy handles HTTPS and routes Medusa API/Admin paths to the backend.

## 1. DNS

Create DNS records for both domains:

```text
kidgofun.com      A     <server-ip>
www.kidgofun.com  A     <server-ip>
ttgo.shop         A     <server-ip>
www.ttgo.shop     A     <server-ip>
```

Open server ports `80` and `443`. Do not expose Postgres, Redis, backend `9000`, or frontend `8000` directly.

## 2. Production Env

Generate the local production env file:

```bash
node scripts/generate-production-env.js
```

This writes `.env.production` with strong random values for:

- `POSTGRES_PASSWORD`
- `REDIS_PASSWORD`
- `JWT_SECRET`
- `COOKIE_SECRET`
- `CONTENT_ADMIN_SECRET`
- `CONTENT_MANAGER_KEY`
- `REVALIDATE_SECRET`

The file is ignored by git. Do not commit it or paste it into chat.

Important values:

```env
PRIMARY_DOMAIN=kidgofun.com
SECONDARY_DOMAIN=ttgo.shop
NEXT_PUBLIC_BASE_URL=https://kidgofun.com
STOREFRONT_BASE_URL=https://kidgofun.com
STORE_CORS=https://kidgofun.com,https://www.kidgofun.com,https://ttgo.shop,https://www.ttgo.shop
ADMIN_CORS=https://kidgofun.com,https://www.kidgofun.com,https://ttgo.shop,https://www.ttgo.shop
AUTH_CORS=https://kidgofun.com,https://www.kidgofun.com,https://ttgo.shop,https://www.ttgo.shop
```

The Medusa publishable key is public, but it must exist in the Medusa database and be linked to the storefront sales channel. Create it in Medusa Admin and set:

```env
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
```

Validate before deploy:

```bash
node scripts/validate-production-env.js
docker compose --env-file .env.production -f docker-compose.prod.yml config --quiet
```

Do not use local values such as `supersecret`, `123456`, `local-content-secret`, `auto`, or placeholder `replace_...` values.

## 3. First Deploy

Build and start:

```bash
node scripts/validate-production-env.js
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Run database migrations:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec medusa-backend npx medusa db:migrate
```

Create the first admin user:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec medusa-backend npx medusa user -e admin@kidgofun.com -p '<strong-password>'
```

If this is a fresh database and you want starter data, run seed once:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec medusa-backend npm run seed
```

If you created or changed `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` after the first frontend build, rebuild the frontend:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build medusa-frontend
```

## 4. URLs

Storefront:

```text
https://kidgofun.com
https://ttgo.shop
```

Medusa Admin:

```text
https://kidgofun.com/app
https://ttgo.shop/app
```

Storefront content manager:

```text
https://kidgofun.com/dk/content-manager?locale=en-US
https://kidgofun.com/dk/content-manager?locale=zh-CN
```

The Medusa Admin `Storefront Content` page opens these content-manager URLs.

## 5. Security Notes

- Keep `.env.production` out of git.
- Use unique secrets for `JWT_SECRET`, `COOKIE_SECRET`, `CONTENT_ADMIN_SECRET`, `CONTENT_MANAGER_KEY`, `REVALIDATE_SECRET`, `POSTGRES_PASSWORD`, and `REDIS_PASSWORD`.
- Keep `ENABLE_DEV_PUBLISHABLE_KEY_ENDPOINT=false`.
- Keep `AUTO_MIGRATE=false`, `AUTO_SEED=false`, and `AUTO_ADMIN_USER=false` in production.
- Keep `CONTENT_ADMIN_SECRET` and `CONTENT_MANAGER_KEY` different.
- Only ports `80` and `443` should be open publicly.
- Back up the `medusa-db-data` volume regularly.
- Prefer managed Postgres for production if available.
- Rotate `CONTENT_MANAGER_KEY` if it is shared accidentally.

## 6. Update Deploy

After pulling new code:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.production -f docker-compose.prod.yml exec medusa-backend npx medusa db:migrate
```

Check logs:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f medusa-backend medusa-frontend caddy
```
