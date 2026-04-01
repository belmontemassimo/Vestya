# Hestia — Family Property Management Dashboard

## Quick Start

```bash
# 1. Start services
docker compose up -d

# 2. Generate Prisma client
npm run db:generate

# 3. Run migrations
npm run db:push

# 4. Seed sample data
npm run db:seed

# 5. Start dev server
npm run dev
```

Login: any email below with password `Hestia2024!`
- massimo@hestia.dev (OWNER)
- sophie@hestia.dev (ADMIN)
- lucas@hestia.dev (MEMBER)
- marie@hestia.dev (VIEWER)

## Tech Stack

- Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui
- Prisma 5 + PostgreSQL 16 (Docker Compose)
- NextAuth v5 (credentials provider)
- next-intl (English + French)
- TanStack Query + React Hook Form + Zod
- FullCalendar, AWS SDK v3 (S3/MinIO), Resend

## Architecture

### Route Structure
- `src/app/[locale]/(marketing)/` — landing page
- `src/app/[locale]/(auth)/` — login, register, accept-invite
- `src/app/[locale]/(app)/` — authenticated dashboard (requires auth)

### Data Flow
- **Reads**: Server Components → Prisma directly
- **Writes**: Client → Server Actions → Zod → auth → permissions → Prisma → activity log → ActionResult<T>

### Multi-Tenant Isolation
Every query scoped to `familyId` from session. Never from URL/body.

### Permissions
Role hierarchy: OWNER > ADMIN > MEMBER > VIEWER
Matrix in `src/config/permissions.ts` (not used yet — see `src/lib/permissions.ts`)

## Key Conventions

- Server Actions in `src/actions/*.actions.ts`
- Zod schemas in `src/schemas/*.schema.ts`
- All mutations return `ActionResult<T>` (discriminated union)
- Soft delete via `deletedAt` on major entities
- i18n keys in `messages/{en,fr}.json`
- Components organized by feature in `src/components/`

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:push` | Push schema to DB |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run test` | Run unit tests |
| `npm run test:coverage` | Run with coverage |
| `npm run test:e2e` | Run Playwright E2E |

## Environment Variables

Copy `.env.example` to `.env.local`. Key vars:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXTAUTH_SECRET` — Session signing secret
- `S3_*` — S3-compatible storage config
- `RESEND_API_KEY` — Email (leave empty for console logging)
