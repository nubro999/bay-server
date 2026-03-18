# Roadmap: BAY Server

## Overview

BAY Server ships in four phases. Phase 1 establishes the schema and admin foundation — every subsequent phase depends on getting cohort-scoped data right from the start. Phase 2 delivers the complete member-facing experience (browsing, joining, updating, submitting) with design applied. Phase 3 closes the admin surface with team and member management UI. Phase 4 adds cohort archiving, making past cohort data permanently accessible as read-only institutional memory.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Schema, admin auth, and admin CRUD bootstrapping (completed 2026-03-18)
- [ ] **Phase 2: Member Experience** - Public hackathon browsing, team joining, progress, and submission
- [ ] **Phase 3: Admin Management** - Team and member management UI for admin leads
- [ ] **Phase 4: Cohort Archive** - Read-only past cohort views and UX polish

## Phase Details

### Phase 1: Foundation
**Goal**: The database schema is cohort-scoped and stable; admin leads can log in and create hackathons ready for members
**Depends on**: Nothing (first phase)
**Requirements**: CHRT-01, CHRT-02, ADMN-01, ADMN-02, ADMN-04
**Success Criteria** (what must be TRUE):
  1. Admin can log in with the shared password and reach a protected dashboard (wrong password is rejected)
  2. Admin can create a cohort (e.g. "17th BAY") and create hackathons under it with title, description, dates, and external link
  3. Admin can edit and delete a hackathon from the admin panel
  4. All hackathon and team data is stored and queried scoped to its parent cohort — no cross-cohort data leakage
  5. The `.env` admin password hash is bcrypt-hashed and `.gitignore` excludes the file from the first commit
**Plans**: 4 plans

Plans:
- [x] 01-01-PLAN.md — Bootstrap: Next.js 16, Prisma 7 schema (6 entities), Vitest test scaffold
- [x] 01-02-PLAN.md — Admin auth: jose JWT session, proxy.ts route guard, login/logout flow
- [x] 01-03-PLAN.md — Cohort CRUD: createCohort, updateCohort Server Actions and admin UI pages
- [x] 01-04-PLAN.md — Hackathon CRUD: createHackathon, updateHackathon, deleteHackathon and admin UI pages

### Phase 2: Member Experience
**Goal**: Members can browse hackathons, create or join a team without logging in, post weekly updates, and submit their final project
**Depends on**: Phase 1
**Requirements**: HACK-01, HACK-02, HACK-03, HACK-04, TEAM-01, TEAM-02, TEAM-03, TEAM-04, TEAM-05, PROG-01, PROG-02, PROG-03, DSGN-01, DSGN-02
**Success Criteria** (what must be TRUE):
  1. Cohort landing page lists all hackathon tracks with external platform links displayed prominently
  2. Hackathon page shows a live deadline countdown and all teams with member count and open spots
  3. Member can create a new team and join an existing team by entering only a name and role — no login required; a 6th join attempt is rejected
  4. Team detail page shows all members, chronological weekly updates, and the final submission (if submitted)
  5. Any team member can post a weekly progress update (text + optional link) and submit the final project (GitHub link + writeup) without logging in
  6. All public pages use the minimal white Notion/Linear aesthetic and are usable on mobile at 375px
**Plans**: 4 plans

Plans:
- [ ] 02-01-PLAN.md — Zod schemas, Server Actions (createTeam, joinTeam, createUpdate, upsertSubmission), and unit tests
- [ ] 02-02-PLAN.md — Public layout, cohort list, cohort landing, hackathon page with countdown and team browser
- [ ] 02-03-PLAN.md — Create team page, team detail page with members/updates/submission, join team form
- [ ] 02-04-PLAN.md — Progress update and submission forms, visual design verification checkpoint

### Phase 3: Admin Management
**Goal**: Admin leads can manage teams and members through the admin UI — removing ghost members, editing teams, and overseeing submissions
**Depends on**: Phase 2
**Requirements**: ADMN-03
**Success Criteria** (what must be TRUE):
  1. Admin can remove a member from any team (ghost member cleanup)
  2. Admin can edit a team name and delete a team from the admin panel
  3. Admin can view all submissions across all teams in a single admin view
**Plans**: TBD

### Phase 4: Cohort Archive
**Goal**: Past cohort data is permanently accessible as a read-only record — institutional memory for BAY survives across cohort cycles
**Depends on**: Phase 3
**Requirements**: CHRT-03
**Success Criteria** (what must be TRUE):
  1. Navigating to a past cohort (e.g. "17th BAY") shows its hackathons, teams, updates, and submissions in read-only form
  2. No create/join/update actions are available on archived cohort pages
  3. The active cohort and archived cohorts are visually distinct so members cannot confuse them
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/4 | Complete   | 2026-03-18 |
| 2. Member Experience | 0/4 | Planning complete | - |
| 3. Admin Management | 0/TBD | Not started | - |
| 4. Cohort Archive | 0/TBD | Not started | - |
