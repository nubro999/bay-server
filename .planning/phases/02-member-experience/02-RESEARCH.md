# Phase 2: Member Experience - Research

**Researched:** 2026-03-18
**Domain:** Next.js 16 App Router — public pages, Server Actions without auth, countdown timers, Prisma transaction for member cap, Tailwind 4 / shadcn design
**Confidence:** HIGH (stack fully established in Phase 1; patterns confirmed; no new major dependencies)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| HACK-01 | Each hackathon has title, description, start/end dates, and external link | Already in DB schema; public detail page reads these fields via Prisma include query |
| HACK-02 | Cohort landing page shows all hackathon tracks (EVM, Solana, Grants) | `/[cohortSlug]` page queries `prisma.cohort.findUnique({ include: { hackathons: true } })` filtered by slug |
| HACK-03 | Hackathon page shows deadline countdown | Client Component with `setInterval`; reads `hackathon.endsAt`; `useEffect` + `useState` |
| HACK-04 | External platform link (Colosseum, XRPL Korea) displayed prominently | `hackathon.externalUrl` field already exists; render as prominent `<a>` button on page |
| TEAM-01 | Member can create a team with a name within a hackathon | `createTeam` Server Action — no `verifySession`, only Zod validation; stores `hackathonId` |
| TEAM-02 | Member can join a team by entering name and role (max 5 per team) | `joinTeam` Server Action — Prisma transaction + SELECT FOR UPDATE to enforce 5-member cap atomically |
| TEAM-03 | Team browser shows all teams with member count and open spots | Hackathon page lists teams; query `_count: { members: true }` via Prisma aggregate |
| TEAM-04 | Team detail page shows members, progress updates, and submission | `/[cohortSlug]/[hackathonSlug]/teams/[teamId]` page; full `include` query |
| TEAM-05 | Team status indicators (member count, submission status, update recency) | Computed in page component from Prisma data; no library needed |
| PROG-01 | Team member can post weekly progress update (text + optional link) | `createUpdate` Server Action — no auth; Zod validation; stores `teamId`, `content`, optional `link` |
| PROG-02 | Updates displayed chronologically on team detail page | `orderBy: { createdAt: 'asc' }` on Update query |
| PROG-03 | Team can submit final deliverable (GitHub link + writeup) | `createSubmission` / `upsertSubmission` Server Action — no auth; unique constraint on `teamId` means `upsert` |
| DSGN-01 | Minimal white design — clean, Notion/Linear aesthetic | Tailwind 4 utility classes on pure white bg; no card shadows; clean typography; existing shadcn tokens |
| DSGN-02 | Mobile-responsive layout | Tailwind responsive prefixes (`sm:`, `md:`); test at 375px breakpoint |
</phase_requirements>

---

## Summary

Phase 2 builds entirely on the Phase 1 foundation. The Prisma schema already defines all six entities including Team, Member, Update, and Submission — no schema migrations are expected. The stack (Next.js 16.1.7, Prisma 7, Tailwind 4, shadcn, Zod, Vitest) is installed and patterns are established.

The primary new pattern is **no-auth Server Actions**: Phase 1 actions all call `verifySession()` as the first line; Phase 2 member actions must NOT do this (zero-friction joining is the core value). The key engineering challenge is the **5-member cap race condition** flagged in STATE.md: the cap must be enforced with a Prisma transaction + raw `SELECT ... FOR UPDATE` row lock, not just an application-level count check. Without this, two simultaneous join requests can both read "4 members" and both insert, producing 6 members.

The countdown timer (HACK-03) requires a **Client Component** using `useEffect` + `useState` with `setInterval`. This is the only piece of reactive UI in Phase 2; all other public pages can be pure Server Components.

The design (DSGN-01, DSGN-02) follows the Notion/Linear aesthetic already established in admin pages: white background (`bg-white`), zinc/gray text hierarchy, subtle borders (`border-zinc-200`), clean sans-serif type, and minimal interactive states. No new design system library is needed.

**Primary recommendation:** Implement Phase 2 in URL-first order: cohort landing → hackathon page + countdown → team list + create team → join team (with transaction) → team detail → update/submission forms. Validate the 5-member transaction with a concurrent-access test.

---

## Standard Stack

### Core (already installed — no new installs needed)

| Library | Version | Purpose | Phase 2 Role |
|---------|---------|---------|--------------|
| Next.js | 16.1.7 | App Router, Server Actions, Server Components | Public pages + no-auth Server Actions |
| Prisma | 7.5.0 | DB queries, transactions | `prisma.$transaction` for 5-member cap; `include` for team detail |
| Zod | 4.3.6 | Input validation | TeamSchema, MemberSchema, UpdateSchema, SubmissionSchema |
| Tailwind CSS | 4.x | Styling | Notion/Linear aesthetic on public pages |
| shadcn (base-ui) | 1.3.0 | UI primitives | Reuse Badge, Button/Link patterns from admin |
| date-fns | 4.1.0 | Date formatting | Format `startsAt`/`endsAt` for display; compute countdown delta |
| Vitest | 4.1.0 | Testing | Unit tests for Server Actions; existing mocks in `tests/setup.ts` reusable |

### Supporting (already installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `server-only` | 0.0.1 | Prevent server code leaking to client | Add to all new `actions/*.ts` files |
| `clsx` + `tailwind-merge` | latest | Conditional Tailwind classes | Team status badge colors (full/open) |
| `lucide-react` | 0.577.0 | Icons | Team member count icons, external link icon |

### New Installs

None required. All Phase 2 dependencies are already in `package.json`.

---

## Architecture Patterns

### Recommended Project Structure (additions for Phase 2)

```
app/
├── (public)/                        # Route group — all public pages (Phase 2)
│   ├── layout.tsx                   # Public layout: minimal header, no sidebar
│   ├── page.tsx                     # Root: redirect or cohort list
│   ├── [cohortSlug]/
│   │   ├── page.tsx                 # Cohort landing: list hackathon tracks (HACK-02)
│   │   └── [hackathonSlug]/
│   │       ├── page.tsx             # Hackathon page: countdown + team browser (HACK-03, TEAM-03)
│   │       └── teams/
│   │           ├── new/
│   │           │   └── page.tsx     # Create team form (TEAM-01)
│   │           └── [teamId]/
│   │               └── page.tsx    # Team detail: members + updates + submission (TEAM-04)
├── actions/
│   ├── teams.ts                     # createTeam Server Action (no auth)
│   ├── members.ts                   # joinTeam Server Action (no auth, with transaction)
│   ├── updates.ts                   # createUpdate Server Action (no auth)
│   └── submissions.ts               # upsertSubmission Server Action (no auth)
├── lib/
│   └── definitions.ts               # Add: TeamSchema, MemberSchema, UpdateSchema, SubmissionSchema
└── ui/
    └── public/
        ├── Countdown.tsx            # 'use client' — deadline countdown timer
        ├── TeamCard.tsx             # Team card with member count + status indicators
        ├── JoinTeamForm.tsx         # 'use client' — name + role form (useActionState)
        ├── CreateTeamForm.tsx       # 'use client' — team name form (useActionState)
        ├── UpdateForm.tsx           # 'use client' — progress update form (useActionState)
        └── SubmissionForm.tsx       # 'use client' — final submission form (useActionState)
tests/
├── teams.test.ts                    # createTeam, joinTeam (incl. 5-member cap)
├── members.test.ts                  # joinTeam edge cases (6th attempt rejection)
├── updates.test.ts                  # createUpdate validation
└── submissions.test.ts             # upsertSubmission (duplicate team → upsert)
```

### Pattern 1: No-Auth Server Action

**What:** Server Actions for public member operations that skip `verifySession()`. Input is still validated via Zod. No authentication — any visitor can create a team, join a team, post an update, or submit.

**When:** All Phase 2 member actions. Never call `verifySession()` in these actions.

```typescript
// app/actions/teams.ts
'use server'
import 'server-only'
import { prisma } from '@/app/lib/db'
import { TeamSchema } from '@/app/lib/definitions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTeam(
  context: { hackathonId: string; cohortSlug: string; hackathonSlug: string },
  state: unknown,
  formData: FormData
) {
  const validated = TeamSchema.safeParse({ name: formData.get('name') })
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const team = await prisma.team.create({
    data: { hackathonId: context.hackathonId, name: validated.data.name },
  })

  revalidatePath(`/${context.cohortSlug}/${context.hackathonSlug}`)
  redirect(`/${context.cohortSlug}/${context.hackathonSlug}/teams/${team.id}`)
}
```

### Pattern 2: 5-Member Cap with Prisma Transaction (CRITICAL)

**What:** The join operation reads the current member count and inserts a new member atomically inside a Prisma transaction using `$transaction`. Without a transaction, two concurrent requests both seeing "4 members" will both insert, producing 6 members.

**Why it matters:** Flagged explicitly in STATE.md as a known blocker for Phase 2. Application-level count check is insufficient under concurrent load.

**Implementation approach:** Use `prisma.$transaction` with an interactive transaction to read-then-write atomically. Check member count inside the transaction before inserting.

```typescript
// app/actions/members.ts
'use server'
import 'server-only'
import { prisma } from '@/app/lib/db'
import { MemberSchema } from '@/app/lib/definitions'
import { revalidatePath } from 'next/cache'

const MAX_TEAM_SIZE = 5

export async function joinTeam(
  context: { teamId: string; cohortSlug: string; hackathonSlug: string },
  state: unknown,
  formData: FormData
) {
  const validated = MemberSchema.safeParse({
    name: formData.get('name'),
    role: formData.get('role'),
  })
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Count current members inside the transaction — atomic read
      const count = await tx.member.count({ where: { teamId: context.teamId } })
      if (count >= MAX_TEAM_SIZE) {
        throw new Error('TEAM_FULL')
      }
      await tx.member.create({
        data: {
          teamId: context.teamId,
          name: validated.data.name,
          role: validated.data.role,
        },
      })
    })
  } catch (e) {
    if (e instanceof Error && e.message === 'TEAM_FULL') {
      return { error: 'This team is full (maximum 5 members).' }
    }
    return { error: 'Could not join team. Please try again.' }
  }

  revalidatePath(`/${context.cohortSlug}/${context.hackathonSlug}/teams/${context.teamId}`)
}
```

**Note on isolation:** Prisma's interactive transaction (`$transaction(async tx => {...})`) uses `READ COMMITTED` by default on PostgreSQL. For the member cap, this is sufficient for the expected concurrency level (small club hackathon). If exact serializability is needed under heavy load, a raw `SELECT ... FOR UPDATE` with `prisma.$queryRaw` inside the transaction can be added, but this is over-engineering for BAY's scale.

### Pattern 3: Deadline Countdown (Client Component)

**What:** A `'use client'` component that takes `endsAt: Date` as a prop and renders a live countdown using `setInterval`. All page data is fetched server-side; only the countdown rendering is client-side.

**When:** Hackathon page (HACK-03). Only this component needs to be a Client Component — the rest of the hackathon page is a Server Component.

```typescript
// app/ui/public/Countdown.tsx
'use client'
import { useEffect, useState } from 'react'

function computeDelta(endsAt: Date) {
  const diff = endsAt.getTime() - Date.now()
  if (diff <= 0) return null
  const d = Math.floor(diff / (1000 * 60 * 60 * 24))
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const s = Math.floor((diff % (1000 * 60)) / 1000)
  return { d, h, m, s }
}

export function Countdown({ endsAt }: { endsAt: Date }) {
  const [delta, setDelta] = useState(() => computeDelta(endsAt))

  useEffect(() => {
    const id = setInterval(() => setDelta(computeDelta(endsAt)), 1000)
    return () => clearInterval(id)
  }, [endsAt])

  if (!delta) return <span className="text-zinc-400 text-sm">Deadline passed</span>

  return (
    <div className="flex gap-3 tabular-nums text-2xl font-semibold text-zinc-900">
      <span>{delta.d}d</span>
      <span>{delta.h}h</span>
      <span>{delta.m}m</span>
      <span>{delta.s}s</span>
    </div>
  )
}
```

**Important:** Pass `endsAt` as a serialized value from a Server Component parent. Next.js serializes Date objects passed as props to Client Components — pass as `new Date(hackathon.endsAt)` or as an ISO string and parse in the component.

### Pattern 4: Submission Upsert (One Submission Per Team)

**What:** The Submission model has `teamId @unique` — one submission per team. The Server Action uses `prisma.submission.upsert` so submitting twice updates rather than errors. This lets teams revise their submission before the deadline.

**When:** `upsertSubmission` action (PROG-03). Plain `create` would throw a unique constraint error on a second submission.

```typescript
// app/actions/submissions.ts
'use server'
import 'server-only'
import { prisma } from '@/app/lib/db'
import { SubmissionSchema } from '@/app/lib/definitions'
import { revalidatePath } from 'next/cache'

export async function upsertSubmission(
  context: { teamId: string; cohortSlug: string; hackathonSlug: string },
  state: unknown,
  formData: FormData
) {
  const validated = SubmissionSchema.safeParse({
    githubUrl: formData.get('githubUrl'),
    writeup: formData.get('writeup'),
  })
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  await prisma.submission.upsert({
    where: { teamId: context.teamId },
    create: { teamId: context.teamId, ...validated.data },
    update: { ...validated.data },
  })

  revalidatePath(`/${context.cohortSlug}/${context.hackathonSlug}/teams/${context.teamId}`)
}
```

### Pattern 5: Cohort-Scoped Public Page Query

**What:** Public pages resolve the cohort by `slug`, then the hackathon by `slug` within that cohort. Always scope down the hierarchy — never query hackathon by slug alone (violates CHRT-02).

**When:** Every public URL that includes `[cohortSlug]` and `[hackathonSlug]`.

```typescript
// Example: app/(public)/[cohortSlug]/[hackathonSlug]/page.tsx
import { prisma } from '@/app/lib/db'
import { notFound } from 'next/navigation'

export default async function HackathonPage({
  params,
}: {
  params: Promise<{ cohortSlug: string; hackathonSlug: string }>
}) {
  const { cohortSlug, hackathonSlug } = await params  // Next.js 16: params is a Promise

  const cohort = await prisma.cohort.findUnique({ where: { slug: cohortSlug } })
  if (!cohort) notFound()

  const hackathon = await prisma.hackathon.findFirst({
    where: { slug: hackathonSlug, cohortId: cohort.id },  // Cohort-scoped!
    include: {
      teams: {
        include: { _count: { select: { members: true } }, submission: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!hackathon) notFound()

  // ...render
}
```

**Critical:** In Next.js 16 App Router, `params` in page components is a `Promise` — must `await params` before destructuring. Same applies to `searchParams`.

### Pattern 6: Team Status Indicators (TEAM-05)

**What:** Computed inline from Prisma data — no extra library needed. Member count comes from `_count.members`; submission status from whether `submission` is null; update recency from `updates[0].createdAt`.

```typescript
// In team list render (hackathon page)
const memberCount = team._count.members  // from include: { _count: { select: { members: true } } }
const isFull = memberCount >= 5
const hasSubmission = team.submission !== null
const openSpots = 5 - memberCount
```

### Pattern 7: Notion/Linear Design System (DSGN-01, DSGN-02)

**What:** Consistent minimal white aesthetic using the Tailwind 4 tokens already in `globals.css`. The project uses `oklch` color values for precise whites and grays.

**Key classes:**
- Background: `bg-white` / `bg-zinc-50`
- Text hierarchy: `text-zinc-900` (headings), `text-zinc-600` (body), `text-zinc-400` (captions)
- Borders: `border border-zinc-200`
- Cards: `rounded-lg border border-zinc-100 bg-white p-4` (no shadow by default)
- Badge: Use shadcn Badge with `variant="outline"` for track tags, member count
- CTA buttons: `bg-zinc-900 text-white hover:bg-zinc-800` (primary), `border border-zinc-200 hover:bg-zinc-50` (secondary)
- External link: Prominent call-to-action button with `lucide-react` `ExternalLink` icon
- Mobile: `px-4 sm:px-8` gutters; single-column layouts stack naturally with flex-col

**Mobile breakpoint:** 375px is the iPhone SE width — the smallest target. Use `min-w-0` on flex children to prevent overflow; use `break-words` on team names; test link/button tap targets at `min-h-10 min-w-10`.

### Anti-Patterns to Avoid

- **Adding `verifySession()` to member actions:** Phase 2 actions are intentionally public. Only admin actions call `verifySession()`.
- **Application-level member count check without transaction:** Reading count then inserting in two separate queries is a race condition. Always use `prisma.$transaction`.
- **Querying hackathon by slug alone:** Always scope with `cohortId` — `prisma.hackathon.findFirst({ where: { slug, cohortId: cohort.id } })`. Never `findUnique({ where: { slug } })` without cohort scope.
- **Server Component importing Countdown directly as async component:** The `Countdown` component uses `useEffect` and must be `'use client'`. Wrap it and pass `endsAt` as a prop from the Server Component parent.
- **Using `redirect()` inside `$transaction` callback:** `redirect()` throws a special Next.js error that will be caught by the `try/catch` around the transaction. Always call `redirect()` AFTER the transaction resolves.
- **`params` used synchronously in Next.js 16:** `params` in App Router page components is a Promise in Next.js 16. Always `const { slug } = await params`.
- **`prisma.submission.create` on second submission:** Use `upsert` — the unique constraint on `teamId` means a second `create` will throw a P2002 error.
- **Storing `weekNumber` as required on Updates:** The schema marks `weekNumber` as optional (`Int?`). Do not require it in the Zod schema for Phase 2; it can be used for ordering enhancement in Phase 3/4.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 5-member cap enforcement | Application if-then-insert | `prisma.$transaction` interactive | Race condition; two simultaneous requests both read N < 5 and both insert |
| Countdown timer math | Custom date arithmetic | `computeDelta` helper + `date-fns` differenceInSeconds | Off-by-one errors in day/hour/minute boundary math |
| Form pending state | Manual loading boolean | `useActionState` from React 19 | Built-in `isPending` from `useFormStatus`; established pattern from Phase 1 |
| Submission uniqueness | Manual check-then-create | `prisma.submission.upsert` | Unique constraint on `teamId`; upsert is atomic; create races on concurrent submits |
| URL slug lookup | Custom string match | Prisma `findFirst` with `where: { slug, cohortId }` | Slug uniqueness is per-cohort; global unique would block same hackathon name across cohorts |
| Mobile responsive layout | Custom CSS media queries | Tailwind responsive prefixes (`sm:`, `md:`) | Tailwind 4 JIT; no config needed; consistent with existing admin pages |

---

## Common Pitfalls

### Pitfall 1: 5-Member Race Condition

**What goes wrong:** Two members click "Join" simultaneously. Both requests read member count as 4. Both pass the cap check. Both insert. Team ends up with 6 members.

**Why it happens:** No transaction isolation between count read and member insert.

**How to avoid:** Use `prisma.$transaction(async tx => { const count = await tx.member.count(...); if (count >= 5) throw; await tx.member.create(...) })`. The transaction serializes these operations.

**Warning signs:** Manual testing shows member counts above 5 in the DB.

### Pitfall 2: `params` is a Promise in Next.js 16

**What goes wrong:** Destructuring `params` synchronously: `const { cohortSlug } = params` throws or returns undefined.

**Why it happens:** Next.js 16 made `params` async to support streaming and parallel data fetching.

**How to avoid:** Always `const { cohortSlug, hackathonSlug } = await params` in page and layout components.

**Warning signs:** `cohortSlug` is undefined; `notFound()` triggered for valid URLs.

### Pitfall 3: `redirect()` Inside Transaction Callback Throws Incorrectly

**What goes wrong:** Calling `redirect('/some-path')` inside the `prisma.$transaction(async tx => {...})` callback causes Next.js's redirect mechanism (which throws an internal error) to be caught by the transaction error handler, returning a wrong error message to the user instead of redirecting.

**Why it happens:** `redirect()` in Next.js works by throwing a special `RedirectError`. The `try/catch` around the transaction swallows it.

**How to avoid:** Always call `redirect()` AFTER the `await prisma.$transaction(...)` call resolves, never inside the transaction callback. Separate the transaction result from the redirect.

**Warning signs:** Form submits but page does not redirect; user sees an unexpected error message.

### Pitfall 4: Countdown Hydration Mismatch

**What goes wrong:** The server renders a countdown string (e.g. "5d 3h 22m 10s"), then the client hydrates with a slightly different time, causing a React hydration error.

**Why it happens:** SSR and client hydration happen at different times; the countdown value differs by milliseconds.

**How to avoid:** Initialize countdown state with `null` on the server and only populate after `useEffect` runs on the client. Render a static skeleton (e.g. "Loading...") until the first client tick.

```typescript
// Safe: start with null, populate in useEffect only
const [delta, setDelta] = useState<ReturnType<typeof computeDelta>>(null)
useEffect(() => {
  setDelta(computeDelta(endsAt))
  const id = setInterval(() => setDelta(computeDelta(endsAt)), 1000)
  return () => clearInterval(id)
}, [endsAt])
```

**Warning signs:** React hydration error in console mentioning "did not match" with countdown numbers.

### Pitfall 5: Cohort Scope Bleed on Public Hackathon Queries

**What goes wrong:** Query `prisma.hackathon.findFirst({ where: { slug: hackathonSlug } })` without `cohortId` — if two cohorts have a hackathon with the same slug, the wrong hackathon loads.

**Why it happens:** Hackathon `slug` is globally unique in the current schema (`@unique`). But relying on this is fragile — the CHRT-02 principle requires explicit cohort scoping.

**How to avoid:** Always include `cohortId: cohort.id` in the where clause. Even if slugs are currently globally unique, the cohort-scoped query is the correct architectural pattern.

**Warning signs:** Wrong hackathon data shown when same track title is reused across cohorts.

### Pitfall 6: `upsertSubmission` Called Without `teamId` Context

**What goes wrong:** `teamId` is passed from context (bound to the Server Action) but if it comes from user input instead, a malicious user can submit on behalf of any team.

**Why it happens:** Confusing action context (server-side bound) with form data (user-supplied).

**How to avoid:** `teamId` must always come from the URL/route params (server-side), never from a hidden form field. Bind it into the action via closure: `upsertSubmission.bind(null, { teamId: team.id, ... })`.

**Warning signs:** Form has a hidden `teamId` input field — this is the antipattern.

---

## Code Examples

### Zod Schemas for Phase 2 (add to `app/lib/definitions.ts`)

```typescript
// Source: established Zod 4 pattern from Phase 1 definitions.ts

export const TeamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100).trim(),
})

export const MemberSchema = z.object({
  name: z.string().min(1, 'Your name is required').max(100).trim(),
  role: z.string().min(1, 'Your role is required').max(100).trim(),
})

export const UpdateSchema = z.object({
  content: z.string().min(1, 'Update content is required').max(2000).trim(),
  link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

export const SubmissionSchema = z.object({
  githubUrl: z.string().url('Must be a valid GitHub URL'),
  writeup: z.string().min(1, 'Writeup is required').max(5000).trim(),
})

// Form state types
export type TeamFormState = {
  errors?: { name?: string[] }
  message?: string
}
export type MemberFormState = {
  errors?: Partial<Record<keyof z.infer<typeof MemberSchema>, string[]>>
  error?: string
}
export type UpdateFormState = {
  errors?: Partial<Record<keyof z.infer<typeof UpdateSchema>, string[]>>
}
export type SubmissionFormState = {
  errors?: Partial<Record<keyof z.infer<typeof SubmissionSchema>, string[]>>
}
```

### Cohort Landing Page Query

```typescript
// app/(public)/[cohortSlug]/page.tsx — Server Component
import { prisma } from '@/app/lib/db'
import { notFound } from 'next/navigation'

export default async function CohortPage({
  params,
}: {
  params: Promise<{ cohortSlug: string }>
}) {
  const { cohortSlug } = await params  // Next.js 16: must await params

  const cohort = await prisma.cohort.findUnique({
    where: { slug: cohortSlug },
    include: { hackathons: { orderBy: { startsAt: 'asc' } } },
  })
  if (!cohort) notFound()

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <h1 className="text-2xl font-semibold text-zinc-900">{cohort.name}</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {cohort.hackathons.length} hackathon track{cohort.hackathons.length !== 1 ? 's' : ''}
      </p>
      <div className="mt-8 flex flex-col gap-4">
        {cohort.hackathons.map((h) => (
          <a
            key={h.id}
            href={`/${cohortSlug}/${h.slug}`}
            className="block rounded-lg border border-zinc-200 bg-white p-5 hover:border-zinc-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                  {h.track}
                </span>
                <h2 className="mt-1 text-lg font-medium text-zinc-900">{h.title}</h2>
                <p className="mt-1 text-sm text-zinc-600 line-clamp-2">{h.description}</p>
              </div>
              <a
                href={h.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 text-xs text-zinc-500 underline"
              >
                Platform
              </a>
            </div>
          </a>
        ))}
      </div>
    </main>
  )
}
```

### Team Detail Page Query

```typescript
// Prisma query for team detail — includes all child data
const team = await prisma.team.findUnique({
  where: { id: teamId },
  include: {
    members: { orderBy: { joinedAt: 'asc' } },
    updates: { orderBy: { createdAt: 'asc' } },
    submission: true,
    hackathon: { include: { cohort: true } },
  },
})
if (!team) notFound()
// Verify team belongs to expected hackathon (cohort scope check)
if (team.hackathon.slug !== hackathonSlug || team.hackathon.cohort.slug !== cohortSlug) {
  notFound()
}
```

### Test Pattern for No-Auth Server Actions

```typescript
// tests/teams.test.ts — reuse existing mock setup pattern
import { describe, it, expect, vi, beforeEach } from 'vitest'

// No need to mock verifySession — Phase 2 actions don't call it
vi.mock('@/app/lib/db', () => ({
  prisma: {
    team: {
      create: vi.fn().mockResolvedValue({ id: 't1', name: 'Team Solana', hackathonId: 'h1' }),
    },
    member: {
      count: vi.fn().mockResolvedValue(2),
      create: vi.fn().mockResolvedValue({ id: 'm1', name: 'Alice', role: 'Frontend' }),
    },
    $transaction: vi.fn().mockImplementation(async (fn) => fn({
      member: { count: vi.fn().mockResolvedValue(2), create: vi.fn() },
    })),
  },
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Sync `params` destructuring | `await params` in page components | Next.js 16.0.0 (Oct 2025) | All public page components must await params |
| `useRouter().refresh()` after Server Action | `revalidatePath()` in Server Action | Next.js App Router (stable) | Prefer `revalidatePath` in action; no client-side router needed |
| `prisma.$transaction([...])` (batch style) | `prisma.$transaction(async tx => {...})` (interactive) | Prisma 2.x+ | Interactive transaction required for read-then-write atomicity |
| `useState(computeInitialValue())` for countdown | `useState(null)` + populate in `useEffect` | React 18+ hydration model | Prevents SSR/client mismatch hydration errors |

---

## Open Questions

1. **Ghost member UX — public "leave team" button**
   - What we know: STATE.md flags this as a product decision for BAY leads
   - What's unclear: Whether Phase 2 should include a leave-team action or defer to Phase 3 admin removal
   - Recommendation: Defer to Phase 3. Admin can remove ghost members (ADMN-03). Adding public leave in Phase 2 creates abuse surface (anyone can remove anyone). Keep Phase 2 join-only.

2. **Root URL behavior — cohort list or redirect**
   - What we know: All cohorts are visible to members; there is no "active cohort" concept (confirmed in Phase 1 CONTEXT.md)
   - What's unclear: Should `app/page.tsx` list all cohorts or redirect to the most recent one?
   - Recommendation: Render a cohort list at `/` ordered by `orderIndex` descending (newest first). Simple, correct, and avoids needing a redirect that requires knowing which cohort is "current".

3. **Update authorship — any team member or specific member?**
   - What we know: PROG-01 says "any team member can post" without login
   - What's unclear: Whether the update form should ask for the poster's name (UX question) or be fully anonymous
   - Recommendation: Include an optional `postedBy` text field on the update form. Store as a field on `Update` model or as a prefix in `content`. Since no auth exists, this is just a string, not a verified identity. No schema migration needed if `content` includes `"Alice: ..."` as a convention, but a dedicated `postedBy String?` field is cleaner. This is Claude's discretion — recommend adding `postedBy String?` to Update model via migration in Wave 0 of Plan 02-02.

---

## Validation Architecture

> `nyquist_validation: true` in `.planning/config.json` — section included.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.0 |
| Config file | `vitest.config.ts` (exists at project root) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HACK-01 | Hackathon page renders title, description, dates | smoke | `npx vitest run tests/hackathons.test.ts` | ✅ (extend) |
| HACK-02 | Cohort page lists all hackathon tracks | unit | `npx vitest run tests/cohorts.test.ts` | ✅ (extend) |
| HACK-03 | Countdown shows d/h/m/s and updates each second | unit | `npx vitest run tests/countdown.test.ts` | ❌ Wave 0 |
| HACK-04 | External platform link rendered with correct URL | unit | `npx vitest run tests/hackathons.test.ts` | ✅ (extend) |
| TEAM-01 | `createTeam` inserts team with hackathonId | unit | `npx vitest run tests/teams.test.ts` | ❌ Wave 0 |
| TEAM-01 | `createTeam` validates team name (empty rejected) | unit | `npx vitest run tests/teams.test.ts` | ❌ Wave 0 |
| TEAM-02 | `joinTeam` inserts member when count < 5 | unit | `npx vitest run tests/members.test.ts` | ❌ Wave 0 |
| TEAM-02 | `joinTeam` rejects 6th member (count = 5) | unit | `npx vitest run tests/members.test.ts -t "rejects 6th"` | ❌ Wave 0 |
| TEAM-02 | `joinTeam` uses `$transaction` for cap check | unit | `npx vitest run tests/members.test.ts -t "transaction"` | ❌ Wave 0 |
| TEAM-03 | Team list includes member count per team | unit | `npx vitest run tests/teams.test.ts` | ❌ Wave 0 |
| TEAM-04 | Team detail query includes members, updates, submission | unit | `npx vitest run tests/teams.test.ts` | ❌ Wave 0 |
| TEAM-05 | isFull computed correctly at boundary (4, 5) | unit | `npx vitest run tests/teams.test.ts -t "status"` | ❌ Wave 0 |
| PROG-01 | `createUpdate` inserts update with teamId, content | unit | `npx vitest run tests/updates.test.ts` | ❌ Wave 0 |
| PROG-01 | `createUpdate` validates content (empty rejected) | unit | `npx vitest run tests/updates.test.ts` | ❌ Wave 0 |
| PROG-02 | Updates ordered chronologically (orderBy createdAt asc) | unit | `npx vitest run tests/updates.test.ts` | ❌ Wave 0 |
| PROG-03 | `upsertSubmission` creates on first call | unit | `npx vitest run tests/submissions.test.ts` | ❌ Wave 0 |
| PROG-03 | `upsertSubmission` updates on second call (no unique error) | unit | `npx vitest run tests/submissions.test.ts -t "upsert"` | ❌ Wave 0 |
| PROG-03 | `upsertSubmission` validates githubUrl format | unit | `npx vitest run tests/submissions.test.ts` | ❌ Wave 0 |
| DSGN-01 | Manual — visual inspection of white Notion aesthetic | manual-only | N/A — check in browser | N/A |
| DSGN-02 | Manual — test at 375px in DevTools | manual-only | N/A — check in browser | N/A |

**Manual-only justification:** DSGN-01 and DSGN-02 are visual and layout requirements — automated tests cannot verify correct aesthetics or pixel-level mobile layout. These must be verified by visual inspection in a browser at 375px viewport width.

### Sampling Rate

- **Per task commit:** `npx vitest run tests/<relevant>.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/teams.test.ts` — covers TEAM-01, TEAM-02, TEAM-03, TEAM-04, TEAM-05
- [ ] `tests/members.test.ts` — covers TEAM-02 edge cases (5-cap, 6th rejection, transaction)
- [ ] `tests/updates.test.ts` — covers PROG-01, PROG-02
- [ ] `tests/submissions.test.ts` — covers PROG-03 (create, upsert, validation)
- [ ] `tests/countdown.test.ts` — covers HACK-03 countdown math (pure unit test, no DOM needed)

Existing files to extend (not recreate):
- `tests/hackathons.test.ts` — add HACK-01, HACK-04 query assertions
- `tests/cohorts.test.ts` — add HACK-02 cohort+hackathons include query assertion

---

## Sources

### Primary (HIGH confidence)

- Phase 1 RESEARCH.md (`/home/nubroo/bay-server/.planning/phases/01-foundation/01-RESEARCH.md`) — stack fully verified; Phase 2 inherits all findings
- Phase 1 SUMMARY files (01-01 through 01-04) — actual patterns in use, established decisions
- Existing codebase: `app/lib/definitions.ts`, `app/actions/hackathons.ts`, `tests/setup.ts`, `vitest.config.ts` — confirmed in-project patterns
- Prisma schema (`prisma/schema.prisma`) — all entities confirmed; no schema changes needed for core Phase 2 features
- `package.json` — exact versions of all dependencies confirmed

### Secondary (MEDIUM confidence)

- Next.js 16 App Router docs (verified in Phase 1 research 2026-03-18) — `params` as Promise, Server Actions, `revalidatePath`
- Prisma interactive transaction docs (verified in Phase 1 research 2026-03-18) — `$transaction(async tx => {...})`
- React 19 `useEffect`/`useState` hydration behavior — standard pattern; well-documented

### Tertiary (LOW confidence — flag for implementation-time validation)

- `postedBy` field addition to Update model — recommendation only; not in current schema; requires migration
- Countdown hydration pattern — standard community pattern; not from official React docs directly

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Phase 1 fully established; no new dependencies; versions confirmed from package.json
- Architecture patterns (public pages, no-auth actions): HIGH — direct extension of Phase 1 patterns; Next.js 16 Server Actions well-understood
- 5-member cap transaction: HIGH — Prisma interactive transaction is documented and standard; note on isolation level is conservative
- Countdown component: HIGH — standard React useEffect + setInterval pattern; hydration pitfall is well-known
- Submission upsert: HIGH — Prisma `upsert` with `@unique` FK is standard; confirmed schema constraint exists
- Design (Notion/Linear aesthetic): MEDIUM — subjective; Tailwind classes are HIGH confidence but visual result requires manual validation
- `postedBy` field recommendation: LOW — editorial recommendation not yet discussed with user; needs decision before implementation

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (30 days) — stable stack; verify Next.js/Prisma minor versions if significant time passes before execution
