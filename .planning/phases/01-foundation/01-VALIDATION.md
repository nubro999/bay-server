---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| TBD | 01 | 1 | CHRT-01 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | CHRT-02 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | ADMN-01 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | ADMN-02 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| TBD | 01 | 1 | ADMN-04 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Vitest installed and configured
- [ ] Test utilities for Prisma (mock or test DB)
- [ ] Test utilities for Next.js API routes

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin login UI flow | ADMN-01 | Browser-based auth flow with cookies | Navigate to /admin, enter password, verify redirect to dashboard |
| Admin CRUD forms render | ADMN-02 | Visual UI verification | Create/edit/delete hackathon through admin UI |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
