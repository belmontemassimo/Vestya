# Hestia - Housing Manager

A private, multi-tenant family property management dashboard. Manage properties, maintenance tasks, contacts, documents, finances, and calendar events in one secure workspace.

## Features

- **Properties** — Track multiple properties with addresses, types, and auto-geocoded map locations
- **Tasks** — Create, assign, and track maintenance tasks with priorities and categories
- **Contacts** — Organize service providers, tenants, and contractors
- **Documents** — Upload, preview, and manage property-related documents (S3/MinIO storage)
- **Spending** — Track expenses and income per property with category breakdowns
- **Calendar** — Schedule events and link them to properties and contacts
- **Dashboard** — Customizable drag-and-drop widget grid with map or image display modes
- **Multi-tenant** — Family-based isolation with role-based access control (Owner, Admin, Member, Viewer)
- **i18n** — Full English and French localization
- **Invite system** — Invite family members via email with role assignment

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL 16 (Prisma 5 ORM) |
| Auth | NextAuth v5 (credentials provider) |
| i18n | next-intl |
| Forms | React Hook Form + Zod |
| State | TanStack Query |
| Calendar | FullCalendar |
| Storage | S3-compatible (MinIO for local dev) |
| Email | Resend (console fallback in dev) |
| Maps | Leaflet + OpenStreetMap |

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm

## Quick Start

```bash
# 1. Clone and install
git clone https://github.com/belmontemassimo/Hestia.git
cd Hestia
npm install

# 2. Set up environment
cp .env.example .env.local

# 3. Start services (PostgreSQL + MinIO)
docker compose up -d

# 4. Set up database
npm run db:generate
npm run db:push
npm run db:seed

# 5. Create MinIO bucket
docker exec hestia-storage sh -c 'mc alias set local http://localhost:9000 minioadmin minioadmin && mc mb --ignore-existing local/hestia-documents && mc anonymous set download local/hestia-documents'

# 6. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Accounts

| Email | Role | Password |
|-------|------|----------|
| massimo@hestia.dev | Owner | `Hestia2024!` |
| sophie@hestia.dev | Admin | `Hestia2024!` |
| lucas@hestia.dev | Member | `Hestia2024!` |
| marie@hestia.dev | Viewer | `Hestia2024!` |

## Project Structure

```
src/
  actions/          # Server actions (mutations)
  app/
    [locale]/
      (auth)/       # Login, register, onboarding
      (app)/        # Authenticated app routes
      (marketing)/  # Landing page
    api/            # API routes (auth)
  components/
    shared/         # Reusable: PageHeader, FormDialog
    layout/         # Sidebar, Topbar, MobileNav
    properties/     # Property forms, cards, lists
    tasks/          # Task forms, cards, filters
    contacts/       # Contact forms, cards
    calendar/       # Calendar view, event forms
    documents/      # Upload, list, preview
    spending/       # Spending forms, tables, summary
    widgets/        # Dashboard grid, renderers, pickers
    settings/       # Family + profile settings
    members/        # Invite form, member list
    auth/           # Login, register, onboarding forms
  config/           # Navigation, permissions, widget registry
  hooks/            # Shared hooks (dashboard layout, nav filtering)
  i18n/             # Routing + request config
  lib/              # Auth, Prisma, storage, geocoding, utilities
  schemas/          # Zod validation schemas
  types/            # TypeScript type definitions
messages/           # i18n translations (en.json, fr.json)
prisma/             # Schema + seed script
```

## Architecture

### Data Flow

- **Reads**: Server Components query Prisma directly
- **Writes**: Client components call Server Actions -> Zod validation -> auth check -> permission check -> Prisma -> activity log -> `ActionResult<T>`

### Multi-Tenant Isolation

Every database query is scoped to `familyId` from the authenticated session. The family ID is never taken from URL parameters or request bodies.

### Permissions

Role hierarchy: `OWNER > ADMIN > MEMBER > VIEWER`

Permission matrix defined in `src/lib/permissions.ts`. Every server action checks permissions before executing.

### Key Conventions

- Server actions in `src/actions/*.actions.ts`
- Zod schemas in `src/schemas/*.schema.ts`
- All mutations return `ActionResult<T>` (discriminated union: `{ success: true, data: T } | { success: false, error: string }`)
- Soft delete via `deletedAt` on major entities
- i18n keys use flat structure with singular enum names (`type.HOUSE`, `priority.LOW`, `category.PLUMBER`)
- Shared `FormDialog` component for all create/edit dialogs

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run E2E tests (Playwright) |

## Environment Variables

Copy `.env.example` to `.env.local`. All variables are documented in the example file.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Session signing secret |
| `S3_ENDPOINT` | S3-compatible storage endpoint |
| `S3_ACCESS_KEY` / `S3_SECRET_KEY` | Storage credentials |
| `S3_BUCKET` | Storage bucket name |
| `RESEND_API_KEY` | Email provider (leave empty for console logging) |
| `NEXT_PUBLIC_APP_URL` | Public app URL |

## License

Private project. All rights reserved.
