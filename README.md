# LiveU CS App Store

Internal tool catalog for the LiveU Customer Success department. Browse, search, and access all CS-built tools from one place.

---

## Quick start (production-like, fully Dockerized)

```bash
docker compose up --build
```

Opens on **http://localhost** (port 80).  
The database is seeded automatically on first run — no extra steps needed.

---

## Local development (hot reload)

### Option A — Dockerized dev stack

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Frontend: **http://localhost:5173** (Vite with HMR)
- Backend: **http://localhost:3001** (ts-node-dev)
- Database: **localhost:5432**

Source files are volume-mounted, so edits to `backend/src/` and `frontend/src/` hot-reload instantly.

### Option B — Run services locally

**Prerequisites:** Node 20+, PostgreSQL 16 (or use the db from Option A)

```bash
# 1. Start only the database
docker compose -f docker-compose.dev.yml up db -d

# 2. Backend
cd backend
cp .env.example .env        # edit DATABASE_URL if needed
npm install
npm run migrate:dev         # creates/applies migrations
npm run seed                # seed example tools
npm run dev                 # starts ts-node-dev on :3001

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev                 # starts Vite on :5173
```

---

## Migrations

```bash
# Create a new migration after editing prisma/schema.prisma
cd backend && npm run migrate:dev -- --name <migration-name>

# Apply existing migrations (production)
cd backend && npm run migrate
```

## Seed

```bash
cd backend && npm run seed
```

The seed is idempotent — it skips if the `tools` table already has rows.  
In Docker (`docker compose up`), seed runs automatically on startup.

---

## Uploaded files

Uploaded screenshots and installer files are stored on a named Docker volume (`uploads`) and served by the backend at `/uploads/...`.

- Screenshots: `/uploads/screenshots/<hash>.jpg`
- Installers: `/uploads/installers/<hash>.exe`

To inspect the volume from outside the container:

```bash
docker run --rm -v app-store_uploads:/data alpine ls /data
```

To back up uploads:

```bash
docker run --rm -v app-store_uploads:/data -v $(pwd):/backup \
  alpine tar czf /backup/uploads-backup.tar.gz /data
```

---

## Routes

| URL | Description |
|-----|-------------|
| `/` | Storefront — browse and search tools |
| `/tools/:id` | Tool detail page |
| `/admin` | Admin dashboard — table of all tools |
| `/admin/new` | Create a new tool |
| `/admin/edit/:id` | Edit an existing tool |

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check |
| `GET /api/tools` | List all tools |
| `GET /api/tools/:id` | Get a tool |
| `POST /api/tools` | Create a tool |
| `PUT /api/tools/:id` | Update a tool |
| `DELETE /api/tools/:id` | Delete a tool |
| `POST /api/uploads/screenshots` | Upload screenshot images |
| `POST /api/uploads/installer` | Upload a desktop installer file |

---

## Environment variables

### backend/.env

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `PORT` | `3001` | Backend listen port |
| `UPLOADS_PATH` | `./uploads` | Absolute path for file storage |
| `NODE_ENV` | `development` | `production` or `development` |

### frontend/.env

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | _(empty)_ | API base URL override. Leave empty in production (nginx proxies `/api`). Set to `http://localhost:3001` only when running the frontend standalone without the Vite proxy. |

---

## Architecture

```
┌─────────────────────────────────────────┐
│  Browser                                │
│  localhost:80 (prod) / :5173 (dev)      │
└────────────────┬────────────────────────┘
                 │ HTTP
┌────────────────▼────────────────────────┐
│  frontend (nginx / Vite)                │
│  • Serves React SPA                     │
│  • Proxies /api/* → backend:3001        │
│  • Proxies /uploads/* → backend:3001    │
└────────────────┬────────────────────────┘
                 │ HTTP (internal Docker network)
┌────────────────▼────────────────────────┐
│  backend (Node.js + Express)            │
│  • REST API                             │
│  • Serves uploaded files statically     │
│  • Prisma → PostgreSQL                  │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  db (PostgreSQL 16)                     │
│  Volume: db_data                        │
└─────────────────────────────────────────┘
                 Uploads volume: uploads
```
