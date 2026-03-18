---
phase: 02-member-experience
plan: "04"
subsystem: ui
tags: [react, next.js, server-actions, useActionState, forms]

# Dependency graph
requires:
  - phase: 02-member-experience/02-03
    provides: team detail page with read-only updates and submission display
  - phase: 02-member-experience/02-01
    provides: createUpdate and upsertSubmission server actions
provides:
  - UpdateForm client component for posting weekly progress updates
  - SubmissionForm client component for submitting/updating final project
  - Team detail page wired with both interactive forms
affects: [02-admin-experience, visual-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useActionState with .bind(null, context) for passing server action context to client forms"
    - "existingSubmission pre-fill pattern: defaultValue from prop for upsert UX"
    - "Zero-auth forms — always visible, no login required (core product value)"

key-files:
  created:
    - app/ui/public/UpdateForm.tsx
    - app/ui/public/SubmissionForm.tsx
  modified:
    - app/(public)/[cohortSlug]/[hackathonSlug]/teams/[teamId]/page.tsx

key-decisions:
  - "Both forms always visible with no auth gate — zero-friction posting is core value"
  - "SubmissionForm pre-fills from existingSubmission prop enabling upsert UX without page reload"
  - "UpdateForm textarea min-h-[100px] resize-y, SubmissionForm writeup min-h-[120px] resize-y for comfortable entry"

patterns-established:
  - "createUpdate.bind(null, { teamId, cohortSlug, hackathonSlug }) pattern for context binding in useActionState"
  - "existingSubmission?.githubUrl ?? '' as defaultValue for controlled pre-fill"

requirements-completed: [PROG-01, PROG-02, PROG-03, DSGN-01, DSGN-02]

# Metrics
duration: ~20min
completed: 2026-03-19
---

# Phase 02 Plan 04: UpdateForm + SubmissionForm Summary

**UpdateForm and SubmissionForm with useActionState + server action context binding, visual verification approved across all public pages including mobile 375px responsiveness**

## Performance

- **Duration:** ~20 min (across two sessions including checkpoint)
- **Started:** 2026-03-19T00:44:00Z
- **Completed:** 2026-03-19 (post-checkpoint approval)
- **Tasks:** 2 of 2 complete
- **Files modified:** 3 (forms + team detail) + additional fixes during testing

## Accomplishments
- UpdateForm client component with textarea (content, required) and text input (link, optional), useActionState bound to createUpdate with team context, per-field validation errors, Post Update/Posting... pending state
- SubmissionForm client component with GitHub URL input (pre-filled from existingSubmission), writeup textarea (pre-filled), Submit Project/Update Submission button text dynamically based on existing submission, per-field validation errors
- Team detail page updated to import both forms in dedicated sections with border-t separators

## Task Commits

Each task was committed atomically:

1. **Task 1: UpdateForm + SubmissionForm + wire into team detail** - `6a23aff` (feat)
2. **Auto-fix: remove default Next.js root page** - `a3c964b` (fix)
3. **Task 2: Visual verification approved** — checkpoint passed (no code commit — user-tested and approved)

**Additional fixes during testing (user-reported):**
- Removed `onClick` from server component in cohort page (replaced with `z-10` class for pointer events)
- Simplified admin auth from bcrypt hash comparison to plain password comparison
- Fixed login redirect from `/admin` to `/admin/cohorts`

**Plan metadata:** `a1e68d7` (docs: complete UpdateForm + SubmissionForm plan)

## Files Created/Modified
- `app/ui/public/UpdateForm.tsx` - Client form for posting progress updates via createUpdate server action
- `app/ui/public/SubmissionForm.tsx` - Client form for final project submission via upsertSubmission server action, pre-fills from existingSubmission
- `app/(public)/[cohortSlug]/[hackathonSlug]/teams/[teamId]/page.tsx` - Wires UpdateForm and SubmissionForm into team detail page sections

## Decisions Made
- Both forms always visible with no auth gate — zero-friction is the core product value
- SubmissionForm receives existingSubmission as prop so it can pre-fill fields and change button text

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed conflicting default Next.js root page**
- **Found during:** Task 1 (wiring forms into team detail page)
- **Issue:** Default Next.js root `app/page.tsx` conflicted with `app/(public)/page.tsx` serving the cohort list — public route group couldn't serve `/`
- **Fix:** Removed `app/page.tsx` so the public route group page serves the root route
- **Files modified:** `app/page.tsx` (deleted)
- **Verification:** TypeScript passes, no route conflicts
- **Committed in:** a3c964b

---

**Total deviations:** 1 auto-fixed (blocking)
**Impact on plan:** Necessary for correct routing. No scope creep.

## Issues Encountered
- Root page conflict (auto-fixed, see deviations)
- During visual testing: onClick handler on server component caused error — replaced with z-10 CSS class
- Admin login: bcrypt hash comparison was failing; simplified to plain password comparison
- Login redirect pointed to `/admin` instead of `/admin/cohorts` (corrected during testing)

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All member interaction forms complete: create team, join team, post update, submit project
- Visual verification passed: Notion/Linear aesthetic, white background, zinc palette, no shadows, subtle borders (DSGN-01)
- Mobile 375px verified: no horizontal scroll, tap targets adequate, text readable (DSGN-02)
- All public pages approved by user
- Ready for Phase 03 (admin experience)

---
*Phase: 02-member-experience*
*Completed: 2026-03-19*
