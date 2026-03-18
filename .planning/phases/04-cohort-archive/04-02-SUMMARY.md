---
phase: 04-cohort-archive
plan: 02
subsystem: ui
tags: [nextjs, tailwind, server-components, prisma]

# Dependency graph
requires:
  - phase: 04-cohort-archive
    plan: 01
    provides: isActive field on Cohort model, admin toggle, public archive visual distinction
provides:
  - Read-only enforcement on hackathon page (Create a Team hidden for archived cohorts)
  - 404 on create-team page for archived cohorts
  - Read-only enforcement on team detail page (Join, Update, Submission forms hidden)
  - Amber archive notice banners on hackathon and team detail pages
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "isArchived = !team.hackathon.cohort.isActive — derive boolean from nested include chain"
    - "notFound() guard after cohort.isActive check — direct URL access to create-team blocked for archived cohorts"
    - "{condition && ( <section> )} — conditional section render for form gating"

key-files:
  created: []
  modified:
    - app/(public)/[cohortSlug]/[hackathonSlug]/page.tsx
    - app/(public)/[cohortSlug]/[hackathonSlug]/teams/new/page.tsx
    - app/(public)/[cohortSlug]/[hackathonSlug]/teams/[teamId]/page.tsx

key-decisions:
  - "notFound() (404) on create-team page for archived cohorts — Create a Team link is already hidden, so a direct URL attempt should get 404 not a broken/confusing UI"
  - "isArchived derived from team.hackathon.cohort.isActive — no extra DB query; the include chain already fetches cohort"
  - "Submission display section kept visible when archived — members can still view their submitted project link"

patterns-established:
  - "Archive gate pattern: derive isArchived from existing include chain, conditionally render form sections, show amber banner at top of page"

requirements-completed: [CHRT-03]

# Metrics
duration: ~3min
completed: 2026-03-19
---

# Phase 4 Plan 2: Archive Read-Only Enforcement Summary

**Read-only gating on all public action points for archived cohorts: Create Team hidden/404, Join/Update/Submit forms hidden, amber banner on hackathon and team detail pages**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-19
- **Completed:** 2026-03-19
- **Tasks:** 2 (1 auto, 1 human-verify checkpoint)
- **Files modified:** 3

## Accomplishments
- Hackathon page hides Create a Team button and empty-state link when cohort is archived; shows amber archive banner
- Create team page returns 404 (`notFound()`) for archived cohorts, blocking direct URL access
- Team detail page hides Join this Team, Post an Update, and Submit Project / Update Submission form sections when cohort is archived; all read-only data (members, updates, existing submission) remains visible
- Amber archive notice banner added to team detail page when isArchived is true
- User visually verified all archive behaviors including admin toggle, public distinction, read-only enforcement, 404 on create-team, and unarchive restoration

## Task Commits

Each task was committed atomically:

1. **Task 1: Hide all action UI on archived cohort pages** - `f5e7be8` (feat)
2. **Task 2: Visual verification** - approved by user (no code commit — checkpoint)

**Plan metadata:** (docs commit pending)

## Files Created/Modified
- `app/(public)/[cohortSlug]/[hackathonSlug]/page.tsx` - Create a Team links gated by `cohort.isActive`; amber archive banner added
- `app/(public)/[cohortSlug]/[hackathonSlug]/teams/new/page.tsx` - `notFound()` guard when `!cohort.isActive`
- `app/(public)/[cohortSlug]/[hackathonSlug]/teams/[teamId]/page.tsx` - `isArchived` derived from include chain; Join/Update/Submit form sections gated; amber banner added

## Decisions Made
- `notFound()` on create-team for archived cohorts rather than a read-only notice — the Create a Team link is already hidden on the hackathon page, so any user reaching `/teams/new` on an archived cohort is navigating directly; returning 404 is the correct response
- `isArchived = !team.hackathon.cohort.isActive` — derives archive state from the existing include chain already present in the team detail page query; no additional DB call needed
- Submission display block kept fully visible when archived — participants should be able to view their submitted project link even in read-only mode

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Complete cohort archive system shipped: schema, admin toggle, public visual distinction, read-only enforcement on all action points
- Phase 04-cohort-archive is fully complete
- No blockers

---
*Phase: 04-cohort-archive*
*Completed: 2026-03-19*
