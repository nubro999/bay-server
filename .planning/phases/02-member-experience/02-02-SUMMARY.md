---
phase: 02-member-experience
plan: 02
subsystem: ui
tags: [next.js, react, prisma, tailwind, date-fns, lucide-react]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "Prisma schema, db client, admin auth infrastructure"

provides:
  - "Public route group (public) with layout, cohort list, cohort landing, hackathon detail"
  - "TeamCard component with member count, full/open, submission status badges"
  - "Countdown stub component for Plan 02-01 to overwrite"
  - "Cohort-scoped hackathon queries enforced across all public pages"

affects:
  - 02-03-interactive-forms
  - 03-team-management

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Next.js 16 async params: const { slug } = await params"
    - "Cohort-scoped hackathon lookup: findFirst with cohortId filter (CHRT-02)"
    - "Public route group (public) separate from admin routes"
    - "Minimal Countdown stub pattern: Plan 02-01 overwrites with real implementation"

key-files:
  created:
    - app/(public)/layout.tsx
    - app/(public)/page.tsx
    - app/(public)/[cohortSlug]/page.tsx
    - app/(public)/[cohortSlug]/[hackathonSlug]/page.tsx
    - app/ui/public/TeamCard.tsx
    - app/ui/public/Countdown.tsx
  modified: []

key-decisions:
  - "Countdown stub created inline — Plan 02-01 will overwrite with real interval-based implementation"
  - "TeamCard is pure Server Component — no client interactivity needed for display"
  - "MAX_MEMBERS constant set to 5 in TeamCard — matches schema/product intent"
  - "External platform link uses <a> not Link — external URL requires full page nav"

patterns-established:
  - "Public pages: all params awaited at top of component (Next.js 16)"
  - "Hackathon lookup: always cohort-scoped via cohortId (CHRT-02 enforced in every query)"
  - "Notion/Linear aesthetic: bg-white, zinc text hierarchy, border-zinc-100/200, no shadows"
  - "Mobile layout: single column, px-4 sm:px-8 gutters, space-y-N stacking"

requirements-completed: [HACK-01, HACK-02, HACK-03, HACK-04, TEAM-03, TEAM-05, DSGN-01, DSGN-02]

# Metrics
duration: 8min
completed: 2026-03-18
---

# Phase 2 Plan 02: Public Pages Summary

**Read-only public pages: cohort list, cohort landing with hackathon cards, hackathon detail with countdown and team browser — Notion/Linear aesthetic, Next.js 16 async params, CHRT-02 cohort-scoped queries**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-03-18T06:13:13Z
- **Completed:** 2026-03-18T06:21:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Public route group with minimal BAY header layout (no sidebar, white/zinc aesthetic)
- Root cohort list and cohort landing pages with hackathon track cards, dates, external CTA buttons
- Hackathon detail page with cohort-breadcrumb, countdown widget, team browser, create-team CTA
- TeamCard component with member count badge, "Full" (red), "Submitted" (green), open-spots indicator
- Build passes cleanly: `npx tsc --noEmit` and `npm run build` both exit 0

## Task Commits

Each task was committed atomically:

1. **Task 1: Public layout + cohort list + cohort landing page** - `cd19995` (feat)
2. **Task 2: Hackathon detail page with countdown and team browser** - `08c78bd` (feat)

**Plan metadata:** _(docs commit to follow)_

## Files Created/Modified

- `app/(public)/layout.tsx` - Minimal public layout with BAY header, max-w-3xl main
- `app/(public)/page.tsx` - Root cohort list page, ordered by orderIndex desc
- `app/(public)/[cohortSlug]/page.tsx` - Cohort landing with hackathon track cards, external link CTA
- `app/(public)/[cohortSlug]/[hackathonSlug]/page.tsx` - Hackathon detail: header, countdown, team browser
- `app/ui/public/TeamCard.tsx` - Team card with member count, full/open/submitted badges
- `app/ui/public/Countdown.tsx` - Stub created; overwritten by Plan 02-01 with real interval implementation

## Decisions Made

- Countdown stub created since Plan 02-01 hadn't run yet — the stub matches the exact interface `{ endsAt: Date }` so Plan 02-01 can overwrite without changing callers. Plan 02-01 did subsequently write the real implementation (the file was updated during this execution).
- TeamCard is a pure Server Component — no client state needed for static display.
- `MAX_MEMBERS = 5` constant in TeamCard — centralizes the cap value instead of magic number.
- External platform link rendered as `<a>` (not Next.js `Link`) since it navigates to an external domain.

## Deviations from Plan

None - plan executed exactly as written. Countdown stub was expected per plan instructions ("If Plan 02-01 hasn't created it yet, create a minimal stub").

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All public read-only pages complete; Plan 02-03 can build interactive forms (join/create team) on top of these routes
- Team detail page route `/${cohortSlug}/${hackathonSlug}/teams/${team.id}` is linked from TeamCard but not yet implemented — Plan 02-03 creates it
- `/teams/new` route is linked from hackathon page but not yet implemented — Plan 02-03 creates it

---
*Phase: 02-member-experience*
*Completed: 2026-03-18*
