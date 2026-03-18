# BAY Server

## What This Is

A web platform for BAY (Blockchain Academy Yonsei) to manage hackathon teams across cohorts. Members browse active hackathons, create or join teams (up to 5 per team), post weekly progress updates, and submit final projects — all without logging in. Admin leads manage hackathons, teams, and submissions through a password-protected admin panel. Past cohorts are preserved as read-only archives.

## Core Value

Members can quickly find and join hackathon teams with zero friction — no login required, just pick a team and start building.

## Requirements

### Validated

- ✓ Cohort management (17th BAY, future cohorts) — v1.0
- ✓ Hackathon creation with external links and dates — v1.0
- ✓ Team creation and joining (max 5 members per team) — v1.0
- ✓ Member registration: name and role per team — v1.0
- ✓ No login for regular members — open participation — v1.0
- ✓ Weekly progress updates per team — v1.0
- ✓ Final submission (GitHub link + writeup) — v1.0
- ✓ Team pages showing members, updates, and submissions — v1.0
- ✓ Admin panel protected by shared password — v1.0
- ✓ Admin can create/edit hackathons and manage teams — v1.0
- ✓ Minimal white design — clean, Notion/Linear aesthetic — v1.0
- ✓ Past cohorts viewable as read-only archive — v1.0

### Active

(None — v1.0 shipped all planned requirements)

### Out of Scope

- User accounts / OAuth for regular members — no login by design
- Real-time chat or messaging between teams — KakaoTalk already serves this
- Voting or judging system — external platforms own judging
- Payment or prize distribution — not needed for university club
- Mobile native app — responsive web covers this
- Rich text editor — plain text + optional link is sufficient

## Context

- BAY is a blockchain academy at Yonsei University
- Cohorts are recurring (17th BAY now, 18th BAY next, etc.)
- Each cohort runs ~3 hackathons tied to external platforms
- Current hackathons for 17th BAY:
  1. **EVM Study Team** — EVM-focused study/build group
  2. **Solana Team** — Solana hackathon via Colosseum
  3. **Grants Team** — Grants hackathon via XRPL Korea
- 2-3 admin leads share a single admin password
- Tech stack: Next.js 16, Prisma 7, PostgreSQL, Tailwind CSS
- Shipped v1.0 with 3,394 LOC TypeScript across 123 files

## Constraints

- **Design**: Minimal white, clean — inspired by Notion/Linear aesthetic
- **Auth**: No member login; admin access via shared password only
- **Team size**: Hard cap of 5 members per hackathon team
- **Cohort support**: Must support multiple cohorts (not just 17th BAY)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No member auth | Zero friction for joining teams — BAY is trust-based | ✓ Good — core value preserved |
| Shared admin password (plain text comparison) | Simple for 2-3 leads; bcrypt hash broke with Next.js env `$` interpolation | ✓ Good — works for small admin group |
| External hackathon links in DB | Each hackathon ties to an external platform (Colosseum, XRPL Korea) | ✓ Good |
| Recurring cohort model | BAY runs every semester, need to support 18th, 19th, etc. | ✓ Good |
| isActive Boolean for archive | Simplest approach — single field toggle, no migration complexity | ✓ Good |
| useActionState for forms | Next.js 16 pattern — progressive enhancement, server-side validation | ✓ Good |

---
*Last updated: 2026-03-19 after v1.0 milestone*
