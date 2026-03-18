---
phase: 01-foundation
plan: 01
subsystem: database
tags: [nextjs, prisma, postgresql, zod, vitest, tailwind, shadcn]

# Dependency graph
requires: []
provides:
  - Next.js 16 project with TypeScript, Tailwind v4, Turbopack
  - Full 6-entity Prisma 7 schema (Cohort, Hackathon, Team, Member, Update, Submission)
  - Prisma client singleton via PrismaPg adapter (app/lib/db.ts)
  - Shared Zod schemas CohortSchema and HackathonSchema (app/lib/definitions.ts)
  - Vitest test scaffold with 5 test files and 20 todo stubs
  - shadcn/ui components: table, dialog, badge, button, input, label, textarea
  - .gitignore excludes .env.local before first commit (security requirement met)
affects: [02-admin-auth, 03-cohort-crud, 04-hackathon-crud, 05-public-ui]

# Tech tracking
tech-stack:
  added:
    - Next.js 16.1.7 (App Router, Turbopack, TypeScript)
    - Prisma 7.5.0 with @prisma/adapter-pg (mandatory driver adapter)
    - PostgreSQL via Neon (DATABASE_URL configured in .env.local, not yet live)
    - jose 5.x (JWT session tokens)
    - bcryptjs 2.x (admin password hashing)
    - Zod 3.x (input validation)
    - Tailwind CSS 4.x (CSS-first config)
    - shadcn/ui (New York style, neutral, CLI-installed components)
    - Vitest 4.1.0 with @vitejs/plugin-react
    - server-only (prevents server code leaking to client bundle)
    - clsx, tailwind-merge, date-fns
  patterns:
    - Prisma 7: prisma.config.ts replaces datasource url in schema.prisma
    - Prisma 7: explicit prisma generate required after schema changes
    - Prisma 7: driver adapters mandatory (PrismaPg for PostgreSQL)
    - PrismaClient singleton via globalForPrisma pattern
    - Cohort-scoped schema: cohortId FK on Hackathon, cascade deletes
    - All models use @@map (snake_case table names) and @@index on FK fields
    - server-only import guards all DB/session files

key-files:
  created:
    - prisma/schema.prisma
    - prisma.config.ts
    - app/lib/db.ts
    - app/lib/definitions.ts
    - vitest.config.ts
    - tests/setup.ts
    - tests/auth.test.ts
    - tests/session.test.ts
    - tests/proxy.test.ts
    - tests/cohorts.test.ts
    - tests/hackathons.test.ts
    - .env.local (placeholder values, gitignored)
  modified:
    - .gitignore (added /lib/generated/prisma)
    - components/ (added shadcn ui components)

key-decisions:
  - "Prisma 7 over Prisma 6: greenfield project, no migration cost, active support"
  - "Migration pending live DB config: DATABASE_URL placeholder until Neon is configured"
  - "Schema datasource url removed entirely: Prisma 7 no longer supports url in datasource block"
  - "Generator uses prisma-client-js without custom output: resolves to default node_modules/.prisma/client"
  - "proxy.ts instead of middleware.ts: Next.js 16 deprecation, implemented in Plan 02"

patterns-established:
  - "Pattern: Prisma 7 prisma.config.ts for all DB config (no url in schema.prisma)"
  - "Pattern: PrismaClient singleton with globalForPrisma prevents hot-reload connection exhaustion"
  - "Pattern: All models with @@map snake_case + @@index on FK for query performance"
  - "Pattern: cohortId FK on all top-level entities ensures cohort isolation"
  - "Pattern: server-only import on all DB/session/auth files"

requirements-completed: [CHRT-01, CHRT-02]

# Metrics
duration: 7min
completed: 2026-03-18
---

# Phase 1 Plan 01: Foundation Bootstrap Summary

**Next.js 16 + Prisma 7 bootstrapped with 6-entity cohort-scoped schema (Cohort→Hackathon→Team→Member/Update/Submission), PrismaClient singleton, Zod validators, and Vitest test scaffold**

## Performance

- **Duration:** ~7 minutes
- **Started:** 2026-03-18T05:38:08Z
- **Completed:** 2026-03-18T05:45:25Z
- **Tasks:** 3 of 3
- **Files modified:** 15+

## Accomplishments

- Next.js 16 project bootstrapped with TypeScript, Tailwind v4, App Router, Turbopack — runs without errors
- Full 6-entity Prisma 7 schema defined and validated; `prisma generate` runs successfully
- Test scaffold in place: 5 test files with 20 todo stubs; `npx vitest run` exits 0
- `.env.local` is gitignored before any `git add` — security requirement met

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize project with .gitignore first, then bootstrap Next.js 16** - `9cf24d0` (chore)
2. **Task 2: Define full Prisma 7 schema, prisma.config.ts, migrate, and db.ts singleton** - `fcf0be1` (feat)
3. **Task 3: Scaffold Vitest test suite (Wave 0 test stubs)** - `25a02fc` (feat)

## Files Created/Modified

- `prisma/schema.prisma` - Full 6-entity cohort-scoped schema with cascade deletes
- `prisma.config.ts` - Prisma 7 defineConfig with schema path, migrations path, datasource url
- `app/lib/db.ts` - PrismaClient singleton using PrismaPg adapter (server-only)
- `app/lib/definitions.ts` - CohortSchema and HackathonSchema Zod validators with form state types
- `vitest.config.ts` - Vitest configured with node environment, react plugin, @ alias
- `tests/setup.ts` - Mocks for server-only, next/headers (cookies), next/navigation
- `tests/auth.test.ts` - 3 todo stubs for ADMN-01 login tests
- `tests/session.test.ts` - 5 todo stubs for session encrypt/decrypt tests
- `tests/proxy.test.ts` - 3 todo stubs for proxy route guard tests
- `tests/cohorts.test.ts` - 4 todo stubs for CHRT-01/ADMN-04 cohort tests
- `tests/hackathons.test.ts` - 5 todo stubs for CHRT-02/ADMN-02 hackathon tests
- `.gitignore` - Updated to include /lib/generated/prisma path
- `components/ui/` - Added: badge, dialog, input, label, table, textarea (shadcn)

## Decisions Made

- **Prisma 7 schema format:** Prisma 7.5.0 requires datasource block to have NO `url` field — `prisma.config.ts` owns all DB config. The research file mentioned `url = env("DATABASE_URL")` for IDE tooling, but the actual Prisma 7 CLI rejected it with P1012 error. Removed from datasource block.
- **Generator default output:** Used `prisma-client-js` without custom output path — resolves to default `node_modules/.prisma/client` which `@prisma/client` re-exports correctly.
- **Migration pending:** DATABASE_URL is placeholder in `.env.local`; migration skipped per plan instructions. The `.env` file created by `prisma init` contains a local Prisma Postgres URL that requires a running local server. Live DB configuration and migration will be verified in Plan 05.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed datasource url from schema.prisma**
- **Found during:** Task 2 (schema definition and prisma generate)
- **Issue:** Plan and research specified `url = env("DATABASE_URL")` in datasource block for IDE tooling, but Prisma 7.5.0 rejects this with error P1012: "The datasource property url is no longer supported in schema files"
- **Fix:** Removed `url = env("DATABASE_URL")` from datasource block entirely; prisma.config.ts owns the url
- **Files modified:** prisma/schema.prisma
- **Verification:** `npx prisma generate` succeeds after fix
- **Committed in:** fcf0be1 (Task 2 commit)

**2. [Rule 1 - Bug] Used default generator output instead of custom path**
- **Found during:** Task 2 (schema definition)
- **Issue:** Plan specified `output = "../node_modules/.prisma/client"` in generator block, but prisma init generates without custom output. The default path works correctly with `@prisma/client` imports.
- **Fix:** Used `provider = "prisma-client-js"` without custom output
- **Files modified:** prisma/schema.prisma
- **Verification:** `npx prisma generate` succeeds; client imports from @prisma/client work
- **Committed in:** fcf0be1 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 - Bug fixes for Prisma 7.5.0 compatibility)
**Impact on plan:** Both fixes required for Prisma 7.5.0 compliance. The research mentioned these as Prisma 7 changes but the exact API evolved. No scope creep.

## Issues Encountered

- `create-next-app` refused to bootstrap into `/home/nubroo/bay-server` due to existing `.claude/` and `.planning/` directories. Workaround: bootstrapped into `/tmp/nextjs-bootstrap` then copied files with `rsync` (excluding `.git` and `.gitignore`).
- The initial commit (hash `8ccadbc`) already contained the base Next.js scaffolding. This was created before plan execution started.

## User Setup Required

Before Plan 02 can run end-to-end, configure a live database:

1. Create a Neon PostgreSQL database at https://neon.tech
2. Update `.env.local` with real values:
   ```
   DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
   DATABASE_URL_UNPOOLED="postgresql://user:pass@host/dbname?sslmode=require"
   SESSION_SECRET="<32-char random: openssl rand -base64 32>"
   ADMIN_PASSWORD_HASH="<bcrypt hash: node -e \"const b = require('bcryptjs'); b.hash('yourpassword', 10).then(console.log)\">"
   ```
3. Run migration: `npx prisma migrate dev --name init`
4. Run: `npx prisma generate`

This is gated in Plan 05 (DB connection checkpoint).

## Next Phase Readiness

- Next.js 16 project runs (`npm run dev` starts on :3000)
- Prisma schema with all 6 entities ready for migration once live DB is configured
- Zod schemas ready for use in Plan 02 server actions
- Test scaffold ready for Plans 02-04 to add real test implementations
- `prisma generate` succeeded — TypeScript types for all 6 models are available

---
*Phase: 01-foundation*
*Completed: 2026-03-18*
