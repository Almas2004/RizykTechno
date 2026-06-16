# RizykTechno

Production-ready internet store for electronics: React client, catalog, cart, requests, admin panel, Express API, Prisma and PostgreSQL.

## Features

- Home, catalog, product page, cart, contacts and privacy policy
- Product search and price sorting
- Cart with quantities, total amount, contact form and WhatsApp order link
- Requests from cart are saved in PostgreSQL and shown in admin panel
- Manager login with JWT
- Product CRUD and product type management
- JPG, PNG, WebP uploads with file-size limit
- Rate limit, Helmet, CORS whitelist and strict API validation
- Docker Compose: app + PostgreSQL + NGINX

## Local Docker Run

```bash
copy .env.production.example .env.production
docker compose up -d --build
```

Before running, replace values in `.env.production`: `POSTGRES_PASSWORD`, `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLIENT_ORIGIN`.

## Local Development Without Docker

Requires PostgreSQL. Create `.env` from `.env.example`, set `DATABASE_URL`, then:

```bash
npm install
npx prisma generate
npm run db:migrate
npm run db:seed
npm run dev
```

Site: http://localhost:5173  
API: http://localhost:4000/api  
Admin: http://localhost:5173/admin

## CI/CD

Workflow: `.github/workflows/deploy.yml`.

The workflow uploads the project to `~/rizyktechno` on the VPS user account and runs Docker Compose there.

Required GitHub repository secrets:

- `VPS_HOST`
- `VPS_PORT`
- `VPS_USER`
- `VPS_SSH_KEY`
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `CLIENT_ORIGIN`

The first four secrets are for SSH access. The remaining five are required for the production app and database. `CLIENT_ORIGIN` should be your production domain, for example `https://example.kz`.

Deploy runs automatically on every push to `main`, and can also be started manually from GitHub Actions.

## Important About Products

Products added on the server stay in the production PostgreSQL Docker volume. Product photos stay in the `uploads_data` Docker volume. Ordinary deploys do not delete these volumes.

Do not run destructive commands like:

```bash
docker compose down -v
docker volume rm ...
```

Those commands remove production data.

## Production Files

- `Dockerfile`
- `docker-compose.yml`
- `deploy/nginx.conf`
- `.env.production.example`
- `ecosystem.config.cjs` for PM2 deployment without Docker

Details: `deploy/README.md`.

## Security

- Do not commit `.env` or `.env.production`.
- `JWT_SECRET` must be a long random value.
- `ADMIN_PASSWORD` is configured only through environment variables.
- Back up PostgreSQL and uploads volumes regularly.
