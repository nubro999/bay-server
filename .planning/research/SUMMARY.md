# Project Research Summary

**Project:** BAY Server — Hackathon Team Management Platform
**Domain:** University club hackathon coordination (no-auth, recurring cohorts)
**Researched:** 2026-03-17
**Confidence:** MEDIUM-HIGH

---

## Executive Summary

BAY Server is a straightforward CRUD web application for Blockchain Academy Yonsei (Yonsei University). Its defining constraints — no member authentication, a shared admin password for 2-3 leads, a hard cap of 5 members per team, and recurring cohort cycles — are well-understood patterns with established solutions. The correct architecture is a monolithic Next.js 16 application (App Router + Server Actions) backed by PostgreSQL via Prisma, deployed to Railway or Vercel + Neon. There is no novel technical problem here; the risk is entirely in getting the data model wrong or cutting corners on the few security-sensitive decisions.

The recommended approach is to start with a correct, cohort-scoped schema before writing a single API route. Every entity in the system (Hackathon, Team, Member, Update, Submission) must be scoped under a Cohort from day one — retrofitting this constraint after live data exists is expensive. The feature set is deliberately constrained: zero high-complexity features are in scope, all high-complexity anti-features (real-time chat, file upload, member auth, voting) are explicitly excluded. This means the build is achievable in a series of focused phases without research uncertainty blocking any phase.

The primary risks are: (1) ghost member accumulation on full teams due to the no-auth model — mitigated by building admin member-removal on day one, not as an afterthought; (2) the 5-member c
ap being violated by a race condition — mitigated by a database-level constraint combined with row-locking on the join transaction; (3) the admin password being stored insecurely — mitigated by bcrypt hashing and treating `.env` as sensitive from the first commit. None of these risks require design changes; they require discipline during implementation.

---

## Key Findings

### Recommended Stack

Next.js 16 (App Router, Turbopack, React 19) is the clear framework choice — it eliminates the need for a separate API layer, ships TypeScript by default, and its `useActionState` hook directly serves the admin panel's create/edit forms. Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`) and shadcn/ui (source-owned components built on Radix primitives) are the correct UI layer for the Notion/Linear minimal-white aesthetic. PostgreSQL on Neon (managed, free tier, zero ops) with Prisma 6 (auto-generated TypeScript types, Prisma Studio, migrations) is the right database choice for this relational data model. Authentication is intentionally minimal: `jose` for stateless JWT session cookies and `bcryptjs` for password hashing — no NextAuth.js or Clerk needed.

**Core technologies:**
- **Next.js 16**: Full-stack framework — App Router + Server Actions removes the need for a separate API service
- **TypeScript 5.1+**: Required, not optional — runtime errors in membership cap logic are expensive
- **PostgreSQL / Neon**: Relational model fits the entity hierarchy; Neon is zero-ops with a generous free tier
- **Prisma 6**: Auto-generated types, Prisma Studio for data inspection, battle-tested migrations
- **Tailwind CSS v4**: CSS-first config; dramatically faster builds than v3; correct for the target aesthetic
- **shadcn/ui**: Source-owned components — can be stripped to bone-minimal styling without fighting defaults
- **jose + bcryptjs**: 50-line custom admin session; no full auth library needed
- **Zod 3**: Server Action input validation; schema doubles as TypeScript type

See STACK.md for full alternatives analysis and installation commands.

### Expected Features

The feature set divides cleanly: everything is low-to-medium complexity, and all genuinely hard features are explicitly out of scope. The MVP is achievable in a single focused build.

**Must have (table stakes):**
- Cohort management — 17th BAY, future cohorts; every entity must be cohort-scoped
- Hackathon listing with external links, dates, and track information
- Team browser showing name, current size, and member list per hackathon
- Team creation and joining — name + role only, no login, hard 5-member cap enforced
- Team detail page — members, chronological progress updates feed, final submission
- Weekly progress updates — freetext + optional link; the platform's primary oversight value
- Final submission — GitHub link + writeup text; one per team
- Admin panel — shared password, hackathon CRUD, team and member management, member removal

**Should have (competitive differentiators):**
- Cohort archive — read-only past cohort data; institutional memory for BAY
- Team status indicators — "3/5 members", "submitted", "last update 12 days ago" (derived state, no new data needed)
- Multi-track cohort landing page — all hackathons for a cohort on one page
- Deadline countdown — derived from stored hackathon end dates
- Role tagging on members — free-text role field at join time (already modeled)

**Defer (v2+):**
- Admin submission review notes (private notes on submissions for internal evaluation)
- Soft-delete audit trail with admin action log (important but can follow initial ship)
- Role field as enum rather than free-text

**Explicit anti-features — do not build:**
Member accounts, real-time chat, voting/judging, payment, email notifications, rich text editor, file upload, team invites, per-cohort admin roles, native mobile app.

See FEATURES.md for full feature dependency graph and MVP recommendation.

### Architecture Approach

A single monolithic Next.js process handles both the public frontend and the admin panel. Public pages use React Server Components for fast SSR (no client JS bundle for reads). Interactive forms (join team, post update, submit project) use Client Components calling Next.js API routes. Admin mutations go through the same API routes, protected by a Next.js middleware that verifies the session cookie on all `/admin/**` paths — plus a redundant check inside each mutation handler (middleware alone does not protect direct API calls).

The entity hierarchy is `Cohort → Hackathon → Team → {Member[], Update[], Submission}`. All list queries are filtered by cohort. The 5-member cap is enforced via a DB-level transaction with row locking on the join endpoint, not only application-level `if` checks. Submissions use an upsert pattern (one per team) with a `submitted_at` timestamp. Slugs identify hackathons in public URLs; surrogate UUIDs identify teams (stable across renames).

**Major components:**
1. **Public frontend (RSC)** — landing page, hackathon detail, team browser, team detail; SSR with `revalidate: 60`
2. **Member mutation forms (Client Components)** — join team, post update, submit project; calls API routes
3. **Admin frontend** — cohort/hackathon CRUD, team and member management; all guarded by session cookie
4. **Next.js API routes** — input validation (Zod), business rule enforcement, Prisma calls
5. **Admin auth middleware** — cookie verification on all `/admin/**` routes; login via bcrypt compare + JWT cookie
6. **Prisma ORM + PostgreSQL** — type-safe queries, migrations, Prisma Studio for data inspection

See ARCHITECTURE.md for full schema sketch, data flow diagrams, anti-patterns to avoid, and suggested build order.

### Critical Pitfalls

1. **Ghost members blocking team capacity** — Without auth, dropped-out members hold seats indefinitely. Build admin-initiated member removal in Phase 1 (not Phase 2). Consider a public "leave team" button as an honor-system escape hatch. Display last-update recency per member.

2. **Admin password stored or transmitted insecurely** — Plaintext passwords in env vars or (worse) committed to a public repo permanently compromise the admin surface. Add `.env` to `.gitignore` before the first commit. Store `ADMIN_PASSWORD_HASH` (bcrypt), never the raw password.

3. **5-member cap violated by race condition** — Application-level `if members.length >= 5` checks fail under concurrent requests (cohort launch day is peak risk). Use `SELECT FOR UPDATE` row locking inside a Prisma transaction. Add a DB-level CHECK constraint as a secondary guard.

4. **Cohort data bleeding across cohorts** — Building without the `Cohort` entity, then attempting a retroactive migration after live data exists, is painful. Establish `Cohort → Hackathon → Team → Member` hierarchy before writing any API endpoints.

5. **Weekly updates abandoned after week 2** — Unstructured updates with no visibility become dead features. Give updates a `week_number` field at the DB level. Surface update recency prominently on team cards. Design the team page around updates as primary content, not as an afterthought below the member list.

See PITFALLS.md for moderate pitfalls (name collisions, stale external links, no audit trail, submission mutability, hardcoded cohort assumptions, fragile team URLs, empty state design, mobile layout).

---

## Implications for Roadmap

Based on combined research, a 4-phase structure is recommended. The build order is driven by the ARCHITECTURE.md dependency analysis: schema must be stable before APIs, APIs must be stable before frontend, member-facing features before admin polish.

### Phase 1: Foundation — Schema, Auth, and Admin Bootstrapping

**Rationale:** The data model is the most expensive thing to get wrong. All downstream work (APIs, frontend, queries) depends on the schema being correct and cohort-scoped from day one. Admin auth must exist before any mutation routes are wired. Pitfall 4 (cohort bleed) and Pitfall 2 (insecure admin password) are both Phase 1 risks — they cannot be fixed cheaply later.

**Delivers:** Working Postgres schema (all 6 entities), Prisma setup with migrations, admin login/session flow, admin cohort and hackathon CRUD, `.env` security hardened, deployment environment running.

**Addresses (from FEATURES.md):** Cohort management, admin authentication, hackathon creation, admin panel foundation.

**Avoids:** Pitfall 4 (cohort bleed — Cohort entity modeled from day one), Pitfall 2 (bcrypt + `.gitignore` from first commit), Pitfall 10 (all hackathon properties data-driven, nothing hardcoded).

**Research flag:** None — well-documented patterns. Standard patterns apply throughout.

---

### Phase 2: Public Member Flows — Browse, Join, and Participate

**Rationale:** Once the schema is stable and admin can create hackathons and teams, the core member value can be built. This phase delivers the primary user-facing loop. Pitfall 1 (ghost members) and Pitfall 3 (race condition on cap) are both Phase 2 risks — member removal must be in admin panel now, cap enforcement must be transaction-backed.

**Delivers:** Public hackathon listing, team browser, team detail page, team creation (member-initiated), team joining (name + role, cap enforced), weekly progress update posting, final submission form.

**Addresses (from FEATURES.md):** Hackathon listing, team browser, team creation/joining, member cap enforcement, team detail page, weekly progress updates, final submission, external link passthrough, mobile-responsive layout.

**Avoids:** Pitfall 1 (admin member-removal built now, not deferred), Pitfall 3 (DB transaction + row lock on join endpoint), Pitfall 5 (update display designed before submission form), Pitfall 9 (submission `submitted_at` timestamp; admin-controlled reopen), Pitfall 11 (UUID-based team URLs, not name-based), Pitfall 12 (empty states for no-hackathon and no-team views), Pitfall 13 (mobile tested at 375px during development).

**Research flag:** None — standard CRUD patterns. The race condition mitigation is a known Postgres pattern.

---

### Phase 3: Admin Management Panel — Full CRUD and Oversight

**Rationale:** Admin leads need a UI to manage teams and members, not raw API calls. This phase builds the admin frontend on top of the already-stable admin API routes from Phase 1. Pitfall 8 (no audit trail) is addressed here — soft deletes and an action log are built before admin panel ships, not after.

**Delivers:** Admin dashboard, team and member management UI (remove member, edit team, close submissions), cohort and hackathon editing, admin submission review (with timestamps), soft deletes on teams/members, basic action log.

**Addresses (from FEATURES.md):** Admin team management, admin submission review notes (partial), admin CRUD on all entities.

**Avoids:** Pitfall 8 (soft deletes + action log before shipping admin panel), Pitfall 7 (editable external links in admin, with visible URL preview), Pitfall 6 (admin can merge/remove near-duplicate member registrations).

**Research flag:** None — standard admin panel patterns with shadcn/ui Table, Dialog, and Form components.

---

### Phase 4: Polish — Differentiators, Archive, and UX

**Rationale:** With the core platform stable and in use for the 17th BAY cohort, the differentiating features that require no new data modeling can be added efficiently. These are all derived-state or display enhancements.

**Delivers:** Cohort archive (read-only past cohorts), team status indicators (member count badge, "submitted" badge, update recency), multi-track cohort landing page, deadline countdown, empty state improvements, performance tuning (`revalidate` headers, Prisma query optimization).

**Addresses (from FEATURES.md):** Cohort archive, team status indicator, multi-track cohort view, hackathon deadline countdown.

**Avoids:** No new pitfall risks — this phase adds display logic and read-only views only.

**Research flag:** None — all derived state from existing data model. No new integrations.

---

### Phase Ordering Rationale

- Schema-first ordering prevents the most expensive class of rework (retroactive migrations on live data).
- Admin auth in Phase 1 avoids the anti-pattern of building mutation routes and adding security later.
- Member flows before admin UI matches the dependency: admin API routes are built in Phase 1 (minimal), member APIs in Phase 2, admin UI in Phase 3 (consumes both).
- Polish in Phase 4 requires the full data model to be stable — all differentiators are derived from entities established in Phases 1-2.

### Research Flags

**Phases needing deeper research during planning:** None identified. All four phases use well-documented, established patterns (Next.js App Router, Prisma CRUD, Tailwind + shadcn/ui, bcrypt sessions). No novel integrations, no external APIs, no real-time requirements.

**Phases with standard patterns (skip research-phase):**
- Phase 1: Prisma schema design + Next.js middleware auth — extensively documented
- Phase 2: SSR public pages + form mutation API routes — Next.js official guide coverage
- Phase 3: Admin CRUD UI with shadcn/ui Table/Dialog/Form — standard patterns
- Phase 4: Derived state display + read-only archive views — trivial query additions

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core choices (Next.js 16, Tailwind 4, jose, Prisma) verified against official docs 2026-03-17. Minor versions for bcryptjs, date-fns, and Neon free tier limits are MEDIUM (not re-verified from npm/provider). |
| Features | MEDIUM | Primary source is PROJECT.md (HIGH). Domain comparisons (Devpost, HackerEarth, university tooling patterns) are training knowledge — external verification unavailable in this research session. |
| Architecture | HIGH | Standard CRUD application patterns. No experimental approaches recommended. Monolith + Prisma + Next.js API routes is a heavily documented pattern. |
| Pitfalls | MEDIUM | Race condition and auth storage pitfalls are HIGH-confidence (established DB and OWASP patterns). Ghost member and cohort bleed pitfalls are MEDIUM (domain inference from training knowledge; WebSearch unavailable). |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Neon free tier limits**: Exact current storage and branch limits not re-verified. Validate at account creation — if the 0.5 GB free tier is too small for multi-cohort historical data, upgrade to paid tier or evaluate Supabase (also free tier with Postgres).
- **Prisma v6 exact minor version**: Research used "6.x" — pin the exact version at install time and lock with `package-lock.json`.
- **Ghost member UX**: Research recommends a public "leave team" button as an honor-system escape hatch. Whether this creates more abuse risk than it solves is a product decision for the BAY leads to make before Phase 2 ships.
- **Mobile responsive breakpoints**: No specific breakpoint research was conducted. Tailwind's default `sm: 640px` breakpoints should be validated against the actual devices BAY members use (assumed: phones at 375-430px, desktop at 1280px+).

---

## Sources

### Primary (HIGH confidence)
- Next.js 16.1.7 official docs — https://nextjs.org/docs (verified 2026-03-17)
- Next.js authentication guide — https://nextjs.org/docs/app/guides/authentication (verified 2026-03-17)
- Next.js Server Actions guide — https://nextjs.org/docs/app/getting-started/updating-data (verified 2026-03-17)
- Tailwind CSS v4.2 — https://tailwindcss.com/blog/tailwindcss-v4 (verified 2026-03-17)
- Tailwind CSS v4 installation — https://tailwindcss.com/docs/installation (verified 2026-03-17)
- Project spec — `/home/nubroo/bay-server/.planning/PROJECT.md` (primary product requirements)

### Secondary (MEDIUM confidence)
- Prisma 6.x ORM — official recommendation pattern; exact minor version not npm-verified
- Neon hosted Postgres — known provider; free tier limits not re-verified at research time
- shadcn/ui — well-established community standard; version pinned to latest via CLI at install
- bcryptjs, date-fns v4 — standard Node.js patterns; exact patch versions not npm-verified
- Domain knowledge: Devpost, HackerEarth, Luma, and university internal tooling patterns — training knowledge, no external verification available in this session

### Tertiary (LOW confidence)
- Ghost member behavioral patterns — inferred from no-auth honor-system platform dynamics; needs validation against actual BAY cohort behavior after launch

---

*Research completed: 2026-03-17*
*Ready for roadmap: yes*
