# Architecture Patterns

**Domain:** Hackathon team management platform (multi-cohort, no member auth, shared admin password)
**Researched:** 2026-03-17
**Confidence:** HIGH — standard CRUD web app with well-established patterns

---

## Recommended Architecture

A monolithic Next.js application serving both the public frontend and the admin panel, backed by a single relational database (PostgreSQL). API routes live inside the same Next.js project under `/api`. No separate backend service is needed at this scale.

```
Browser
  │
  ├── Public pages (SSR/SSG via Next.js)
  │     ├── /                      → active cohort landing
  │     ├── /hackathons/[slug]      → hackathon detail + team list
  │     ├── /teams/[id]             → team page (members, updates, submission)
  │     └── /hackathons/[slug]/join → join or create a team
  │
  ├── Admin pages (Next.js, behind password middleware)
  │     ├── /admin                  → dashboard
  │     ├── /admin/cohorts          → create/edit cohorts
  │     ├── /admin/hackathons       → create/edit hackathons
  │     └── /admin/teams            → manage teams and members
  │
  └── API routes (Next.js /api, same process)
        ├── /api/cohorts/**
        ├── /api/hackathons/**
        ├── /api/teams/**
        ├── /api/members/**
        ├── /api/updates/**
        ├── /api/submissions/**
        └── /api/admin/auth         → password check → set session cookie

        [All API routes validate admin session cookie for mutations]

Next.js process
  └── Prisma ORM
        └── PostgreSQL
```

---

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Public frontend** | Display cohorts, hackathons, teams; allow joining/creating teams; member name+role entry | API routes (fetch) |
| **Admin frontend** | Create/edit cohorts, hackathons; manage teams and members; review submissions | API routes (fetch, with admin session cookie) |
| **API routes** | Validate inputs, enforce business rules (max 5 members, slug uniqueness), persist data | Prisma ORM |
| **Admin auth middleware** | Verify session cookie on all `/admin` page routes and mutation API routes | Next.js middleware |
| **Prisma ORM** | Type-safe query layer, schema migrations | PostgreSQL |
| **PostgreSQL** | Durable storage for all domain entities | — |

**Boundary rule:** The public frontend can read anything but can only write team joins, member additions, progress updates, and submissions — never admin-gated resources. Admin mutations require the session cookie.

---

## Data Model

### Entity Hierarchy

```
Cohort  (e.g., "17th BAY")
  └── Hackathon  (e.g., "Solana Hackathon", has external link + dates)
        └── Team  (name, max 5 members)
              ├── Member[]  (name, role — no account)
              ├── Update[]  (weekly progress, freetext)
              └── Submission  (GitHub link + writeup, one per team)
```

### Schema Sketch

```
Cohort
  id            UUID PK
  name          TEXT           -- "17th BAY"
  slug          TEXT UNIQUE    -- "17th-bay"
  isActive      BOOLEAN        -- which cohort is current
  createdAt     TIMESTAMP

Hackathon
  id            UUID PK
  cohortId      UUID FK → Cohort
  title         TEXT
  slug          TEXT UNIQUE
  externalUrl   TEXT           -- Colosseum, XRPL Korea, etc.
  startsAt      DATE
  endsAt        DATE
  createdAt     TIMESTAMP

Team
  id            UUID PK
  hackathonId   UUID FK → Hackathon
  name          TEXT
  createdAt     TIMESTAMP

Member
  id            UUID PK
  teamId        UUID FK → Team
  name          TEXT           -- display name, no auth
  role          TEXT           -- e.g., "Frontend", "Smart Contract"
  joinedAt      TIMESTAMP

Update
  id            UUID PK
  teamId        UUID FK → Team
  content       TEXT
  weekNumber    INTEGER        -- optional, for ordering
  createdAt     TIMESTAMP

Submission
  id            UUID PK
  teamId        UUID FK → Team  UNIQUE  -- one submission per team
  githubUrl     TEXT
  writeup       TEXT
  submittedAt   TIMESTAMP
```

### Key Constraints (enforced at API layer, not just DB)

- `Team.members.count <= 5` — checked before inserting a Member row
- `Submission` is 1:1 with Team — upsert pattern (create or update)
- `Hackathon.slug` unique — used in URLs
- `Cohort.isActive` — only one active at a time; use a transaction to flip

---

## Data Flow

### Public read (team page)

```
Browser GET /teams/[id]
  → Next.js SSR page handler
  → Prisma: Team + Members + Updates + Submission (single query with include)
  → Rendered HTML returned
```

### Member joining a team (no auth)

```
Browser POST /api/teams/[id]/members  { name, role }
  → API route: check team.members.count < 5
  → Prisma: INSERT Member
  → Return 201 { member }
```

### Admin creating a hackathon

```
Browser (admin) POST /api/hackathons  { cohortId, title, externalUrl, ... }
  → Next.js middleware: verify session cookie (admin password hash match)
  → API route: validate input
  → Prisma: INSERT Hackathon
  → Return 201 { hackathon }
```

### Admin login

```
Browser POST /api/admin/auth  { password }
  → Compare bcrypt hash of submitted password vs env ADMIN_PASSWORD_HASH
  → If match: set HttpOnly session cookie (signed JWT or iron-session)
  → Return 200
```

---

## Patterns to Follow

### Pattern 1: Next.js Middleware for Admin Guard

**What:** A `middleware.ts` at project root intercepts all `/admin/**` page and `/api/` mutation routes, checks the session cookie, and redirects to `/admin/login` on failure.

**When:** Any route that requires admin — avoids duplicating auth checks in every handler.

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const session = request.cookies.get('admin_session')
  if (!session || !verifySession(session.value)) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
}
export const config = { matcher: ['/admin/:path*'] }
```

**Note:** Mutation API routes (`POST /api/hackathons`, `DELETE /api/teams/[id]`, etc.) also check the cookie inside the handler — middleware alone is not sufficient for API routes since they can be called directly.

### Pattern 2: Prisma with Explicit Transactions for Invariants

**What:** Use `prisma.$transaction` when multiple writes must be atomic (e.g., deactivating all cohorts then activating the new one).

**When:** Any operation that touches multiple rows where partial failure would corrupt state.

### Pattern 3: Server Components for Public Pages, Client Components for Forms

**What:** Team list and team detail pages use React Server Components (fetching directly via Prisma, no round-trip). Join/update/submission forms use Client Components with `fetch` to API routes.

**When:** Read-heavy public pages benefit from RSC (no JS bundle, faster TTI). Interactive forms need client state.

### Pattern 4: Slug-based URLs for Hackathons

**What:** Hackathons get a URL-safe slug (`solana-2025`, `evm-study`) stored in DB. Teams get numeric/UUID ids.

**When:** Public URLs should be readable. Admin uses IDs.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Separate Backend Service

**What:** Running a dedicated Express/FastAPI backend alongside Next.js.

**Why bad:** At this scale (one university cohort, ~dozens of users), the operational cost of maintaining two services, two deployments, and cross-origin CORS config outweighs any benefit.

**Instead:** Use Next.js API routes. If the app ever outgrows Next.js API routes (unlikely for this use case), extract then.

### Anti-Pattern 2: Member "Accounts" Bolted On Later

**What:** Designing the Member table to look like a user account (email, password hash) even though no auth exists.

**Why bad:** Creates confusion about what data is actually trusted, and invites scope creep.

**Instead:** Member is just a `name` + `role` string attached to a team. No identity, no uniqueness constraint on name. The honor system is intentional.

### Anti-Pattern 3: Single `isAdmin` Flag Without Middleware

**What:** Checking admin status only in React components, not on the API route.

**Why bad:** API routes remain unprotected — any `curl` call bypasses frontend checks.

**Instead:** Always verify the session cookie inside mutation API route handlers, even with middleware in place.

### Anti-Pattern 4: Storing the Admin Password in Plaintext

**What:** `ADMIN_PASSWORD=secret` in env, compared with `===` in the login handler.

**Why bad:** Timing attacks; plaintext in logs if accidentally printed.

**Instead:** Store `ADMIN_PASSWORD_HASH` (bcrypt), use `bcrypt.compare` in the login handler.

---

## Suggested Build Order

Dependencies drive this order — each layer depends on the one above it being stable.

```
1. Database schema + Prisma setup
   └── All other components depend on this being correct first.
       Schema mistakes are cheapest to fix before any UI exists.

2. Core API routes (read endpoints)
   └── GET /cohorts, /hackathons, /teams, /teams/[id]
       Enables frontend development against real data shapes.

3. Public frontend pages
   └── Landing, hackathon list, team page.
       Can be built and demoed once read APIs exist.

4. Member mutation API routes + forms
   └── POST /teams (create), POST /teams/[id]/members (join)
       POST /teams/[id]/updates, PUT /teams/[id]/submission
       Core member workflow.

5. Admin auth (login + session + middleware)
   └── Must exist before any admin mutation routes are wired.

6. Admin API routes (mutations)
   └── POST/PUT/DELETE for cohorts, hackathons, teams.
       Protected by step 5.

7. Admin frontend panel
   └── Built last — admin can use raw API calls until this exists.
       Depends on all admin API routes being stable.
```

---

## Scalability Considerations

This platform serves a single university club. Scale expectations: ~100 concurrent users peak (during hackathon deadlines).

| Concern | At current scale | If BAY grows significantly |
|---------|-----------------|---------------------------|
| Database | Single Postgres instance is fine | Read replicas if needed |
| API | Next.js API routes on Vercel/Railway | Same — serverless scales horizontally |
| Sessions | Stateless JWT cookie (iron-session) | No change needed |
| Images/files | Not in scope — GitHub links only | Add S3 if file uploads ever added |
| Caching | SSR with `revalidate` is sufficient | Add Redis if DB queries become slow |

No caching layer is needed at launch. `next/cache` with `revalidate: 60` on public pages is sufficient.

---

## Deployment Target

**Recommended:** Railway (single service, managed Postgres add-on). Alternatively Vercel (Next.js) + Supabase (Postgres). Both are zero-ops for this scale.

Environment variables needed:
- `DATABASE_URL` — Postgres connection string
- `ADMIN_PASSWORD_HASH` — bcrypt hash of the shared admin password
- `SESSION_SECRET` — random 32-byte string for signing session cookies

---

## Sources

- Project requirements from `.planning/PROJECT.md` (HIGH confidence — primary source)
- Next.js App Router architecture: established patterns, knowledge cutoff August 2025 (HIGH confidence)
- Prisma ORM data modeling: established patterns (HIGH confidence)
- iron-session / next-auth credential provider for shared-password admin sessions: established pattern (HIGH confidence)
- Note: WebSearch unavailable during this research session. Architecture recommendations are derived from well-established CRUD application patterns and the specific project constraints. No novel or experimental patterns are recommended.
