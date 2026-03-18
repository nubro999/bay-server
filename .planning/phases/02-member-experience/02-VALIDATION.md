---
phase: 02
slug: member-experience
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.0 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run tests/<relevant>.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | HACK-01 | smoke | `npx vitest run tests/hackathons.test.ts` | ✅ (extend) | ⬜ pending |
| 02-01-02 | 01 | 1 | HACK-02 | unit | `npx vitest run tests/cohorts.test.ts` | ✅ (extend) | ⬜ pending |
| 02-01-03 | 01 | 1 | HACK-03 | unit | `npx vitest run tests/countdown.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | HACK-04 | unit | `npx vitest run tests/hackathons.test.ts` | ✅ (extend) | ⬜ pending |
| 02-02-01 | 02 | 1 | TEAM-01 | unit | `npx vitest run tests/teams.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 1 | TEAM-02 | unit | `npx vitest run tests/members.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 1 | TEAM-03 | unit | `npx vitest run tests/teams.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-04 | 02 | 1 | TEAM-04 | unit | `npx vitest run tests/teams.test.ts` | ❌ W0 | ⬜ pending |
| 02-02-05 | 02 | 1 | TEAM-05 | unit | `npx vitest run tests/teams.test.ts -t "status"` | ❌ W0 | ⬜ pending |
| 02-03-01 | 03 | 2 | PROG-01 | unit | `npx vitest run tests/updates.test.ts` | ❌ W0 | ⬜ pending |
| 02-03-02 | 03 | 2 | PROG-02 | unit | `npx vitest run tests/updates.test.ts` | ❌ W0 | ⬜ pending |
| 02-03-03 | 03 | 2 | PROG-03 | unit | `npx vitest run tests/submissions.test.ts` | ❌ W0 | ⬜ pending |
| 02-04-01 | 04 | 2 | DSGN-01 | manual | N/A — browser inspection | N/A | ⬜ pending |
| 02-04-02 | 04 | 2 | DSGN-02 | manual | N/A — browser at 375px | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/teams.test.ts` — stubs for TEAM-01, TEAM-02, TEAM-03, TEAM-04, TEAM-05
- [ ] `tests/members.test.ts` — stubs for TEAM-02 edge cases (5-cap, 6th rejection, transaction)
- [ ] `tests/updates.test.ts` — stubs for PROG-01, PROG-02
- [ ] `tests/submissions.test.ts` — stubs for PROG-03 (create, upsert, validation)
- [ ] `tests/countdown.test.ts` — stubs for HACK-03 countdown math

Existing files to extend (not recreate):
- `tests/hackathons.test.ts` — add HACK-01, HACK-04 assertions
- `tests/cohorts.test.ts` — add HACK-02 assertions

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| White Notion/Linear aesthetic | DSGN-01 | Visual/subjective | Open pages in browser, compare against reference |
| Mobile usable at 375px | DSGN-02 | Layout validation | DevTools → responsive → 375px, check all pages |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
