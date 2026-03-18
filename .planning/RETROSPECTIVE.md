# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-19
**Phases:** 4 | **Plans:** 12

### What Was Built
- Full-stack hackathon team management platform (Next.js 16 + Prisma 7 + PostgreSQL)
- Public pages: cohort list, hackathon browser with countdown, team create/join/detail
- Member actions: team creation, joining (max 5), weekly updates, final submission — all without login
- Admin panel: cohort/hackathon CRUD, team/member management, submissions overview
- Cohort archive: read-only mode with visual distinction and action hiding

### What Worked
- Wave-based execution kept phases fast — Phase 3 and 4 (simpler CRUD) flew through
- Visual verification checkpoints caught real issues (onClick server component error, admin auth, login redirect)
- Established patterns early in Phase 1 (Server Actions + verifySession + useActionState) made later phases mechanical
- Skipping research for Phases 3-4 was correct — they followed established patterns

### What Was Inefficient
- bcrypt hash in .env broke due to Next.js `$` interpolation — switched to plain text comparison mid-testing
- Phase 2 ROADMAP plan checkboxes weren't always updated by executors — required manual fixes
- Admin login redirected to `/admin` which had no page — should have planned the dashboard or redirect from the start

### Patterns Established
- `verifySession()` as first call in every admin Server Action
- `useActionState` + `.bind(null, id)` for form handling
- Public route group `(public)` with minimal header layout
- Admin route group `(admin)` with sidebar navigation
- `cohort.isActive` Boolean for archive toggle — simple and effective

### Key Lessons
1. Next.js .env files expand `$` in all quote styles — avoid bcrypt hashes in env vars, use plain comparison for small admin groups
2. Visual checkpoints are valuable — every human-verify caught at least one real issue
3. Established CRUD patterns in Phase 1 compound — Phases 3-4 planned and executed in minutes

### Cost Observations
- Model mix: ~30% opus (planning), ~70% sonnet (execution/verification)
- Total timeline: 2 days from project init to milestone complete
- Notable: Phases 3-4 each took ~1 session from plan to verified complete

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 4 | 12 | Initial project — established all patterns |

### Cumulative Quality

| Milestone | Tests | LOC | Files |
|-----------|-------|-----|-------|
| v1.0 | 42 | 3,394 | 123 |

### Top Lessons (Verified Across Milestones)

1. Visual verification checkpoints consistently catch issues that automated tests miss
2. Establishing strong patterns in Phase 1 makes subsequent phases near-mechanical
