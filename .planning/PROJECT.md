# BAY Server

## What This Is

A web platform for BAY (Blockchain Academy Yonsei) to manage hackathon teams across cohorts. Members can browse active hackathons, join teams (up to 5 per team), post weekly progress updates, and submit final projects. Admin leads manage hackathons and review submissions. Currently serving the 17th BAY cohort with 3 hackathons: EVM Study, Solana, and Grants.

## Core Value

Members can quickly find and join hackathon teams with zero friction — no login required, just pick a team and start building.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Cohort management (17th BAY, future cohorts)
- [ ] Hackathon creation with external links (Colosseum, XRPL Korea, etc.) and dates
- [ ] Team creation and joining (max 5 members per team)
- [ ] Member registration: name and role per team
- [ ] No login for regular members — open participation
- [ ] Weekly progress updates per team
- [ ] Final submission (GitHub link + writeup)
- [ ] Team pages showing members, updates, and submissions
- [ ] Admin panel protected by shared password (2-3 BAY leads)
- [ ] Admin can create/edit hackathons and manage teams
- [ ] Minimal white design — clean, lots of whitespace (Notion/Linear vibe)
- [ ] Simple and neat UX

### Out of Scope

- User accounts / OAuth for regular members — no login by design
- Real-time chat or messaging between teams
- Voting or judging system
- Payment or prize distribution
- Mobile app — web only

## Context

- BAY is a blockchain academy at Yonsei University
- Cohorts are recurring (17th BAY now, 18th BAY next, etc.)
- Each cohort runs ~3 hackathons tied to external platforms
- Current hackathons for 17th BAY:
  1. **EVM Study Team** — EVM-focused study/build group
  2. **Solana Team** — Solana hackathon via [Colosseum](https://colosseum.com/)
  3. **Grants Team** — Grants hackathon via [XRPL Korea](https://xrplkorea.org/34)
- 2-3 admin leads share a single admin password
- Members join without creating accounts — honor system

## Constraints

- **Design**: Minimal white, clean — inspired by Notion/Linear aesthetic
- **Auth**: No member login; admin access via shared password only
- **Team size**: Hard cap of 5 members per hackathon team
- **Cohort support**: Must support multiple cohorts (not just 17th BAY)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No member auth | Zero friction for joining teams — BAY is trust-based | — Pending |
| Shared admin password | Simple for 2-3 leads, avoids user management complexity | — Pending |
| External hackathon links in DB | Each hackathon ties to an external platform (Colosseum, XRPL Korea) | — Pending |
| Recurring cohort model | BAY runs every semester, need to support 18th, 19th, etc. | — Pending |

---
*Last updated: 2026-03-17 after initialization*
