---
phase: 01-foundation
plan: 03
subsystem: admin
tags: [cohorts, server-actions, prisma, zod, next-js, tdd, vitest, slug-generation]

# Dependency graph
requires:
  - phase: 01-foundation/01-01
    provides: Next.js 16 bootstrap, Prisma 7 schema, Vitest scaffold, db.ts, definitions.ts
  - phase: 01-foundation/01-02
    provides: verifySession() DAL, proxy.ts route guard, admin auth pattern

provides:
  - "createCohort Server Action — verifySession guard, Zod validation, slug generation, orderIndex = max + 1"
  - "updateCohort Server Action — verifySession guard, Zod validation, name + slug update"
  - "Admin cohort list page at /admin/cohorts ordered by orderIndex asc"
  - "Admin create cohort page at /admin/cohorts/new"
  - "Admin edit cohort page at /admin/cohorts/[id]/edit"
  - "CohortForm reusable client component with useActionState and error display"

affects: [01-04, phase-02, all-hackathon-and-team-plans]

# Tech tracking
tech-stack:
  added: []  # No new deps; all in place from Plans 01/02
  patterns:
    - "toSlug: lowercase + replace spaces with dashes + strip non-alphanumeric"
    - "orderIndex = (max existing orderIndex ?? -1) + 1 for auto-assignment"
    - "updateCohort.bind(null, cohort.id) to create fixed-id action for edit page"
    - "Next.js 16: params in page components is a Promise — must be awaited"
    - "base-ui Button has no asChild — use styled <Link> for navigation buttons"

key-files:
  created:
    - app/actions/cohorts.ts
    - app/ui/admin/CohortForm.tsx
    - app/(admin)/admin/cohorts/page.tsx
    - app/(admin)/admin/cohorts/new/page.tsx
    - app/(admin)/admin/cohorts/[id]/edit/page.tsx
  modified:
    - tests/cohorts.test.ts

key-decisions:
  - "toSlug inline in cohorts.ts — not extracted to utils; simple enough to inline per RESEARCH.md Pattern 6"
  - "orderIndex auto-assigned as max + 1; reorder UI deferred to Phase 3 per CONTEXT.md"
  - "base-ui Button has no asChild prop — admin nav links use styled <Link> components instead"
  - "updateCohort bound with cohort.id via .bind(null, id) — aligns with Next.js Server Action partial application pattern"

patterns-established:
  - "Pattern 4: Server Action with bound id — use fn.bind(null, id) in Server Component, pass to CohortForm"
  - "Pattern 5: Reusable admin form — CohortForm accepts action prop, works for both create and edit"

requirements-completed: [CHRT-01, ADMN-04]

# Metrics
duration: 4min
completed: 2026-03-18
---

# Phase 1 Plan 03: Cohort Admin CRUD Summary

**Cohort Server Actions (create/update) with slug generation, orderIndex auto-assignment, and admin list/create/edit pages protected by verifySession()**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-18T05:55:48Z
- **Completed:** 2026-03-18T05:59:30Z
- **Tasks:** 2 (Task 1 TDD with RED + GREEN commits)
- **Files modified:** 6 (5 created, 1 modified)

## Accomplishments
- createCohort and updateCohort Server Actions with verifySession() guard, Zod validation, and slug generation
- toSlug function: "17th BAY" → "17th-bay" (lowercase, spaces to dashes, strip non-alphanumeric)
- orderIndex auto-assigned as max(existing) + 1; starts at 0 for first cohort
- CohortForm reusable client component using useActionState with validation error display
- Admin cohort list at /admin/cohorts with orderIndex ordering and hackathon count
- Create (/admin/cohorts/new) and edit (/admin/cohorts/[id]/edit) pages using CohortForm
- All 4 cohort tests pass; TypeScript clean; production build succeeds with 3 new routes

## Task Commits

Each task was committed atomically:

1. **Task 1 (TDD RED): Cohort action tests** - `6e743f2` (test)
2. **Task 1 (TDD GREEN): createCohort + updateCohort** - `ed4fb63` (feat)
3. **Task 2: Admin cohort pages + CohortForm** - `f103193` (feat)

_TDD tasks have separate test and implementation commits_

## Files Created/Modified
- `app/actions/cohorts.ts` - createCohort and updateCohort Server Actions with verifySession, Zod, slug, orderIndex
- `app/ui/admin/CohortForm.tsx` - Reusable client form component with useActionState and error display
- `app/(admin)/admin/cohorts/page.tsx` - Admin list page ordered by orderIndex asc, hackathon count
- `app/(admin)/admin/cohorts/new/page.tsx` - Create page using CohortForm with createCohort
- `app/(admin)/admin/cohorts/[id]/edit/page.tsx` - Edit page pre-filled with current name, updateCohort bound with id
- `tests/cohorts.test.ts` - 4 passing tests: slug, orderIndex, empty name rejection, verifySession call

## Decisions Made
- Used `toSlug` inline in cohorts.ts (not a shared utility) — simple enough to keep local per plan's RESEARCH.md guidance
- orderIndex auto-increments from max; reorder UI is explicitly deferred to Phase 3
- `updateCohort.bind(null, cohort.id)` used in edit page to produce a fixed-arity action for CohortForm
- Used styled `<Link>` instead of `<Button asChild>` — base-ui Button component has no `asChild` prop (unlike shadcn/radix buttons)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Button asChild prop not supported**
- **Found during:** Task 2 (TypeScript check after creating admin pages)
- **Issue:** Plan used `<Button asChild><Link>...</Link></Button>` pattern, but project's Button uses `@base-ui/react/button` which has no `asChild` prop — caused TypeScript errors TS2322
- **Fix:** Replaced `<Button asChild>` wrappers with styled `<Link>` elements using equivalent Tailwind classes matching the button variants
- **Files modified:** `app/(admin)/admin/cohorts/page.tsx`
- **Verification:** `npx tsc --noEmit` exits 0; `npm run build` succeeds
- **Committed in:** `f103193` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — base-ui Button incompatibility)
**Impact on plan:** Fix required for TypeScript correctness. Visual result is identical. No functional scope change.

## Issues Encountered
- base-ui Button component lacks `asChild` prop that shadcn/radix Buttons support. Styled Link is the correct pattern for this project's component library.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Cohort CRUD fully operational — admin can create, list, and edit cohorts
- Plan 04 (Hackathon CRUD) can proceed immediately; it depends on cohorts existing at runtime
- /admin/cohorts route protected by verifySession() + proxy.ts double layer from Plan 02
- CohortForm pattern (action prop + useActionState) established for reuse in hackathon forms (Plan 04)

## Self-Check: PASSED

All files found on disk:
- app/actions/cohorts.ts - FOUND
- app/ui/admin/CohortForm.tsx - FOUND
- app/(admin)/admin/cohorts/page.tsx - FOUND
- app/(admin)/admin/cohorts/new/page.tsx - FOUND
- app/(admin)/admin/cohorts/[id]/edit/page.tsx - FOUND
- tests/cohorts.test.ts - FOUND
- .planning/phases/01-foundation/01-03-SUMMARY.md - FOUND

All commits found in git log:
- 6e743f2 (test RED)
- ed4fb63 (feat GREEN)
- f103193 (feat pages)

---
*Phase: 01-foundation*
*Completed: 2026-03-18*
