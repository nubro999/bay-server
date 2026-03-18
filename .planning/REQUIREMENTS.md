# Requirements: BAY Server

**Defined:** 2026-03-18
**Core Value:** Members can quickly find and join hackathon teams with zero friction

## v1 Requirements

### Cohort

- [x] **CHRT-01**: Admin can create cohorts (e.g. "17th BAY", "18th BAY")
- [x] **CHRT-02**: All hackathons, teams, and data are scoped to a cohort
- [x] **CHRT-03**: Past cohorts are viewable as read-only archive

### Hackathon

- [x] **HACK-01**: Each hackathon has a title, description, start/end dates, and external link
- [x] **HACK-02**: Cohort landing page shows all hackathon tracks (EVM, Solana, Grants)
- [x] **HACK-03**: Hackathon page shows deadline countdown
- [x] **HACK-04**: External platform link (Colosseum, XRPL Korea) displayed prominently

### Team

- [x] **TEAM-01**: Member can create a team with a name within a hackathon
- [x] **TEAM-02**: Member can join a team by entering name and role (max 5 per team)
- [x] **TEAM-03**: Team browser shows all teams with member count and open spots
- [x] **TEAM-04**: Team detail page shows members, progress updates, and submission
- [x] **TEAM-05**: Team status indicators (member count, submission status, update recency)

### Progress

- [x] **PROG-01**: Team member can post weekly progress update (text + optional link)
- [x] **PROG-02**: Updates displayed chronologically on team detail page
- [x] **PROG-03**: Team can submit final deliverable (GitHub link + writeup)

### Admin

- [x] **ADMN-01**: Admin panel protected by shared password (bcrypt-hashed)
- [x] **ADMN-02**: Admin can create, edit, and delete hackathons
- [x] **ADMN-03**: Admin can manage teams (edit, delete) and remove members
- [x] **ADMN-04**: Admin can create and manage cohorts

### Design

- [x] **DSGN-01**: Minimal white design — clean, Notion/Linear aesthetic
- [x] **DSGN-02**: Mobile-responsive layout

## v2 Requirements

### Notifications

- **NOTF-01**: Admin submission review notes (private, internal)

### Social

- **SOCL-01**: Role tagging as structured enum (Frontend, Smart Contract Dev, PM, etc.)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Member authentication / accounts | Zero-friction joining is the core value; login destroys it |
| Real-time chat or DMs | KakaoTalk already serves this for BAY |
| Voting or judging system | External platforms (Colosseum, XRPL Korea) own judging |
| Payment or prize distribution | Not needed for university club context |
| Email / notification system | Small cohort; leads communicate via existing club channels |
| File upload / asset hosting | GitHub link in submission is sufficient |
| Mobile native app | Responsive web covers this |
| Rich text editor for updates | Plain text + optional link is sufficient at this scale |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CHRT-01 | Phase 1 | Complete |
| CHRT-02 | Phase 1 | Complete |
| CHRT-03 | Phase 4 | Complete |
| HACK-01 | Phase 2 | Complete |
| HACK-02 | Phase 2 | Complete |
| HACK-03 | Phase 2 | Complete |
| HACK-04 | Phase 2 | Complete |
| TEAM-01 | Phase 2 | Complete |
| TEAM-02 | Phase 2 | Complete |
| TEAM-03 | Phase 2 | Complete |
| TEAM-04 | Phase 2 | Complete |
| TEAM-05 | Phase 2 | Complete |
| PROG-01 | Phase 2 | Complete |
| PROG-02 | Phase 2 | Complete |
| PROG-03 | Phase 2 | Complete |
| ADMN-01 | Phase 1 | Complete |
| ADMN-02 | Phase 1 | Complete |
| ADMN-03 | Phase 3 | Complete |
| ADMN-04 | Phase 1 | Complete |
| DSGN-01 | Phase 2 | Complete |
| DSGN-02 | Phase 2 | Complete |

**Coverage:**
- v1 requirements: 21 total
- Mapped to phases: 21
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-18*
*Last updated: 2026-03-19 after Phase 2 completion — TEAM-01, TEAM-02, TEAM-04 marked complete*
