---
phase: 04-cohort-archive
plan: 01
subsystem: database, ui
tags: [prisma, nextjs, server-actions, tailwind]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Cohort schema with createCohort/updateCohort server actions
provides:
  - isActive Boolean field on Cohort model (default true)
  - toggleCohortArchive server action with auth guard
  - Admin archive/unarchive toggle per cohort row
  - Public cohort list with active/archived visual separation
  - Cohort landing page archive notice banner
affects: [04-02-cohort-archive]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "toggleCohortArchive.bind(null, id) as unknown as () => void — type cast for form actions returning non-void"
    - "orderBy: [{ isActive: 'desc' }, { orderIndex: 'desc' }] — multi-field sort placing active cohorts first"

key-files:
  created: []
  modified:
    - prisma/schema.prisma
    - app/actions/cohorts.ts
    - app/(admin)/admin/cohorts/page.tsx
    - app/(public)/page.tsx
    - app/(public)/[cohortSlug]/page.tsx

key-decisions:
  - "toggleCohortArchive returns void from form action perspective — type cast used since error return cannot be surfaced via HTML form action"
  - "prisma generate required after db push — client types not updated until explicitly regenerated"
  - "Archived cohorts remain visible on public list with opacity-60 and Past Cohorts divider — data accessibility over hiding"

patterns-established:
  - "Server action type cast: bound form actions returning non-void need `as unknown as () => void` for TypeScript compatibility"

requirements-completed: [CHRT-03]

# Metrics
duration: 2min
completed: 2026-03-19
---

# Phase 4 Plan 1: Cohort Archive Summary

**isActive boolean on Cohort model with admin toggle, public Past Cohorts divider, and amber archive notice banner on landing pages**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-18T17:10:31Z
- **Completed:** 2026-03-18T17:12:31Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Cohort model gains `isActive Boolean @default(true)` field, db push applied and client regenerated
- Admin cohorts page has per-row Archive/Unarchive toggle button with Archived badge for archived cohorts
- Public cohort list sorts active cohorts first, shows Past Cohorts divider, applies opacity-60 to archived items
- Cohort landing page renders amber "read-only record" notice banner when cohort is archived

## Task Commits

Each task was committed atomically:

1. **Task 1: Add isActive to Cohort schema and toggleCohortArchive server action** - `d20fff9` (feat)
2. **Task 2: Admin archive toggle + public visual distinction for cohorts** - `8c9de43` (feat)
3. **Auto-fix: Regenerate Prisma client and fix form action type cast** - `3a696ed` (fix)

**Plan metadata:** (docs commit pending)

## Files Created/Modified
- `prisma/schema.prisma` - Added `isActive Boolean @default(true)` to Cohort model
- `app/actions/cohorts.ts` - Added `toggleCohortArchive` server action
- `app/(admin)/admin/cohorts/page.tsx` - Archive/Unarchive toggle button + Archived badge per cohort row
- `app/(public)/page.tsx` - Multi-field sort, active/archived split, Past Cohorts divider
- `app/(public)/[cohortSlug]/page.tsx` - Amber archive notice banner for archived cohorts

## Decisions Made
- `toggleCohortArchive` returns `{ error: string } | undefined` but form action requires `void` return — used `as unknown as () => void` type cast since form actions cannot surface return values to the UI anyway
- `npx prisma db push` applies schema changes to the DB but does NOT regenerate the TypeScript client — `npx prisma generate` must be run separately; this was an auto-fix (Rule 3 - Blocking)
- All cohorts (active and archived) remain queryable on public pages — archived cohorts are dimmed but not hidden, preserving historical data accessibility

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Regenerated Prisma client after schema change**
- **Found during:** Post-task TypeScript check
- **Issue:** `db push` updated the database but TypeScript types in `@prisma/client` still reflected the old schema without `isActive`; 10+ type errors across all modified files
- **Fix:** Ran `npx prisma generate` to regenerate the Prisma client; added `as unknown as () => void` cast on the bound form action to satisfy the HTML form action type signature
- **Files modified:** `app/(admin)/admin/cohorts/page.tsx` (type cast), node_modules/@prisma/client (generated)
- **Verification:** `npx tsc --noEmit` passes with no errors
- **Committed in:** `3a696ed`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Auto-fix essential for TypeScript compilation. No scope creep.

## Issues Encountered
- Prisma client generation is a separate step from `db push` — the plan only mentioned `db push`. Future plans should include `prisma generate` after any schema changes.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- isActive field and admin toggle ready for Plan 04-02 (action hiding on archived cohort pages)
- Public visual distinction complete; archive notice banner in place
- No blockers for next plan

---
*Phase: 04-cohort-archive*
*Completed: 2026-03-19*
