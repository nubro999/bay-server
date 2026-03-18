# Phase 1: Foundation - Research

**Researched:** 2026-03-18
**Domain:** Next.js 16 / Prisma 7 / PostgreSQL (Neon) — schema design, admin auth, cohort-scoped CRUD
**Confidence:** HIGH (core stack verified against official docs; Prisma 7 specifics verified against prisma.io)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Hackathon data model**
- Fields: title, description (medium-length paragraph), start date, end date, external link URL, cover image URL (paste only, no file upload), track/category tag (free-text, admin types anything)
- Description is plain text, medium length — a few sentences with rules/context
- Cover image is a URL field only — no file upload or storage needed
- Track tags are free-text strings (e.g. "EVM", "Solana", "Grants") — flexible for future cohorts

**Cohort data model**
- Cohorts store name only (e.g. "17th BAY") — no date range or description
- URL routing uses slug-based paths (e.g. /17th-bay/hackathons) — readable and clean
- All cohorts are visible to members (no "active cohort" concept) — members see all and pick one
- Cohort display order is manually controlled by admin (not auto-sorted)

### Claude's Discretion

- Admin panel layout and navigation structure
- Admin login flow and session duration
- Cohort navigation pattern in admin (dropdown vs list page)
- Public homepage design (cohort list vs latest-first)
- Exact Prisma schema field types and constraints

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CHRT-01 | Admin can create cohorts (e.g. "17th BAY", "18th BAY") | Prisma Cohort model with `name`, `slug`, `orderIndex`; Server Action create flow |
| CHRT-02 | All hackathons, teams, and data are scoped to a cohort | `cohortId` FK on Hackathon; all queries filter by cohortId; cohort → hackathon → team hierarchy |
| ADMN-01 | Admin panel protected by shared password (bcrypt-hashed) | bcryptjs compare + jose JWT + HttpOnly cookie via `await cookies()`; `proxy.ts` route guard |
| ADMN-02 | Admin can create, edit, and delete hackathons | Server Actions + Zod validation + Prisma CRUD; `revalidatePath` after mutation |
| ADMN-04 | Admin can create and manage cohorts | Same Server Action pattern; `orderIndex` integer for display order; slug generation from name |
</phase_requirements>

---

## Summary

Phase 1 establishes the entire data layer and admin authentication foundation that every subsequent phase depends on. The correct build order is: project bootstrap → Prisma schema → migrations → admin auth → cohort CRUD → hackathon CRUD. Nothing else can start until the schema is stable and cohort-scoped, because retrofitting the `Cohort → Hackathon → Team` hierarchy after live data exists is an expensive migration.

The stack chosen in prior project research is confirmed current. Two important changes from the prior STACK.md must be applied: (1) Next.js 16 replaces `middleware.ts` with `proxy.ts` (deprecated, export renamed to `proxy()`); (2) Prisma 7 (released November 2025, now stable) introduces breaking changes including a required `prisma.config.ts` file, mandatory driver adapters, and explicit `prisma generate`. The prior research referenced Prisma 6.x — Phase 1 should decide whether to use Prisma 6 (6.19.2, last stable 6.x) or Prisma 7 (current). **Recommendation: use Prisma 7** — greenfield project, no migration cost, active support.

The admin auth pattern is fully confirmed by official Next.js 16 docs: bcryptjs password compare → jose JWT encrypt → `await cookies()` set HttpOnly cookie → `proxy.ts` optimistic redirect check → `verifySession()` DAL function in every Server Action and Route Handler. This is a ~100 line implementation with no full auth library needed.

**Primary recommendation:** Bootstrap with `create-next-app`, set up Prisma 7 with `prisma.config.ts` and `@prisma/adapter-pg`, define the full six-entity schema (Cohort, Hackathon, Team, Member, Update, Submission) before writing any API code, then implement admin auth, then cohort/hackathon CRUD.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.1.7 (stable) | Full-stack framework — App Router, Server Actions, Route Handlers | Eliminates separate API service; TypeScript-first; `useActionState` for admin forms; Turbopack default bundler |
| TypeScript | 5.1+ (bundled) | Type safety | Bundled with Next.js; required — runtime errors in membership cap logic are expensive |
| React | 19.2 (bundled) | UI rendering | Bundled; `useActionState` for Server Action forms directly useful in admin panel |
| PostgreSQL | 16.x via Neon | Relational database | Relational model matches entity hierarchy; Neon is zero-ops managed Postgres with generous free tier |
| Prisma ORM | 7.x (current stable) | Database access, schema, migrations | Auto-generated TypeScript types; Prisma Studio; battle-tested migrations; `prisma.config.ts` replaces scattered env config |
| jose | 5.x | JWT sign/verify for session cookie | Explicitly recommended in Next.js 16 official auth guide; compatible with Node.js runtime |
| bcryptjs | 2.x | bcrypt password hashing | Pure-JS bcrypt; no native build step; `bcrypt.compare` for timing-safe comparison |
| Zod | 3.x | Input validation for Server Actions | Official Next.js recommendation; schema doubles as TypeScript type; integrates with `useActionState` |
| Tailwind CSS | 4.2 | Utility-first styling | CSS-first config (`@theme {}`, no `tailwind.config.js`); correct for Notion/Linear minimal-white aesthetic |
| shadcn/ui | latest (via CLI) | Pre-built accessible UI components | Source-owned (CLI copies into repo); built on Radix UI; Table, Form, Dialog needed for admin panel |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@prisma/adapter-pg` | 7.x | Prisma driver adapter for PostgreSQL | Required in Prisma 7 — all databases now require explicit driver adapters |
| `pg` | 8.x | PostgreSQL client (used by adapter-pg) | Required by `@prisma/adapter-pg` |
| `server-only` | latest | Prevents server-side code leaking to client bundle | Add to all files containing DB queries or session logic |
| `clsx` + `tailwind-merge` | latest | Conditional Tailwind class merging | Required by shadcn components; use for conditional class logic |
| `date-fns` | 4.x | Date formatting (hackathon dates, display) | Lightweight, tree-shakeable |
| `slugify` (or manual) | — | Generate URL-safe slug from cohort/hackathon name | Cohort slug (e.g. "17th-bay") and hackathon slug used in public URLs |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Prisma 7 | Prisma 6 (6.19.2) | Prisma 6 has simpler setup (no `prisma.config.ts`, no mandatory adapters) and is still supported, but is now a previous major version. Greenfield project — no migration cost argues for Prisma 7. |
| Custom jose session | iron-session | iron-session is simpler API but is an additional dependency; jose is explicitly recommended by official Next.js 16 auth docs and handles JWT directly |
| Neon | Supabase | Both are zero-ops managed Postgres; Neon's free tier is well-documented; either works — decision is infra preference |

**Installation:**

```bash
# Bootstrap Next.js 16 project (App Router, TypeScript, Tailwind, Turbopack)
npx create-next-app@latest bay-server --yes
cd bay-server

# Initialize shadcn/ui (choose "New York" style, neutral color)
npx shadcn@latest init

# Add shadcn components needed for admin panel
npx shadcn@latest add table dialog form badge button input label

# Prisma 7 (with PostgreSQL driver adapter)
npm install prisma@latest @prisma/client@latest @prisma/adapter-pg pg
npm install -D @types/pg
npx prisma init  # creates schema.prisma; then create prisma.config.ts manually

# Auth
npm install jose bcryptjs
npm install -D @types/bcryptjs

# Validation + Utilities
npm install zod server-only clsx tailwind-merge date-fns
```

---

## Architecture Patterns

### Recommended Project Structure

```
bay-server/
├── prisma/
│   ├── schema.prisma          # All 6 entity models
│   └── migrations/            # Generated by prisma migrate dev
├── prisma.config.ts           # Prisma 7: DB URL, schema path, migrations path
├── proxy.ts                   # Next.js 16: replaces middleware.ts — admin route guard
├── app/
│   ├── (admin)/               # Route group — all admin pages
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   │   └── page.tsx   # Login form
│   │   │   ├── cohorts/
│   │   │   │   └── page.tsx   # Cohort list + create
│   │   │   ├── hackathons/
│   │   │   │   └── page.tsx   # Hackathon list + create/edit/delete
│   │   │   └── page.tsx       # Admin dashboard
│   ├── (public)/              # Route group — public pages (Phase 2+)
│   ├── api/
│   │   └── admin/
│   │       └── logout/
│   │           └── route.ts   # POST to clear session cookie
│   ├── lib/
│   │   ├── session.ts         # encrypt(), decrypt(), createSession(), deleteSession()
│   │   ├── dal.ts             # verifySession() — Data Access Layer
│   │   ├── db.ts              # Prisma client singleton
│   │   └── definitions.ts     # Zod schemas + TypeScript types
│   ├── actions/
│   │   ├── auth.ts            # login Server Action (bcrypt compare + createSession)
│   │   ├── cohorts.ts         # createCohort, updateCohort, reorderCohorts Server Actions
│   │   └── hackathons.ts      # createHackathon, updateHackathon, deleteHackathon Server Actions
│   └── ui/
│       └── admin/             # Admin UI components
├── .env.local                 # DATABASE_URL, SESSION_SECRET, ADMIN_PASSWORD_HASH
├── .gitignore                 # MUST include .env.local before first commit
└── next.config.ts
```

### Pattern 1: Prisma 7 Database Client Singleton

**What:** A shared Prisma client with driver adapter, exported from a single `lib/db.ts` file. Prevents connection pool exhaustion during hot reloads in development.

**When:** Every DB query in the application uses this singleton.

```typescript
// app/lib/db.ts
// Source: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7
import 'server-only'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Pattern 2: Prisma 7 Configuration File

**What:** `prisma.config.ts` at project root replaces scattered env vars for DB config in Prisma 7.

**When:** Required for Prisma 7. Create this alongside `package.json` before running any Prisma commands.

```typescript
// prisma.config.ts
// Source: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7
import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
```

### Pattern 3: Cohort-Scoped Schema (Full 6-Entity Model)

**What:** The complete Prisma schema establishing the `Cohort → Hackathon → Team → {Member[], Update[], Submission}` hierarchy. All entities established in Phase 1 even if only Cohort and Hackathon are used until Phase 2.

**When:** Define the full schema before writing any API code. Schema mistakes are cheapest to fix before any UI exists.

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

// Note: datasource url is now in prisma.config.ts (Prisma 7)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Cohort {
  id          String      @id @default(cuid())
  name        String                          // "17th BAY"
  slug        String      @unique             // "17th-bay" — used in public URLs
  orderIndex  Int         @default(0)         // Admin-controlled display order
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  hackathons  Hackathon[]

  @@map("cohorts")
}

model Hackathon {
  id             String    @id @default(cuid())
  cohortId       String
  title          String
  slug           String    @unique             // "solana-2025" — used in public URLs
  description    String                        // Plain text, medium length
  startsAt       DateTime
  endsAt         DateTime
  externalUrl    String                        // Colosseum, XRPL Korea, etc.
  coverImageUrl  String?                       // Paste-only URL, nullable
  track          String                        // Free-text: "EVM", "Solana", "Grants"
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  cohort         Cohort    @relation(fields: [cohortId], references: [id], onDelete: Cascade)
  teams          Team[]

  @@index([cohortId])
  @@map("hackathons")
}

model Team {
  id           String    @id @default(cuid())
  hackathonId  String
  name         String
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  hackathon    Hackathon   @relation(fields: [hackathonId], references: [id], onDelete: Cascade)
  members      Member[]
  updates      Update[]
  submission   Submission?

  @@index([hackathonId])
  @@map("teams")
}

model Member {
  id        String    @id @default(cuid())
  teamId    String
  name      String
  role      String                        // Free-text: "Frontend", "Smart Contract Dev"
  joinedAt  DateTime  @default(now())

  team      Team      @relation(fields: [teamId], references: [id], onDelete: Cascade)

  @@index([teamId])
  @@map("members")
}

model Update {
  id         String    @id @default(cuid())
  teamId     String
  content    String
  link       String?                      // Optional URL
  weekNumber Int?                         // Optional; enables ordering by week
  createdAt  DateTime  @default(now())

  team       Team      @relation(fields: [teamId], references: [id], onDelete: Cascade)

  @@index([teamId])
  @@map("updates")
}

model Submission {
  id          String    @id @default(cuid())
  teamId      String    @unique           // One submission per team
  githubUrl   String
  writeup     String
  submittedAt DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  team        Team      @relation(fields: [teamId], references: [id], onDelete: Cascade)

  @@map("submissions")
}
```

### Pattern 4: Admin Auth — jose JWT + `await cookies()` (Next.js 16)

**What:** bcryptjs password compare → jose JWT encrypt → HttpOnly cookie via `await cookies()`. The `cookies()` call is async in Next.js 16 (breaking change from 15.x).

**When:** Login Server Action sets the cookie; `deleteSession()` clears it on logout.

```typescript
// app/lib/session.ts
// Source: https://nextjs.org/docs/app/guides/authentication (verified 2026-03-18)
import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secretKey = process.env.SESSION_SECRET!
const encodedKey = new TextEncoder().encode(secretKey)

export async function encrypt(payload: { isAdmin: boolean; expiresAt: Date }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch {
    return null
  }
}

export async function createSession() {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ isAdmin: true, expiresAt })
  const cookieStore = await cookies()   // MUST be awaited in Next.js 16

  cookieStore.set('admin_session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
}
```

```typescript
// app/lib/dal.ts  — Data Access Layer
// Source: https://nextjs.org/docs/app/guides/authentication (verified 2026-03-18)
import 'server-only'
import { cookies } from 'next/headers'
import { decrypt } from '@/app/lib/session'
import { redirect } from 'next/navigation'
import { cache } from 'react'

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get('admin_session')?.value
  const session = await decrypt(cookie)

  if (!session?.isAdmin) {
    redirect('/admin/login')
  }

  return { isAdmin: true }
})
```

```typescript
// app/actions/auth.ts
'use server'
import bcrypt from 'bcryptjs'
import { createSession, deleteSession } from '@/app/lib/session'
import { redirect } from 'next/navigation'

export async function login(state: unknown, formData: FormData) {
  const password = formData.get('password') as string

  const hash = process.env.ADMIN_PASSWORD_HASH!
  const match = await bcrypt.compare(password, hash)

  if (!match) {
    return { error: 'Invalid password' }
  }

  await createSession()
  redirect('/admin')
}

export async function logout() {
  await deleteSession()
  redirect('/admin/login')
}
```

### Pattern 5: `proxy.ts` Admin Route Guard (Next.js 16)

**What:** `proxy.ts` at project root intercepts all `/admin/**` requests, checks session cookie, and redirects unauthenticated users to `/admin/login`. Replaces deprecated `middleware.ts`.

**Critical change:** Export function is named `proxy` (not `middleware`). File is `proxy.ts` (not `middleware.ts`).

```typescript
// proxy.ts  (project root — same level as app/)
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/proxy (verified 2026-03-18)
import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/app/lib/session'

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Only guard /admin routes (not /admin/login itself)
  if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
    const cookie = request.cookies.get('admin_session')?.value
    const session = await decrypt(cookie)

    if (!session?.isAdmin) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

**Security note:** `proxy.ts` performs optimistic redirect only. Every Server Action and Route Handler that mutates data MUST also call `verifySession()` from the DAL — proxy alone is insufficient because API routes can be called directly.

### Pattern 6: Cohort Server Actions (create + display order)

**What:** Server Actions for cohort creation with slug generation and `orderIndex` for admin-controlled display order.

**When:** Admin creates a cohort; `orderIndex` determines display order on public cohort list page.

```typescript
// app/actions/cohorts.ts
'use server'
import { verifySession } from '@/app/lib/dal'
import { prisma } from '@/app/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const CohortSchema = z.object({
  name: z.string().min(1).max(100).trim(),
})

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export async function createCohort(state: unknown, formData: FormData) {
  await verifySession()

  const validated = CohortSchema.safeParse({ name: formData.get('name') })
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { name } = validated.data
  const slug = toSlug(name)

  // Place new cohort at end of display order
  const maxOrder = await prisma.cohort.aggregate({ _max: { orderIndex: true } })
  const orderIndex = (maxOrder._max.orderIndex ?? -1) + 1

  await prisma.cohort.create({
    data: { name, slug, orderIndex },
  })

  revalidatePath('/admin/cohorts')
  redirect('/admin/cohorts')
}
```

### Anti-Patterns to Avoid

- **`middleware.ts` in Next.js 16:** Deprecated. Must use `proxy.ts` with `export function proxy()`. Using `middleware.ts` with `export function middleware()` still works during the deprecation period but will be removed.
- **Sync `cookies()` in Next.js 16:** `cookies()` is now async — must `await cookies()`. Sync access throws at runtime.
- **Prisma 6.x setup in a new project:** Prisma 7 is current stable. A new project should not start on Prisma 6 in 2026; use Prisma 7 with `prisma.config.ts`.
- **Storing `ADMIN_PASSWORD_HASH` as plaintext password:** Store the bcrypt hash, not the raw password. Generate with `node -e "const b = require('bcryptjs'); b.hash('yourpassword', 10).then(console.log)"`.
- **`proxy.ts` as the sole auth guard:** Always double-check with `verifySession()` inside every mutation. Proxy can be bypassed by direct API calls.
- **Hard-deleting hackathons with live team data:** Use `onDelete: Cascade` in schema (already in Pattern 3) or warn admin before deletion. Cascade is acceptable at this scale.
- **Missing `.env.local` in `.gitignore` before first commit:** `.gitignore` must exclude `.env.local` before the first `git add`. A leaked `ADMIN_PASSWORD_HASH` is still a security risk even though it is hashed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Password hashing | Custom crypto hash | `bcryptjs` | bcrypt's work factor prevents brute force; timing-safe compare; one line |
| JWT session tokens | Custom base64 signing | `jose` (SignJWT, jwtVerify) | Correct HS256 implementation; explicitly recommended by Next.js 16 official auth docs |
| Form validation | Manual `if` checks | Zod + `safeParse` | Type inference; field-level error messages for `useActionState`; prevents bad data from reaching Prisma |
| DB migrations | Raw SQL files | `prisma migrate dev` | Tracks migration history; generates TypeScript types; handles up/down automatically |
| Slug generation | RegExp from scratch | One-liner or `slugify` package | Edge cases in Unicode names; Korean characters in team names if they occur |
| CSS component library | Custom components | shadcn/ui (CLI-installed) | Radix UI accessible primitives; already styled for Notion/Linear aesthetic with neutral Tailwind colors |

---

## Common Pitfalls

### Pitfall 1: `cookies()` Must Be Awaited (Next.js 16 Breaking Change)

**What goes wrong:** Code written for Next.js 15 uses `cookies().get(...)` synchronously. In Next.js 16 this throws at runtime with a message about accessing dynamic APIs.

**Why it happens:** Next.js 16 made `cookies()`, `headers()`, and `draftMode()` async to support the new Cache Components model. The previous sync access is removed.

**How to avoid:** Always `await cookies()`. Pattern: `const cookieStore = await cookies(); cookieStore.get(...)` or inline: `(await cookies()).get(...)`.

**Warning signs:** Runtime error mentioning "cookies" and "async" during login or session reads.

### Pitfall 2: `middleware.ts` Deprecated — Use `proxy.ts`

**What goes wrong:** Creating `middleware.ts` with `export function middleware()`. This still works in Next.js 16 (backward compatible during deprecation period) but generates deprecation warnings and will break in a future version.

**Why it happens:** Prior research (from this project's STACK.md and ARCHITECTURE.md, dated 2026-03-17) referenced `middleware.ts`. This changed in Next.js 16.0.0 (October 2025).

**How to avoid:** Create `proxy.ts` at project root. Export function as `export function proxy()` (or default export). Use `export const config = { matcher: [...] }` — same syntax as before.

**Warning signs:** Build warning about deprecated `middleware.ts` during `next build`.

### Pitfall 3: Prisma 7 Requires `prisma.config.ts` and Explicit `prisma generate`

**What goes wrong:** (1) Running `npx prisma migrate dev` without `prisma.config.ts` fails — `DATABASE_URL` is no longer read from `schema.prisma` datasource block. (2) After migration, `@prisma/client` types are stale because `prisma generate` no longer runs automatically.

**Why it happens:** Prisma 7 moved DB config to `prisma.config.ts` and removed auto-generation to make the build process explicit.

**How to avoid:** Create `prisma.config.ts` before any Prisma commands. After every schema change: `npx prisma migrate dev && npx prisma generate`.

**Warning signs:** TypeScript errors about missing Prisma client types after a schema change; `prisma migrate dev` errors about no datasource URL.

### Pitfall 4: Cohort Display Order — Integer Gaps Cause Swap Complexity

**What goes wrong:** `orderIndex` is stored as sequential integers (0, 1, 2, 3). Reordering cohort 2 above cohort 1 requires updating two rows atomically. If you update only one row, you get duplicate `orderIndex` values.

**Why it happens:** Integer ordering is simple but any reorder requires a multi-row update.

**How to avoid:** Use a transaction for reorder operations: `prisma.$transaction([updateA, updateB])`. For Phase 1, cohort order is set at creation time (`max + 1`) — reordering UI is Claude's discretion for a later enhancement. A simple "move up / move down" admin action updating two rows in a transaction is sufficient.

**Warning signs:** Admin sees cohorts in wrong order after drag-and-drop or move operations.

### Pitfall 5: Cohort Bleed — Missing FK Scoping

**What goes wrong:** Queries for hackathons or teams omit the cohort filter. A query like `prisma.hackathon.findMany()` returns hackathons from all cohorts, mixing 17th BAY and 18th BAY data on the same page.

**Why it happens:** Easy to forget `where: { cohortId }` when starting with a single cohort (no visual difference yet).

**How to avoid:** Every hackathon list query must include `where: { cohortId: cohort.id }`. Establish this pattern in Phase 1 before any data exists — it is trivial to verify now and expensive to retrofit later.

**Warning signs:** Hackathon listing page shows hackathons from multiple cohorts when navigating to a specific cohort slug.

### Pitfall 6: `.env.local` Not in `.gitignore` Before First Commit

**What goes wrong:** `.env.local` containing `ADMIN_PASSWORD_HASH` is committed to git. Even if the repo is later made private, the secret is in git history and requires a full history rewrite to remove.

**Why it happens:** Developer forgets to check `.gitignore` before `git init` / `git add`.

**How to avoid:** The very first task in the build sequence must be: create `.gitignore` containing `.env.local`, `node_modules/`, `.next/` — then `git init`. Never `git add` before `.gitignore` is in place.

**Warning signs:** `git status` shows `.env.local` as an untracked file to be staged.

---

## Code Examples

### Prisma 7 Setup Sequence

```bash
# Source: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7

# After npm install prisma@latest @prisma/client@latest @prisma/adapter-pg pg:
npx prisma init              # creates prisma/schema.prisma and .env
# Manually create prisma.config.ts (see Pattern 2 above)
# Edit prisma/schema.prisma (see Pattern 3 above)
npx prisma migrate dev --name init    # creates migration, applies to DB
npx prisma generate                   # generates TypeScript client (NOT automatic in Prisma 7)
```

### bcrypt Hash Generation (for `.env.local`)

```bash
# Run once to generate ADMIN_PASSWORD_HASH for .env.local
node -e "const b = require('bcryptjs'); b.hash('yourAdminPassword', 10).then(h => console.log('ADMIN_PASSWORD_HASH=' + h))"
```

### Environment Variables (`.env.local`)

```bash
# .env.local — NEVER commit this file
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"   # Neon pooled
DATABASE_URL_UNPOOLED="postgresql://..."   # Neon direct (for migrations)
SESSION_SECRET="<32-char random string: openssl rand -base64 32>"
ADMIN_PASSWORD_HASH="$2b$10$..."           # bcrypt hash — NEVER the raw password
```

### Hackathon CRUD Server Action Pattern

```typescript
// app/actions/hackathons.ts
'use server'
import { verifySession } from '@/app/lib/dal'
import { prisma } from '@/app/lib/db'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const HackathonSchema = z.object({
  cohortId:      z.string().cuid(),
  title:         z.string().min(1).max(200).trim(),
  description:   z.string().min(1).max(2000).trim(),
  startsAt:      z.coerce.date(),
  endsAt:        z.coerce.date(),
  externalUrl:   z.url(),
  coverImageUrl: z.url().optional().or(z.literal('')),
  track:         z.string().min(1).max(100).trim(),
})

export async function createHackathon(state: unknown, formData: FormData) {
  await verifySession()    // Auth check inside action — not just proxy

  const validated = HackathonSchema.safeParse(Object.fromEntries(formData))
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const data = validated.data
  const slug = data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  await prisma.hackathon.create({
    data: { ...data, slug, coverImageUrl: data.coverImageUrl || null },
  })

  revalidatePath('/admin/hackathons')
  revalidatePath(`/${data.cohortId}`)  // revalidate public cohort page when it exists
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` + `export function middleware()` | `proxy.ts` + `export function proxy()` | Next.js 16.0.0 (Oct 2025) | Must rename file and function; old syntax deprecated, still functional |
| Sync `cookies()`, `headers()` | `await cookies()`, `await headers()` | Next.js 16.0.0 (Oct 2025) | Sync access throws at runtime — all session code must be async |
| Prisma 6: `DATABASE_URL` in `schema.prisma` datasource | Prisma 7: `prisma.config.ts` for all DB config | Prisma 7.0.0 (Nov 2025) | New required config file; datasource block url still works but config file takes precedence |
| Prisma 6: auto-runs `prisma generate` after `migrate dev` | Prisma 7: explicit `prisma generate` required | Prisma 7.0.0 (Nov 2025) | Must add `prisma generate` step after every schema change |
| Prisma 6: driver adapters optional | Prisma 7: driver adapters required for all DBs | Prisma 7.0.0 (Nov 2025) | Must install `@prisma/adapter-pg` + `pg` for PostgreSQL |
| Tailwind v3: `tailwind.config.js` with content array | Tailwind v4: CSS-first `@theme {}`, no config file | Tailwind v4.0 (early 2025) | No `content` array; no `tailwind.config.js` needed for new projects |

**Deprecated/outdated in this stack:**
- `middleware.ts` filename: deprecated in Next.js 16, use `proxy.ts`
- `export function middleware()`: deprecated, use `export function proxy()`
- `experimental.turbopack` config option: moved to top-level `turbopack` in Next.js 16
- Prisma 6.x: previous major version, still supported but new projects should use 7.x

---

## Open Questions

1. **Prisma 7 vs Prisma 6 — final decision**
   - What we know: Prisma 7 is current stable (Nov 2025); Prisma 6 is previous major version (6.19.2 last); Prisma 7 has breaking changes but greenfield project means no migration cost
   - What's unclear: Whether any Phase 2+ patterns (transactions for 5-member cap) behave differently in Prisma 7 — unlikely but verify at implementation time
   - Recommendation: Use Prisma 7. Greenfield = no migration debt. The additional setup (`prisma.config.ts`, explicit `prisma generate`, adapter-pg) is one-time 10-minute work.

2. **Neon free tier limits for multi-cohort historical data**
   - What we know: Neon free tier is ~0.5 GB storage; multiple cohorts accumulate data over semesters
   - What's unclear: Exact current Neon free tier limits (may have changed); whether BAY's data volume will hit the limit in Year 1
   - Recommendation: Start on Neon free tier; verify current limits at account creation. Upgrade path to paid tier is straightforward.

3. **Admin display order — reorder UX scope for Phase 1**
   - What we know: CONTEXT.md specifies "admin-controlled display order" for cohorts via `orderIndex`
   - What's unclear: Whether Phase 1 needs a drag-and-drop reorder UI or just creation-order (newest at bottom)
   - Recommendation: Phase 1 sets `orderIndex` at creation time (last + 1). A simple "move up / move down" button can be added in Phase 3. Full drag-and-drop is deferred until explicitly requested.

---

## Validation Architecture

> `nyquist_validation: true` in `.planning/config.json` — this section is included.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (recommended for Next.js 16 + TypeScript) or Jest |
| Config file | `vitest.config.ts` — does not exist yet (Wave 0 gap) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

**Note:** No test infrastructure exists yet (greenfield). Wave 0 must establish the framework.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADMN-01 | `bcrypt.compare` rejects wrong password | unit | `npx vitest run tests/auth.test.ts -t "login rejects"` | ❌ Wave 0 |
| ADMN-01 | `bcrypt.compare` accepts correct password | unit | `npx vitest run tests/auth.test.ts -t "login accepts"` | ❌ Wave 0 |
| ADMN-01 | Session cookie set on successful login | unit | `npx vitest run tests/session.test.ts` | ❌ Wave 0 |
| ADMN-01 | `proxy.ts` redirects unauthenticated to `/admin/login` | unit | `npx vitest run tests/proxy.test.ts` | ❌ Wave 0 |
| ADMN-01 | `proxy.ts` allows through valid session cookie | unit | `npx vitest run tests/proxy.test.ts` | ❌ Wave 0 |
| CHRT-01 | `createCohort` inserts cohort with correct slug | integration | `npx vitest run tests/cohorts.test.ts -t "create"` | ❌ Wave 0 |
| CHRT-01 | `createCohort` rejects unauthenticated caller | unit | `npx vitest run tests/cohorts.test.ts -t "auth"` | ❌ Wave 0 |
| ADMN-04 | Admin can update cohort name | integration | `npx vitest run tests/cohorts.test.ts -t "update"` | ❌ Wave 0 |
| CHRT-02 | `createHackathon` stores cohortId FK correctly | integration | `npx vitest run tests/hackathons.test.ts -t "cohort scope"` | ❌ Wave 0 |
| ADMN-02 | `createHackathon` validates all required fields | unit | `npx vitest run tests/hackathons.test.ts -t "validation"` | ❌ Wave 0 |
| ADMN-02 | `deleteHackathon` removes hackathon and cascades | integration | `npx vitest run tests/hackathons.test.ts -t "delete"` | ❌ Wave 0 |
| ADMN-01 | `.env.local` excluded from git (manual check) | manual-only | check `git status` for `.env.local` | N/A |

**Manual-only justification:** The `.gitignore` / `.env.local` security check (ADMN-01 item 5) cannot be automated in a unit test — it must be verified by inspecting `git status` and `git log` before the first push.

### Sampling Rate

- **Per task commit:** `npx vitest run tests/<relevant>.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `vitest.config.ts` — test framework config; install: `npm install -D vitest @vitejs/plugin-react`
- [ ] `tests/auth.test.ts` — covers ADMN-01 (bcrypt compare, session creation)
- [ ] `tests/session.test.ts` — covers ADMN-01 (encrypt/decrypt, cookie set/delete)
- [ ] `tests/proxy.test.ts` — covers ADMN-01 (proxy route guard redirects)
- [ ] `tests/cohorts.test.ts` — covers CHRT-01, ADMN-04 (create, update, orderIndex)
- [ ] `tests/hackathons.test.ts` — covers CHRT-02, ADMN-02 (create, validate, delete, cohort scope)
- [ ] `tests/setup.ts` — shared test DB setup (test Prisma client, seed helpers)

---

## Sources

### Primary (HIGH confidence)

- [Next.js 16.1.7 official docs](https://nextjs.org/docs) — verified 2026-03-18
- [Next.js 16 release blog](https://nextjs.org/blog/next-16) — proxy.ts breaking change, async cookies confirmed
- [Next.js proxy.ts API reference](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) — verified 2026-03-18; version 16.1.7, lastUpdated 2026-03-16
- [Next.js authentication guide](https://nextjs.org/docs/app/guides/authentication) — verified 2026-03-18; jose + cookies() session pattern confirmed; version 16.1.7
- [Prisma ORM upgrade to v7 guide](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7) — prisma.config.ts format, adapter requirements, breaking changes

### Secondary (MEDIUM confidence)

- [Prisma 7 release announcement](https://www.prisma.io/blog/announcing-prisma-orm-7-0-0) — Nov 2025 release; ESM requirement, driver adapter mandate
- Prior project research: `.planning/research/STACK.md`, `.planning/research/ARCHITECTURE.md`, `.planning/research/PITFALLS.md` — verified 2026-03-17; still accurate except for proxy.ts and Prisma 7 changes

### Tertiary (LOW confidence — needs validation at implementation time)

- Neon free tier storage limits — not re-verified at research time; validate at account creation
- Prisma 7 exact behavior with Neon `@prisma/adapter-pg` — confirmed pattern works; exact Neon-specific config not verified from Neon official docs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Next.js 16 and Prisma 7 verified from official docs; library versions current
- Architecture: HIGH — standard CRUD app patterns; no experimental approaches
- Auth patterns: HIGH — confirmed from Next.js 16.1.7 official authentication guide (dated 2026-03-16)
- proxy.ts breaking change: HIGH — confirmed from Next.js 16 blog + official API reference
- Prisma 7 changes: HIGH — confirmed from Prisma official upgrade guide
- Pitfalls: MEDIUM-HIGH — proxy.ts and async cookies are HIGH (official docs); cohort bleed and order index pitfalls are MEDIUM (established patterns)

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (30 days) for stable patterns; verify Next.js and Prisma minor versions at install time
