# Feature Landscape

**Domain:** Hackathon team management platform (university blockchain academy, recurring cohorts)
**Researched:** 2026-03-17
**Confidence:** MEDIUM — based on domain knowledge of Devpost, HackerEarth, and university internal tooling patterns; external verification unavailable

---

## Table Stakes

Features users expect. Missing = product feels incomplete or unusable.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Hackathon listing | Members need to see what's active, dates, and what platform it links to | Low | Must show title, dates, external link, track |
| Team browser | Members need to see what teams exist before joining | Low | Visible team name, current size, member list |
| Team creation | Someone needs to start the team before others can join | Low | Name + optional description; creator registers themselves |
| Team joining | Core action — browse open teams, pick one, register your name and role | Low | No login; just name + role; enforces max-5 cap |
| Member cap enforcement | Prevents over-full teams; sets fairness expectations | Low | Hard cap of 5; show current count prominently |
| Team detail page | Central page for a team — who's on it, what they're building, updates, submission | Medium | Public, no login required |
| Weekly progress updates | BAY requires weekly check-ins; without this the platform has no retention value | Medium | Text + optional link per team per week; ordered chronologically |
| Final submission | Hackathons need deliverables; GitHub link + writeup is the minimum viable artifact | Low | One submission per team per hackathon |
| Admin: create hackathon | Leads need to set up each cohort's tracks before members can act | Low | Title, dates, external URL, cohort association |
| Admin: manage teams | Leads need to intervene (remove spam, fix member errors, close submissions) | Medium | CRUD on teams and members |
| Admin authentication | Protect admin actions from members; shared password acceptable at this scale | Low | Single shared password; session token; no per-user auth needed |
| Cohort scoping | All data must belong to a cohort; 17th BAY cannot bleed into 18th BAY | Medium | Every hackathon, team, and update scoped to a cohort |
| External link passthrough | Each hackathon ties to Colosseum, XRPL Korea, etc.; platform cannot be an island | Low | Store URL, render as prominent link on hackathon page |
| Mobile-responsive layout | Members browse on phones; non-responsive = unusable for majority | Medium | Web only per constraints, but must work on mobile viewport |

---

## Differentiators

Features that set this product apart. Not universally expected in this context, but high-value for BAY specifically.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Cohort archive | Previous cohort data stays visible and browsable — institutional memory for BAY | Low | Read-only view of past cohorts; no deletion |
| Progress timeline per team | Visual chronological feed of weekly updates shows momentum and effort to leads and other members | Low | Ordered list of updates with timestamps; differentiates active vs dormant teams |
| Team status indicator | At-a-glance: "3/5 members", "submitted", "no updates in 2 weeks" — reduces admin overhead | Low | Derived state, no new data model needed |
| Role tagging on members | Knowing who is "Frontend", "Smart Contract Dev", "PM" on each team helps other members find what they need | Low | Free-text or enum role field at join time |
| Multi-track view per cohort | Show all 3 hackathon tracks on one cohort page — reduces navigation friction | Low | Cohort landing page lists its hackathons |
| Admin: submission review notes | Leads can attach private notes to a team's submission for internal discussion | Medium | Not visible to members; useful for evaluation |
| Hackathon deadline countdown | Prominent timer on hackathon page increases submission rate | Low | Derived from dates already stored |

---

## Anti-Features

Features to explicitly NOT build for this platform.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Member authentication / accounts | Zero-friction joining is the core value prop; login destroys it; BAY is trust-based | Honor system join with name + role; admin can remove bad actors |
| Real-time chat or DMs | Out of scope per PROJECT.md; high complexity; KakaoTalk already serves this for BAY | Link to external communication if needed |
| Voting or judging system | Out of scope; external platforms (Colosseum, XRPL Korea) own judging | Link to external submission results |
| Payment or prize distribution | Out of scope; not needed for university club context | N/A |
| Automated email / notification system | High ops complexity; small cohort (university club); overkill | Leads communicate via existing club channels |
| Social feed / public activity stream | Adds noise; members care about their team's page, not a global feed | Keep focus on per-team and per-hackathon views |
| Rich text / markdown editor for updates | Adds complexity for marginal gain; plain text with optional URL is sufficient at this scale | Plain textarea + optional link field |
| File upload / asset hosting | S3, storage buckets — unnecessary complexity; GitHub is the artifact store | GitHub link in submission is sufficient |
| Team "invites" or access codes | Adds friction; open join model is simpler and appropriate for a trust-based club | Anyone can join any open team |
| Per-cohort admin roles / permissions | 2-3 leads share one password; role-based admin is over-engineering for this org size | Single shared admin password is sufficient |
| Mobile native app | Web only per PROJECT.md constraints | Responsive web covers this |

---

## Feature Dependencies

```
Cohort exists → Hackathon can be created
Hackathon exists → Team can be created
Team exists → Member can join (name + role)
Member joined → Progress update can be posted
Team exists → Final submission can be posted

Admin auth → Admin panel → Hackathon CRUD, Team CRUD
Cohort archive → Cohort exists with historical data
Team status indicator → Team exists + member count + submission state + update recency
Deadline countdown → Hackathon has end date stored
```

---

## MVP Recommendation

The minimum build that delivers core value for the 17th BAY cohort immediately:

**Prioritize (MVP core):**
1. Cohort + hackathon management (admin creates 17th BAY, creates EVM/Solana/Grants tracks)
2. Team creation and joining — name, role, max-5 enforcement, public team browser
3. Team detail page — members, progress updates feed, final submission
4. Weekly progress update posting — text + optional link, no auth
5. Admin panel — shared password, hackathon CRUD, team/member management
6. Final submission form — GitHub link + writeup text

**Second wave (high-value, low-cost):**
7. Cohort archive (read-only past cohorts) — important for institutional memory
8. Team status indicators (derived state, no extra data needed)
9. Multi-track cohort landing page
10. Deadline countdown

**Defer or cut:**
- Admin submission review notes (can use external notes for now)
- Role tagging as enum (free-text is fine initially)

---

## Feature Complexity Summary

| Tier | Features | Rationale |
|------|----------|-----------|
| Low complexity | Hackathon listing, team browser, team join/create, member cap, external links, admin auth, cohort scoping, archive, deadline countdown, status indicators | Standard CRUD, no third-party integrations, no auth flows beyond a single password |
| Medium complexity | Team detail page (assembles multiple data types), weekly updates feed (ordering, timestamps), admin team management (edge cases), cohort scoping (every query filtered by cohort), mobile-responsive layout | Requires careful data modeling and query design; not hard but needs deliberate attention |
| High complexity | None in scope | All high-complexity features are explicitly out of scope (chat, voting, auth, file upload) |

---

## Sources

- PROJECT.md: /home/nubroo/bay-server/.planning/PROJECT.md (HIGH confidence — primary spec)
- Domain knowledge: Devpost, HackerEarth, Luma, and university internal tooling patterns (MEDIUM confidence — external verification unavailable in this session)
- Feature complexity ratings: Based on standard web application patterns for CRUD-heavy platforms (MEDIUM confidence)
