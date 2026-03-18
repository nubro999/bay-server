---
phase: 01-foundation
plan: 04
subsystem: admin
tags: [hackathons, server-actions, prisma, zod, next-js, tdd, vitest, slug-generation, cohort-scope, date-fns]

# Dependency graph
requires:
  - phase: 01-foundation/01-01
    provides: Next.js 16 bootstrap, Prisma 7 schema with Hackathon model, Vitest scaffold, db.ts, definitions.ts (HackathonSchema)
  - phase: 01-foundation/01-02
    provides: verifySession() DAL, proxy.ts route guard, admin auth pattern
  - phase: 01-foundation/01-03
    provides: Cohort model in DB, toSlug pattern, CohortForm pattern, admin page structure

provides:
  - "createHackathon Server Action — verifySession guard, Zod validation, slug auto-generation from title, coverImageUrl null coercion"
  - "updateHackathon Server Action — bound-id pattern, verifySession, Zod validation, not-found guard"
  - "deleteHackathon Server Action — verifySession, prisma delete, cascade removes teams"
  - "Admin hackathon list at /admin/hackathons — cohort-grouped display with track badges and date ranges"
  - "Admin create hackathon page at /admin/hackathons/new"
  - "Admin edit hackathon page at /admin/hackathons/[id]/edit — pre-filled with all current values"
  - "HackathonForm reusable client component with useActionState, cohort selector, all 8 fields, error display"

affects: [phase-02, all-team-and-member-plans]

# Tech tracking
tech-stack:
  added: []  # No new deps; date-fns already in place from Plan 01
  patterns:
    - "toSlug inline in hackathons.ts — same pattern as cohorts.ts"
    - "deleteHackathon.bind(null, id) cast to (formData: FormData) => Promise<void> for form action TypeScript compatibility"
    - "Hackathon list page uses cohort.include pattern — always cohort-scoped (CHRT-02 enforced)"
    - "format(date, 'yyyy-MM-dd') for date → input[type=date] string conversion"
    - "updateHackathon.bind(null, hackathon.id) for fixed-id edit action"

key-files:
  created:
    - app/actions/hackathons.ts
    - app/ui/admin/HackathonForm.tsx
    - app/(admin)/admin/hackathons/page.tsx
    - app/(admin)/admin/hackathons/new/page.tsx
    - app/(admin)/admin/hackathons/[id]/edit/page.tsx
  modified:
    - tests/hackathons.test.ts

key-decisions:
  - "Hackathon list page fetches via prisma.cohort.findMany + include.hackathons — ensures every hackathon is always cohort-scoped (CHRT-02)"
  - "coverImageUrl empty string coerced to null in DB — avoids storing empty strings for optional URL field"
  - "deleteHackathon form action cast to void-returning type — base TypeScript limitation with Server Actions that return error objects"
  - "styled Link used for Edit navigation button (not Button asChild) — base-ui Button has no asChild prop"
  - "TDD RED + GREEN commits separate — test commit 978fadd, implementation commit 486c273"

patterns-established:
  - "Pattern 6: Hackathon form with cohort selector — HackathonForm accepts cohorts[] prop for cross-cohort selection"
  - "Pattern 7: Cohort-grouped list page — fetch cohorts with include.hackathons, filter empty cohorts in render"

requirements-completed: [ADMN-02, CHRT-02]

# Metrics
duration: 3min
completed: 2026-03-18
---

# Phase 1 Plan 04: Hackathon Admin CRUD Summary

**Hackathon Server Actions (create/update/delete) with cohort-scoped list, create, and edit admin pages using HackathonForm component with Zod validation and verifySession guards**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-18T06:01:57Z
- **Completed:** 2026-03-18T06:05:21Z
- **Tasks:** 2 (Task 1 TDD with RED + GREEN commits)
- **Files modified:** 6 (5 created, 1 modified)

## Accomplishments
- createHackathon, updateHackathon, deleteHackathon Server Actions — all call verifySession() before any DB write
- toSlug generates URL-safe slugs from hackathon titles; coverImageUrl empty string stored as null
- HackathonForm reusable client component with all 8 fields, cohort selector, validation error display, pending state
- Admin hackathon list groups hackathons under cohort headers — always cohort-scoped per CHRT-02
- Create (/admin/hackathons/new) and edit (/admin/hackathons/[id]/edit) pages functional
- All 7 hackathon tests pass; full suite 19/19 pass; TypeScript clean; production build succeeds with 3 new routes

## Task Commits

Each task was committed atomically:

1. **Task 1 (TDD RED): Hackathon action tests** - `978fadd` (test)
2. **Task 1 (TDD GREEN): createHackathon + updateHackathon + deleteHackathon** - `486c273` (feat)
3. **Task 2: Admin hackathon pages + HackathonForm** - `242cdd6` (feat)

_TDD tasks have separate test and implementation commits_

## Files Created/Modified
- `app/actions/hackathons.ts` - createHackathon, updateHackathon, deleteHackathon Server Actions with verifySession, Zod, slug, null coercion
- `app/ui/admin/HackathonForm.tsx` - Reusable client form component with cohort selector, 8 fields, useActionState
- `app/(admin)/admin/hackathons/page.tsx` - Admin list page grouped by cohort, track badge, date range, delete form action
- `app/(admin)/admin/hackathons/new/page.tsx` - Create page using HackathonForm with createHackathon
- `app/(admin)/admin/hackathons/[id]/edit/page.tsx` - Edit page pre-filled with all values, params awaited (Next.js 16), updateHackathon bound with id
- `tests/hackathons.test.ts` - 7 passing tests: cohortId FK, slug generation, Zod validation, verifySession, delete, update

## Decisions Made
- Hackathon list page uses `prisma.cohort.findMany({ include: { hackathons: ... } })` not `prisma.hackathon.findMany()` — ensures CHRT-02 cohort scope is architecturally enforced, not just a where-clause added later
- `coverImageUrl: data.coverImageUrl || null` — empty string coerced to null; avoids invalid empty-string URL in DB
- `deleteHackathon.bind(null, h.id) as (formData: FormData) => Promise<void>` — TypeScript requires form action to return void; the cast preserves Server Action semantics while satisfying the type checker
- Used styled `<Link>` for Edit navigation button — base-ui Button has no `asChild` prop (established pattern from Plan 03)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript error on deleteHackathon form action**
- **Found during:** Task 2 (TypeScript check after creating admin pages)
- **Issue:** `deleteHackathon` returns `Promise<{message: string} | undefined>` but HTML form `action` prop expects `(formData: FormData) => void | Promise<void>` — TypeScript error TS2322
- **Fix:** Cast `deleteHackathon.bind(null, h.id)` to `(formData: FormData) => Promise<void>` — Server Action semantics preserved, TS error resolved
- **Files modified:** `app/(admin)/admin/hackathons/page.tsx`
- **Verification:** `npx tsc --noEmit` exits 0; `npm run build` succeeds
- **Committed in:** `242cdd6` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — form action return type mismatch)
**Impact on plan:** Fix required for TypeScript correctness. No functional scope change.

## Issues Encountered
- base-ui Button form action return type incompatibility with Server Actions that return error objects. Type cast is the correct pattern for this project.

## Phase 1 Requirements Coverage

- CHRT-01: Cohort model + admin CRUD (Plan 03) ✓
- CHRT-02: All hackathon queries cohort-scoped via include pattern ✓
- ADMN-01: Admin auth with session management (Plan 02) ✓
- ADMN-02: Hackathon CRUD admin pages (this plan) ✓
- ADMN-04: Admin cohort management (Plan 03) ✓

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Full admin CRUD for Cohorts and Hackathons operational
- Phase 2 (Member UI) can proceed: Cohort → Hackathon → Team hierarchy is fully manageable
- verifySession() + proxy.ts double layer protects all /admin routes
- HackathonForm pattern (action prop + useActionState + cohorts prop) established and reusable
- Delete cascade: deleting a Hackathon removes all child Teams and Members (per Prisma schema onDelete: Cascade)

## Self-Check: PASSED

All files found on disk:
- app/actions/hackathons.ts - FOUND
- app/ui/admin/HackathonForm.tsx - FOUND
- app/(admin)/admin/hackathons/page.tsx - FOUND
- app/(admin)/admin/hackathons/new/page.tsx - FOUND
- app/(admin)/admin/hackathons/[id]/edit/page.tsx - FOUND
- tests/hackathons.test.ts - FOUND
- .planning/phases/01-foundation/01-04-SUMMARY.md - FOUND

All commits found in git log:
- 978fadd (test RED)
- 486c273 (feat GREEN)
- 242cdd6 (feat pages)

---
*Phase: 01-foundation*
*Completed: 2026-03-18*
