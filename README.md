# AI Hiring Platform

Two-sided hiring platform: AI ranks resumes by semantic fit, grades async
video interviews, and produces a weighted hiring recommendation.

## Week 1 status: Foundation & Auth ✅

- Turborepo monorepo: `apps/web` (Next.js 14) + `apps/api` (Fastify) + `packages/shared-types`
- Prisma + Postgres: `users`, `companies` tables
- JWT auth (access + refresh) via httpOnly cookies — register / login / refresh / logout / me
- Tailwind + a small hand-rolled UI kit — Login, Register, Company dashboard, Candidate dashboard
- Local Postgres (with pgvector pre-enabled) + Redis via Docker Compose
- GitHub Actions: install → prisma generate → lint → typecheck → build

## Setup (local dev)

```bash
# 1. Install dependencies (also generates the Prisma client automatically)
npm install

# 2. Start Postgres + Redis
docker compose up -d

# 3. Create your root .env from the example, then fill in real JWT secrets
cp .env.example .env

# 4. Create the database tables
npm run db:migrate -- --name init

# 5. (optional) seed two test logins
npm run db:seed

# 6. Run both apps together
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:3001/health

Seeded logins (if you ran `db:seed`):
- Company: `founder@acme.dev` / `password123`
- Candidate: `candidate@acme.dev` / `password123`

## Project structure

See the Technical Blueprint PDF for the full target structure. Week 1 fills in
`apps/web`, `apps/api`, `packages/shared-types`, `packages/config`, and `prisma/`.
