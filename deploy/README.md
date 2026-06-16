# Production Deploy

1. Create `.env.production` from `.env.production.example`.
2. Set strong values for `POSTGRES_PASSWORD`, `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
3. Point your domain DNS A record to the VPS. Caddy will issue and renew Let's Encrypt certificates automatically.
4. Run:

```bash
docker compose up -d --build
```

The app container runs Prisma migrations, seeds the admin/products, and starts the Node server. Uploaded files are stored in the `uploads_data` Docker volume. Back up both `postgres_data` and `uploads_data`.
