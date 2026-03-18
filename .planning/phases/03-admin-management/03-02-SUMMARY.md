---
phase: 03-admin-management
plan: "02"
subsystem: admin
tags: [admin, teams, submissions, server-actions, next15]
dependency_graph:
  requires: [03-01]
  provides: [admin-team-edit, admin-submissions-overview]
  affects: [admin-management-surface]
tech_stack:
  added: []
  patterns: [useActionState, server-component-fetch, bind-action-pattern]
key_files:
  created:
    - app/ui/admin/TeamForm.tsx
    - app/(admin)/admin/teams/[id]/edit/page.tsx
    - app/(admin)/admin/submissions/page.tsx
  modified: []
decisions:
  - "TeamForm uses typed TeamFormState rather than unknown — consistent with typed action signature from admin-teams.ts"
  - "Submissions page links team name to /admin/teams (list page) — no per-team detail page exists in admin"
metrics:
  duration: "~2min"
  completed: "2026-03-19"
  tasks_completed: 2
  files_created: 3
  files_modified: 0
---

# Phase 3 Plan 2: Admin Team Edit and Submissions Overview Summary

Admin team edit page (with reusable TeamForm component) and cross-team submissions overview page — completing the admin management surface.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | TeamForm component and team edit page | 0360fa3 | app/ui/admin/TeamForm.tsx, app/(admin)/admin/teams/[id]/edit/page.tsx |
| 2 | Admin submissions overview page | ea9a7ca | app/(admin)/admin/submissions/page.tsx |

## What Was Built

### Task 1 — TeamForm + Edit Page
- `app/ui/admin/TeamForm.tsx`: `'use client'` form component using `useActionState(action, {})` with typed `TeamFormState`. Pre-fills team name, shows field errors, disables button while pending.
- `app/(admin)/admin/teams/[id]/edit/page.tsx`: Async server component; awaits `params` (Next.js 16 async params), calls `verifySession()`, looks up team via `prisma.team.findUnique`, calls `notFound()` if missing, binds `updateTeam.bind(null, team.id)` and passes to `<TeamForm>`.

### Task 2 — Admin Submissions Page
- `app/(admin)/admin/submissions/page.tsx`: Lists all submissions across all teams ordered by `submittedAt desc`. Each row shows team name (link to /admin/teams), hackathon title (badge), cohort name, GitHub URL as external link, writeup preview (first 150 chars), and formatted submission date.

## Acceptance Criteria Verification

- TeamForm.tsx has `'use client'` on line 1: confirmed
- TeamForm.tsx contains `useActionState(action,`: confirmed
- TeamForm.tsx contains `name="name"`: confirmed
- Edit page contains `await verifySession()`: confirmed
- Edit page contains `const { id } = await params`: confirmed
- Edit page contains `updateTeam.bind(null, team.id)`: confirmed
- Edit page contains `notFound()`: confirmed
- Submissions page contains `await verifySession()`: confirmed
- Submissions page contains `prisma.submission.findMany`: confirmed
- Submissions page contains `s.githubUrl`: confirmed
- Submissions page contains `s.writeup`: confirmed
- Submissions page contains `format(s.submittedAt,`: confirmed
- `npx tsc --noEmit`: exits 0
- `npm run build`: exits 0, routes /admin/teams/[id]/edit and /admin/submissions compiled

## Deviations from Plan

None — plan executed exactly as written.

## Pending

Task 3 is a `checkpoint:human-verify` — awaiting human visual inspection of the complete admin management surface.

## Self-Check

### Created files exist:
- app/ui/admin/TeamForm.tsx: present (committed 0360fa3)
- app/(admin)/admin/teams/[id]/edit/page.tsx: present (committed 0360fa3)
- app/(admin)/admin/submissions/page.tsx: present (committed ea9a7ca)

### Commits exist:
- 0360fa3: feat(03-02): TeamForm component and team edit page
- ea9a7ca: feat(03-02): admin submissions overview page

## Self-Check: PASSED
