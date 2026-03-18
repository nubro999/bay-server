---
phase: 02-member-experience
plan: 01
subsystem: api
tags: [zod, prisma, server-actions, tdd, vitest, react]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: "Prisma schema with Team, Member, Update, Submission models; db.ts prisma client; definitions.ts base schemas; Vitest test scaffold"
provides:
  - "createTeam server action with name validation and hackathonId scoping"
  - "joinTeam server action with 5-member cap enforced via prisma.$transaction"
  - "createUpdate server action with optional link field"
  - "upsertSubmission server action using prisma.submission.upsert"
  - "TeamSchema, MemberSchema, UpdateSchema, SubmissionSchema Zod schemas"
  - "computeDelta helper function for countdown math"
  - "Countdown client component with hydration-safe useState(null) pattern"
affects: [02-member-experience UI pages, any component consuming countdown or team actions]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server Actions with context object binding (no URL params needed in action body)"
    - "prisma.$transaction for atomic cap enforcement — count then create in same transaction"
    - "TEAM_FULL sentinel error string thrown inside transaction, caught outside to return structured error"
    - "computeDelta exported pure function — testable independently of React component"
    - "useState(null) initial state on Countdown — prevents SSR hydration mismatch"

key-files:
  created:
    - app/actions/teams.ts
    - app/actions/members.ts
    - app/actions/updates.ts
    - app/actions/submissions.ts
    - app/ui/public/Countdown.tsx
    - tests/teams.test.ts
    - tests/members.test.ts
    - tests/updates.test.ts
    - tests/submissions.test.ts
    - tests/countdown.test.ts
  modified:
    - app/lib/definitions.ts

key-decisions:
  - "joinTeam uses prisma.$transaction with TEAM_FULL sentinel — revalidatePath called after transaction, never inside (avoids Next.js redirect-inside-transaction pitfall)"
  - "All 4 member actions are intentionally NO-AUTH — zero-friction joining is core product value"
  - "computeDelta is a standalone exported function, not inlined in component — enables pure unit testing without React/DOM"
  - "Countdown initializes state to null — renders nothing on server, fills in after mount to prevent hydration mismatch"
  - "UpdateSchema link field uses .optional().or(z.literal('')) — form always submits empty string, not undefined"

patterns-established:
  - "Action context pattern: createTeam(context: { hackathonId, cohortSlug, hackathonSlug }, state, formData) — all routing data in context object"
  - "TDD RED-GREEN cycle with per-phase commits: test commit (failing) then feat commit (passing)"
  - "Empty string to undefined coercion before DB insert (link field in updates)"

requirements-completed: [TEAM-01, TEAM-02, PROG-01, PROG-03]

# Metrics
duration: 7min
completed: 2026-03-18
---

# Phase 2 Plan 01: Zod Schemas, Server Actions, and Countdown Summary

**4 no-auth server actions (createTeam, joinTeam, createUpdate, upsertSubmission) with Zod validation, 5-member cap via prisma.$transaction, and hydration-safe Countdown component with exported computeDelta**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-03-18T16:12:00Z
- **Completed:** 2026-03-18T16:15:35Z
- **Tasks:** 2 (each with TDD RED + GREEN commits)
- **Files modified:** 11

## Accomplishments

- 4 Server Action files created — createTeam, joinTeam, createUpdate, upsertSubmission — all without verifySession (intentional zero-friction design)
- joinTeam enforces 5-member cap atomically using prisma.$transaction with TEAM_FULL sentinel error thrown inside the callback and caught outside
- Countdown.tsx ships computeDelta as an exported pure function for unit testing, component initializes state to null to avoid SSR hydration mismatch
- definitions.ts extended with 4 new Zod schemas and 4 form state types
- 35 total tests pass (16 new + 19 existing), zero regressions

## Task Commits

Each task was committed atomically using TDD RED-GREEN pattern:

1. **Task 1 RED: Test files for team/member/update/submission actions** - `7b1c9c8` (test)
2. **Task 1 GREEN: createTeam, joinTeam, createUpdate, upsertSubmission** - `cdebacd` (feat)
3. **Task 2 RED: countdown.test.ts** - `5161fd4` (test)
4. **Task 2 GREEN: Countdown.tsx with computeDelta** - `08c78bd` (feat, included in 02-02 prior commit)

_Note: TDD tasks have multiple commits (test RED then feat GREEN)_

## Files Created/Modified

- `app/lib/definitions.ts` - Extended with TeamSchema, MemberSchema, UpdateSchema, SubmissionSchema + form state types
- `app/actions/teams.ts` - createTeam: validates name, creates team, revalidatePath + redirect
- `app/actions/members.ts` - joinTeam: MemberSchema validation, 5-member cap via prisma.$transaction
- `app/actions/updates.ts` - createUpdate: UpdateSchema validation, empty link converted to undefined
- `app/actions/submissions.ts` - upsertSubmission: SubmissionSchema validation, prisma.submission.upsert
- `app/ui/public/Countdown.tsx` - computeDelta pure function + Countdown client component
- `tests/teams.test.ts` - createTeam valid input and empty name validation tests
- `tests/members.test.ts` - joinTeam transaction, full-team rejection, $transaction usage tests
- `tests/updates.test.ts` - createUpdate valid, empty content, optional link tests
- `tests/submissions.test.ts` - upsertSubmission valid, invalid URL, empty writeup tests
- `tests/countdown.test.ts` - computeDelta: future/past/boundary/exact-breakdown tests

## Decisions Made

- joinTeam uses prisma.$transaction with TEAM_FULL sentinel — revalidatePath is called after the transaction completes (never inside), following the Next.js redirect-inside-transaction pitfall documented in RESEARCH.md
- All 4 member actions have NO verifySession call — zero-friction joining is the core product value; this is intentional, not an omission
- computeDelta is a standalone exported function (not embedded in render) — enables pure vitest unit testing without React or DOM
- Countdown initializes to useState(null) — server renders nothing, client fills in after mount, prevents hydration mismatch
- UpdateSchema link uses `.optional().or(z.literal(''))` — HTML forms always submit empty strings, not undefined; this accepts both

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 4 server actions ready to be wired into Next.js pages
- Countdown component ready for hackathon detail page
- joinTeam 5-member cap is race-condition safe via DB transaction
- No blockers for Phase 2 UI pages

---
*Phase: 02-member-experience*
*Completed: 2026-03-18*

## Self-Check: PASSED

All files and commits verified present.
