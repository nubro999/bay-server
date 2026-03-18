# Domain Pitfalls

**Domain:** Hackathon team management platform (university, no-auth, honor system)
**Project:** BAY Server
**Researched:** 2026-03-17
**Confidence:** MEDIUM — based on well-established patterns in community/event management platforms; no-auth specifics from training knowledge (WebSearch unavailable in this session)

---

## Critical Pitfalls

Mistakes that cause rewrites, data integrity failures, or platform abandonment.

---

### Pitfall 1: Ghost Members and Seat Squatting

**What goes wrong:** Without member authentication, anyone can register any name on any team. Members who drop out or never show up remain on the roster, blocking real contributors from joining a full team (max 5). A team might show 5 members but have 2 active ones and 3 who registered and disappeared.

**Why it happens:** No-auth systems have no identity binding. There is nothing to stop a name from being registered twice, nothing to invalidate a stale registration, and no way to prove the person in slot 3 is who they claim to be.

**Consequences:**
- Teams hit the 5-member cap with phantom participants
- Active contributors cannot join a team they want
- Admin gets flooded with "can you remove X from my team" requests
- Data shown on team pages becomes misleading

**Prevention:**
- Implement admin-initiated member removal (not just team creation/deletion) — a single-click remove from the admin panel pays enormous dividends
- Consider a soft "leave team" button accessible by anyone who knows the team's URL; in an honor system this is acceptable risk since you already trust members
- Display "last activity" per member (when they last posted an update) so dormancy is visible without requiring auth
- Phase 1 (team creation/joining): build member removal into the admin panel from day one, not as an afterthought

**Detection:** Admin receives requests to remove inactive members; teams show 5 members but 0 weekly updates.

---

### Pitfall 2: Shared Admin Password Stored or Transmitted Insecurely

**What goes wrong:** The shared admin password is stored as plaintext in the database (or hardcoded in an env var checked into version control), or is transmitted over HTTP. A leaked `.env` file or a public GitHub repo exposes the entire admin surface.

**Why it happens:** "It's just a simple shared password" leads to skipping standard hashing. Devs hardcode it for local development and forget to swap it out. University projects are often pushed to public repos.

**Consequences:**
- Admin panel is permanently compromised if the repo is ever public
- All hackathon and team data can be edited or deleted by anyone
- No recovery path without a redeploy and password rotation

**Prevention:**
- Hash the admin password with bcrypt at rest — even for a shared password, this is one line of code
- Store the password in an environment variable, never in the codebase
- Add `.env` to `.gitignore` before the first commit, not after
- Use HTTPS in production (most deployment platforms enforce this by default — use one that does)
- Phase 1 (admin auth): treat the shared password with the same care as a real user password; the simplicity of the auth model does not simplify the security requirement

**Detection:** `.env` or config file appears in git history; password is a plain string in the database's admin table.

---

### Pitfall 3: No Team-Size Enforcement at the Database Level

**What goes wrong:** The 5-member cap is enforced only in application logic (an `if members.length >= 5` check in the API handler). A race condition, a direct DB query, or a future code change bypasses it. Teams end up with 6, 7, or more members.

**Why it happens:** Application-level validation feels sufficient until it isn't. Race conditions on concurrent requests are easy to miss in low-traffic university platforms because two people rarely click "join" simultaneously — until the platform gets popular at cohort launch time.

**Consequences:**
- Data integrity violation that is hard to clean up retroactively
- Unfair outcomes if one team has 7 members vs another's 4
- Credibility problem — "the platform let us have 6 members"

**Prevention:**
- Enforce the cap with a database constraint (a CHECK constraint on a count, or a trigger), not only in application code
- Use a database transaction + SELECT FOR UPDATE / row locking pattern when checking count and inserting member in the same operation
- Phase 1 (team joins): write a failing test for concurrent join attempts before implementing the endpoint

**Detection:** Any member count above 5 in the members table; check with a simple DB query after each cohort launch.

---

### Pitfall 4: Cohort Data Bleeds Across Cohorts

**What goes wrong:** The schema treats hackathons and teams as flat top-level entities. When the 18th BAY cohort begins, admins either reuse the same hackathon records (overwriting 17th BAY data) or create new ones with no cohort scoping — so the member list page shows all teams from all time, jumbled together.

**Why it happens:** Building for the immediate cohort (17th BAY) without modeling the recurring cohort lifecycle. "We'll deal with cohorts later" is a common deferral that creates a schema migration problem after live data exists.

**Consequences:**
- Cannot filter "17th BAY teams" vs "18th BAY teams" without a retroactive migration
- Hackathon listing page becomes cluttered after two cohorts
- Admin confusion: which hackathon belongs to which cohort?

**Prevention:**
- Model the `Cohort` entity from day one, even if the 17th BAY is the only cohort initially — `Cohort → Hackathon → Team → Member`
- Every public-facing list page must accept a cohort filter, even if there's only one cohort at launch
- Phase 1 (data model): establish the full entity hierarchy before writing any API endpoints; changing the schema after teams are created requires a migration with live data

**Detection:** Admin asks "how do I see only 17th BAY teams?" and there is no answer.

---

### Pitfall 5: Weekly Updates Treated as an Afterthought

**What goes wrong:** The update system is bolted on after the core team/join flow, resulting in a bare textarea with no structure. Members don't know what to write. Update rates drop to near zero after week 2. The feature exists but provides no value.

**Why it happens:** "Post an update" sounds trivial — it's just a text field. The effort to make updates actually useful (prompts, visibility, linking to the team page prominently) is underestimated.

**Consequences:**
- Admin leads have no signal on team progress
- The platform's primary value for oversight disappears
- Teams with zero updates look identical to teams with high activity

**Prevention:**
- Give updates a minimal structure at the DB level: `week_number` (or `period_start` date), `progress_text`, and optionally `blockers_text` — even if both are freeform
- Surface update recency prominently on team cards (e.g., "Last update: 12 days ago")
- Design the team page around updates, not just member list — updates are the primary content
- Phase 2 (updates): spec the update display on the team page before building the submission form; the display requirement drives the data model

**Detection:** Checking the updates table two weeks after launch reveals < 30% of teams have posted.

---

## Moderate Pitfalls

---

### Pitfall 6: Name Collision and Duplicate Registration

**What goes wrong:** Two members named "Jiwon Kim" join the same or different teams. The system has no way to distinguish them. One person accidentally joins twice under slightly different name spellings ("Ji-won Kim"). The roster becomes unreliable.

**Prevention:**
- Store name + role per team, and display both — "Jiwon Kim (Frontend)" is more unique than "Jiwon Kim"
- Allow admin to merge or remove duplicate entries without a full team edit workflow
- Do not use member names as identifiers or foreign keys — use surrogate integer/UUID primary keys for all member records

**Detection:** Two rows with near-identical names on the same team; members report "someone is impersonating me."

---

### Pitfall 7: External Hackathon Links Become Stale

**What goes wrong:** The Colosseum or XRPL Korea links stored in the hackathon record become 404s. Members click through and get broken pages. No one notices for weeks because the admin UI doesn't validate links.

**Prevention:**
- Store links as a nullable field with a "last verified" timestamp — even if you never run automated verification, the schema supports it later
- Display links with a visual indicator (external link icon + URL preview) so admins notice when they look broken during routine review
- Admin panel should make links easy to edit after creation — not just at creation time

**Detection:** Manual click-through during cohort start; member reports a 404 on the hackathon detail page.

---

### Pitfall 8: Admin Panel Has No Audit Trail

**What goes wrong:** One of the 2-3 admin leads deletes a team or changes a hackathon deadline. Nobody knows who did it or when. Disputes arise. Data is lost with no recovery path.

**Prevention:**
- Log every admin action with a timestamp and a "who" field — even just the action type, target record ID, and timestamp (no personal auth means "who" can be a session token or IP, which is better than nothing)
- Keep soft deletes (`deleted_at` timestamp) rather than hard deletes for teams and members — makes accidental deletion recoverable
- Phase 2 (admin panel): add soft delete and a simple action log table before shipping admin capabilities

**Detection:** Admin lead asks "did someone change this?" and no answer exists.

---

### Pitfall 9: Final Submission Overwrites Intermediate Progress

**What goes wrong:** The "final submission" form replaces the GitHub link each time it's submitted. A team resubmits to fix a typo and overwrites a previously correct submission. Or the "final" submission field is treated as mutable throughout the hackathon, making it impossible to tell when a team actually finalized.

**Prevention:**
- Model submissions with a `submitted_at` timestamp and treat the first submission as immutable unless an admin explicitly reopens it
- Allow admin to unlock a submission for editing rather than having all submissions always editable
- Display "Submitted on [date]" prominently on team pages

**Detection:** Team claims they submitted but the timestamp shows a date after the deadline.

---

### Pitfall 10: The Platform Is Built for the Current Cohort's Exact Structure, Not the Pattern

**What goes wrong:** The code hardcodes "EVM Study, Solana, Grants" as hackathon categories, or assumes exactly 3 hackathons per cohort, or has `is_evm_study_team` boolean columns. The next cohort has different hackathons and the code breaks or requires significant changes.

**Prevention:**
- All hackathon properties (name, description, external link, dates, max teams) must be data, not code — fully admin-managed
- Use generic labels: `hackathon.name`, not a type enum
- Cohort model should be admin-created with no assumptions about count or names
- Phase 1: verify the admin can create an entirely new cohort with entirely new hackathons from the UI before declaring the core feature complete

**Detection:** Adding a 4th hackathon to 17th BAY requires a code change rather than an admin action.

---

## Minor Pitfalls

---

### Pitfall 11: Team Page URLs Are Fragile

**What goes wrong:** Team pages are routed by team name (`/teams/alpha-builders`). When an admin renames a team, the old URL breaks. Members who bookmarked or linked the old URL get 404s.

**Prevention:**
- Use stable surrogate IDs in URLs (`/teams/42` or `/teams/abc123`), with team name as display-only
- If slug-based URLs are desired, implement redirects from old slug to new slug on rename

**Detection:** Team renamed in admin panel; old bookmarked URL returns 404.

---

### Pitfall 12: No Empty State Design Leads to a Confusing Launch Day

**What goes wrong:** On day one of a new cohort, the platform shows blank pages — no hackathons, no teams. Members who arrive early think the platform is broken and ping admin leads.

**Prevention:**
- Design empty states for: no hackathons in a cohort, no teams in a hackathon, no updates from a team
- Admin creates cohort and hackathons before announcing the platform URL to members

**Detection:** First member to visit the platform after go-live reports "the site is empty."

---

### Pitfall 13: Mobile Layout Ignored for "Web Only" Project

**What goes wrong:** "Web only" is interpreted as "desktop only." University students primarily use phones. The minimal white Notion/Linear aesthetic often uses large whitespace that collapses poorly on small screens.

**Prevention:**
- "Web only" means no native mobile app — the web app must still be responsive
- Test team list and team detail pages at 375px width during development, not just before launch
- Keep the layout single-column on mobile; the design aesthetic translates well to mobile if whitespace is treated as padding rather than fixed width

**Detection:** Any team page or list page viewed at 375px reveals horizontal scroll or text overflow.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Data model / schema design | Cohort bleed (Pitfall 4) — missing Cohort entity | Establish `Cohort → Hackathon → Team → Member` hierarchy before any API work |
| Team join endpoint | Race condition bypasses 5-member cap (Pitfall 3) | DB constraint + transaction; concurrent join test |
| Admin auth setup | Plaintext password in env or repo (Pitfall 2) | bcrypt hash; `.env` in `.gitignore` before first commit |
| Member management | Ghost members blocking team capacity (Pitfall 1) | Admin remove-member action in Phase 1, not Phase 2 |
| Weekly updates | Unstructured updates abandoned after week 2 (Pitfall 5) | Spec update display on team page before building submission |
| Admin panel | No audit trail; hard deletes (Pitfall 8) | Soft deletes + action log table before shipping admin |
| Final submission | Timestamp and mutability unclear (Pitfall 9) | `submitted_at` timestamp; admin-controlled reopen |
| Hackathon structure | Hardcoded current cohort assumptions (Pitfall 10) | All hackathon properties fully data-driven from day one |

---

## Sources

- Project context: `/home/nubroo/bay-server/.planning/PROJECT.md`
- Domain knowledge: patterns from community management, event registration, and no-auth honor-system platforms (training knowledge, MEDIUM confidence)
- Race condition / DB constraint patterns: standard relational database best practices (HIGH confidence)
- Auth storage patterns: OWASP password storage guidelines (HIGH confidence)

**Note:** WebSearch was unavailable during this research session. Findings are drawn from established software engineering patterns applied to this specific domain context. Claims about common hackathon platform failure modes are MEDIUM confidence — based on training data patterns rather than verified recent sources.
