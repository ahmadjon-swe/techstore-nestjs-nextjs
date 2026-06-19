# TechStore — Project Runbook

> Personal step-by-step guide for running this project in **development** and **production**.
> This file is git-ignored on purpose (it may contain real local values). Keep it private.

---

## 0. Prerequisites

Install these once on your machine:

| Tool | Version | Check |
|------|---------|-------|
| Node.js | ≥ 20 | `node -v` |
| pnpm | ≥ 9 (project pins 11.6.0) | `pnpm -v` |
| PostgreSQL | 16 (local) **or** Docker | `psql --version` |
| Docker + Compose | latest | `docker --version` |
| git | any | `git --version` |

If pnpm is missing, enable it via Corepack (ships with Node):

```bash
corepack enable
corepack prepare pnpm@11.6.0 --activate
```

---

## 1. Project layout (what lives where)

```
tech-store/
├─ apps/
│  ├─ api/      # NestJS REST API + Telegram bot   → http://localhost:4000
│  └─ web/      # Next.js storefront + admin panel  → http://localhost:3000
├─ packages/
│  ├─ db/       # Prisma schema, migrations, seed, generated client
│  ├─ types/    # shared zod schemas / DTOs
│  ├─ ui/       # shared React components
│  └─ config/   # shared tsconfig / prettier
├─ docker-compose.yml        # dev (Postgres on 5433)
├─ docker-compose.prod.yml   # production (nginx + 127.0.0.1 bindings)
└─ .env                      # your secrets (git-ignored)
```

**Ports**

| Service | Port |
|---------|------|
| Web (Next.js) | 3000 |
| API (NestJS) | 4000 |
| Postgres — local install | 5432 |
| Postgres — Docker (`docker-compose.yml`) | 5433 |

> ⚠️ Pick **one** database. This machine uses **local Postgres on 5432**, so `.env` must point at
> `5432`. The Docker DB (5433) is an alternative — don't mix them, or you'll migrate one and read
> from the other.

---

## 2. Development setup — first time, in order

### Step 1 — Go to the project root
```bash
cd ~/Desktop/projects/fullstacks/tech-store
```

### Step 2 — Install all dependencies
```bash
pnpm install
```
This installs every workspace (`apps/*`, `packages/*`) and links them together. Re-run it whenever
a `package.json` changes.

### Step 3 — Create the database

**Option A — local Postgres (this machine's setup):**
```bash
# create the database (only if it doesn't exist yet)
createdb -h localhost -p 5432 -U postgres techstore
# or inside psql:  CREATE DATABASE techstore;
```
Connection string you'll use everywhere:
```
postgresql://postgres:1111@localhost:5432/techstore
```

**Option B — Docker Postgres (alternative):**
```bash
docker compose up -d db --wait
```
That starts Postgres on **5433** with user/pass `techstore` / `password`. If you use this, your
`.env` `DATABASE_URL` must use port `5433`.

### Step 4 — Create your `.env`
```bash
cp .env.example .env
```
Then open `.env` and fill it. Annotated template (local-Postgres values):

```ini
# Database — MUST match where your Postgres actually runs
DATABASE_URL=postgresql://postgres:1111@localhost:5432/techstore
POSTGRES_PASSWORD=1111

# Auth — each secret MUST be ≥ 32 chars or the API refuses to boot.
# Generate strong ones:  openssl rand -base64 36
JWT_ACCESS_SECRET=<paste a 32+ char random string>
JWT_REFRESH_SECRET=<paste a DIFFERENT 32+ char random string>
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d

# Telegram (optional — leave blank to disable the bot)
TELEGRAM_BOT_TOKEN=<your bot token>
TELEGRAM_ADMIN_CHAT_ID=<your chat id>

# Payments (sandbox test values are fine for dev)
PAYME_MERCHANT_ID=<id>
PAYME_KEY=<key>
CLICK_MERCHANT_ID=<id>
CLICK_SERVICE_ID=<id>
CLICK_SECRET=<secret>

# App
NODE_ENV=development
API_PORT=4000
WEB_URL=http://localhost:3000
API_URL=http://localhost:4000
UPLOAD_DIR=./uploads

# Google OAuth (optional — "Continue with Google" stays hidden/disabled if blank)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback

# MinIO object storage (optional — falls back to local disk if MINIO_ENDPOINT is blank)
MINIO_ENDPOINT=
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=techstore
MINIO_PUBLIC_URL=http://localhost:9000

# SMTP for OTP emails (optional — password-reset / verification codes only work if set)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=TechStore <noreply@techstore.uz>
```

> **Optional integrations degrade gracefully.** Leave any of the three blocks above empty and the
> feature simply turns off: no Google button, uploads go to local disk, and password-reset tells the
> user email isn't available. Nothing crashes on boot.

> 🔑 Generate a JWT secret quickly:
> ```bash
> openssl rand -base64 36
> ```

### Step 5 — Set up Prisma (schema → tables → data)

> ⚠️ **Important gotcha:** Prisma looks for `.env` in the folder you run it from
> (`packages/db`), **not** the repo root. So running the short root script `pnpm db:migrate`
> straight away can fail with *"Environment variable not found: DATABASE_URL"*. To avoid surprises,
> pass `DATABASE_URL` inline (shown below), **or** do the one-time fix in Step 5c.

**5a — Apply migrations (creates the tables):**
```bash
cd packages/db
DATABASE_URL="postgresql://postgres:1111@localhost:5432/techstore" npx prisma migrate deploy
```
- `migrate deploy` = apply the migration files that already exist in `prisma/migrations/`.
- Use this for setting up an existing project. Expect output ending in *"All migrations have been
  applied"* (or *"No pending migrations"*).

> `migrate deploy` vs `migrate dev`:
> - **`migrate deploy`** → only applies existing migrations. Safe. Use it here and in production.
> - **`migrate dev`** → for when *you change `schema.prisma`* and need to generate a **new**
>   migration. It can prompt/reset. Don't use it just to set up.

**5b — Generate the Prisma client (typed query code):**
```bash
DATABASE_URL="postgresql://postgres:1111@localhost:5432/techstore" npx prisma generate
```
If the client isn't generated, the API crashes on boot with *"@prisma/client did not initialize"*.

**5c — (optional, one-time) make the short scripts work:**
Create `packages/db/.env` with just the DB URL so you can later run `pnpm db:migrate`,
`pnpm db:seed`, `pnpm db:studio` from the repo root without the inline prefix:
```bash
echo 'DATABASE_URL="postgresql://postgres:1111@localhost:5432/techstore"' > packages/db/.env
```
(`packages/db/.env` is covered by the root `.gitignore` `.env*` rule.)

**5d — Seed sample data (3 products, categories, brands, owner user):**
```bash
DATABASE_URL="postgresql://postgres:1111@localhost:5432/techstore" NODE_ENV=development pnpm seed
```
> The seed script **refuses to run when `NODE_ENV=production`** (a safety guard), so keep
> `NODE_ENV=development` here. Creates login `owner@techstore.uz` / `Admin1234!`.

**5e — (optional) DEMO dataset for showing the store to clients:**
```bash
pnpm db:seed:demo        # 15 products (phones/laptops/tablets/audio/wearables) + 4 demo accounts
# or one-shot: migrate + demo seed + run dev with the demo panel enabled
make demo
```
Demo logins (password `Demo1234!`): `owner@demo.uz` · `manager@demo.uz` · `staff@demo.uz` ·
`customer@demo.uz`. They show as **one-click buttons on `/auth/login`** only when
`NEXT_PUBLIC_DEV_MODE=true` in `apps/web/.env.local` — the panel + credentials are tree-shaken out
of production builds. Owner/manager/staff are redirected straight to `/admin` after login; customers
go to the storefront.

**5f — (recommended) generate product images:**
```bash
pnpm db:seed:images
```
The demo seed creates products **without images**, so the storefront would show empty placeholder
tiles. This script writes 2 branded SVG tiles per product into `apps/api/uploads/products/` and
inserts the matching `ProductImage` rows. Two images per product is what powers the **hover
image-swap** on product cards. It's idempotent and **skips products that already have real
(uploaded) photos**, so uploading real images via the admin panel takes over cleanly. Re-run it
after `db:seed:demo` (which recreates products).

### Step 6 — Verify the database is populated
```bash
PGPASSWORD=1111 psql -h localhost -p 5432 -U postgres -d techstore -tAc "SELECT count(*) FROM products;"
```
Expected: **3**. (If you get *"relation \"products\" does not exist"*, Step 5a didn't actually run —
go back and watch its output.)

### Step 7 — Run the app
```bash
cd ~/Desktop/projects/fullstacks/tech-store
pnpm dev
```
This starts web + API + the types watcher together (Turborepo).

1. In the output, find the **`@techstore/api`** pane and wait for:
   ```
   API running on port 4000
   ```
2. Confirm the API is healthy (second terminal):
   ```bash
   curl http://localhost:4000/api/health
   # → {"status":"ok","timestamp":"..."}
   ```
3. **Only then** open the storefront: <http://localhost:3000>

> If you open the web page **before** the API prints "running on port 4000", you'll get
> **`fetch failed`** on the home page — it's just the storefront calling an API that isn't up yet.
> Wait for the API, then refresh.

### Step 8 — Handy dev commands
```bash
pnpm db:studio     # visual DB browser (Prisma Studio)  → http://localhost:5555
pnpm lint          # eslint across the monorepo
pnpm typecheck     # tsc --noEmit across the monorepo
pnpm build         # production build of everything (turbo)
```

---

## 2.5 Roles & permissions

Four roles (a user's role is on `users.role`). The **owner** is the only one who can change roles —
do it in the admin panel under **Team & customers** (`/admin/users`).

| Capability | OWNER | MANAGER | STAFF | CUSTOMER |
|---|:---:|:---:|:---:|:---:|
| Shop, cart, place & track orders, reviews | ✓ | ✓ | ✓ | ✓ |
| View admin dashboard & orders | ✓ | ✓ | ✓ | — |
| Update order status / fulfil | ✓ | ✓ | ✓¹ | — |
| Add / edit products, stock, images, publish | ✓ | ✓ | view-only | — |
| Delete products | ✓ | — | — | — |
| View customers / team | ✓ | ✓ | — | — |
| Grant / revoke the **Staff** role | ✓ | ✓ | — | — |
| Assign **any** role (owner, manager) | ✓ | — | — | — |

¹ STAFF can move orders through fulfilment but **cannot issue refunds**.

- Guards are enforced server-side (`RolesGuard` + `@Roles()` on the API) *and* reflected in the admin
  UI (nav items + action buttons hide for roles that can't use them).
- Safety rails: you can't change your **own** role, and the **last owner** can't be demoted.
- Staff/managers/owners are redirected to `/admin` after login; customers go to the storefront.
  Staff also get an **Admin** shortcut in the storefront header.

## 3. Daily workflow

- **Start working:** `pnpm dev` → wait for API on 4000 → open localhost:3000.
- **Stop:** `Ctrl+C` in the `pnpm dev` terminal.
- **After you change `schema.prisma`:**
  ```bash
  cd packages/db
  DATABASE_URL="postgresql://postgres:1111@localhost:5432/techstore" npx prisma migrate dev --name <change>
  DATABASE_URL="postgresql://postgres:1111@localhost:5432/techstore" npx prisma generate
  ```
- **Wipe & rebuild the DB from scratch (destroys data, re-seeds):**
  ```bash
  cd packages/db
  DATABASE_URL="postgresql://postgres:1111@localhost:5432/techstore" npx prisma migrate reset
  ```
- **After you `git pull`:** `pnpm install` → re-run migrations if new ones arrived.

---

## 4. Troubleshooting (real issues + fixes)

| Symptom | Cause | Fix |
|--------|-------|-----|
| Web shows **`fetch failed`** / **`ECONNREFUSED 127.0.0.1:4000`** | API (4000) isn't up yet / crashed | Wait for `API running on port 4000`; `curl localhost:4000/api/health`. If it never comes up, read the api pane for the real error (usually DB or env). |
| API exits immediately with **`Invalid environment`** under `pnpm dev` | NestJS ConfigModule loads `.env` from its own cwd (`apps/api`), not the repo root | Fixed in `apps/api/src/modules/config/config.module.ts` via `envFilePath: ['.env', '../../.env']`. Just make sure the **root `.env`** exists and has `DATABASE_URL` + 32-char JWT secrets. |
| **`relation "products" does not exist`** | Migrations never applied to *this* DB | Run Step 5a; confirm the `DATABASE_URL` points at the DB you're querying (5432 vs 5433). |
| Prisma: **`Environment variable not found: DATABASE_URL`** | Ran a Prisma/`pnpm db:*` command from a folder without `.env` | Prefix with `DATABASE_URL="..."` **or** create `packages/db/.env` (Step 5c). |
| API crash: **`@prisma/client did not initialize`** | Client not generated | Run Step 5b (`prisma generate`). |
| **`File '@techstore/config/tsconfig' not found`** during build | Missing workspace dep link | Ensure `@techstore/config` is a devDependency of the failing package, then `pnpm install`. |
| Seed does nothing / exits | `NODE_ENV=production` | Run seed with `NODE_ENV=development`. |
| Postgres connection refused | Wrong port (5432 local vs 5433 Docker) or DB not running | `pg_isready -h localhost -p <port>`; start local Postgres or `docker compose up -d db --wait`. |
| Port 4000/3000 already in use | Old process still running | `fuser -k 4000/tcp` (or `:3000`) then restart. |

---

## 5. Production deployment

> Production runs everything in Docker behind nginx, using `docker-compose.prod.yml`.

### Step 1 — Prepare the server
- Ubuntu VPS with Docker + Docker Compose installed.
- Clone the repo, `cd` into it.
- Make sure the production port plan doesn't collide with other projects on the VPS.

### Step 2 — Create `.env.production`
Same keys as dev, but production-grade:
```ini
NODE_ENV=production
DATABASE_URL=postgresql://techstore:<STRONG_PASSWORD>@db:5432/techstore
POSTGRES_PASSWORD=<STRONG_PASSWORD>
JWT_ACCESS_SECRET=<long random, ≥32 chars>
JWT_REFRESH_SECRET=<different long random, ≥32 chars>
WEB_URL=https://your-domain.uz
API_URL=https://your-domain.uz
# real Telegram + Payme + Click credentials
```
> In prod, `DATABASE_URL` host is `db` (the compose service name), not `localhost`.
> Boot guard: weak/short JWT secrets cause the API to exit on start — use strong ones.

### Step 3 — Build the images
```bash
docker compose -f docker-compose.prod.yml build
```

### Step 4 — Apply migrations (before serving traffic)
```bash
docker compose -f docker-compose.prod.yml run --rm api pnpm --filter @techstore/db migrate:deploy
```
> Always `migrate:deploy` in production — **never** `migrate dev`, never `prisma db push`, never
> TypeORM-style `synchronize`. Those can drop data.

### Step 5 — Start everything
```bash
docker compose -f docker-compose.prod.yml up -d --wait
```
`--wait` blocks until health checks pass. Services bind to `127.0.0.1` only; nginx is the public
entry point (`:80`/`:443`).

### Step 6 — Verify
```bash
curl -fsk https://your-domain.uz/api/health     # → {"status":"ok",...}
docker compose -f docker-compose.prod.yml ps     # all healthy
docker compose -f docker-compose.prod.yml logs -f api   # tail logs
```

### Step 7 — Backups (recommended)
```bash
# nightly dump (cron)
docker exec techstore-db-1 pg_dump -U techstore techstore | gzip > backup_$(date +%F).sql.gz
```

### Updating a running deployment
```bash
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml run --rm api pnpm --filter @techstore/db migrate:deploy
docker compose -f docker-compose.prod.yml up -d --wait
```

---

## 6. Command quick-reference

| Task | Command |
|------|---------|
| Install deps | `pnpm install` |
| Start dev (all apps) | `pnpm dev` |
| API health | `curl http://localhost:4000/api/health` |
| Apply migrations (dev) | `cd packages/db && DATABASE_URL="...5432..." npx prisma migrate deploy` |
| New migration after schema change | `... npx prisma migrate dev --name <change>` |
| Generate Prisma client | `... npx prisma generate` |
| Seed data | `... NODE_ENV=development pnpm seed` |
| Seed demo dataset | `pnpm db:seed:demo` |
| Generate product images | `pnpm db:seed:images` |
| Reset DB (wipe+seed) | `... npx prisma migrate reset` |
| DB browser | `pnpm db:studio` |
| Lint / typecheck | `pnpm lint` / `pnpm typecheck` |
| Full build | `pnpm build` |
| Prod build | `docker compose -f docker-compose.prod.yml build` |
| Prod migrate | `docker compose -f docker-compose.prod.yml run --rm api pnpm --filter @techstore/db migrate:deploy` |
| Prod up | `docker compose -f docker-compose.prod.yml up -d --wait` |

---

*Seeded admin login:* set by `SEED_OWNER_EMAIL` / `SEED_OWNER_PASSWORD` in `.env` (defaults in this
repo: `owner@techstore.uz` / `Admin1234!`). The seed reads the root `.env` via dotenv, so
`pnpm seed` no longer needs an inline `DATABASE_URL`. Change the email/password in `.env` and re-seed
to rotate the owner account — nothing is hardcoded in `seed.ts`.
