# Technology Stack

**Project:** BAY Server — Hackathon Team Management Platform
**Researched:** 2026-03-17

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 16.x (latest: 16.1.7) | Full-stack framework — server + web frontend in one repo | App Router + Server Actions eliminates need for a separate API layer. Server Components render HTML on the server by default, which is correct for a mostly-read platform. Turbopack is now the default bundler (stable). React 19 + Compiler included. |
| TypeScript | 5.1+ (bundled) | Type safety | Next.js 16 ships with TypeScript built-in. Required — not optional — because runtime errors in team membership logic (e.g. 5-member cap enforcement) are expensive. |
| React | 19.x (bundled with Next.js) | UI rendering | Comes with Next.js. React 19 adds `useActionState` for form mutations — directly useful for the admin panel's create/edit flows. |

### Database

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| PostgreSQL | 16.x | Primary relational database | Relational model is the right fit: hackathons have teams, teams have members, cohorts have hackathons — all foreign-key relationships. Postgres is the clear choice over SQLite (no concurrent writes) or MongoDB (relational data is not a document fit). |
| Prisma ORM | 6.x | Database access layer, schema management, migrations | Best-in-class DX for TypeScript: auto-generated types from schema, Prisma Studio for quick data inspection, battle-tested migrations. Drizzle is lighter but requires more manual schema wiring — overkill savings for this scale. Prisma's generated client is worth the 2MB overhead. |
| Neon (hosted Postgres) | — | Managed PostgreSQL hosting | Serverless Postgres with a generous free tier (0.5 GB, 10 branches). Zero ops: no DB server to maintain. Branch-per-environment model (main/dev/preview) is a natural fit for a small team. Prisma supports Neon natively via `@prisma/adapter-neon`. |

### Authentication

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| jose | 5.x | JWT signing/verification for admin session | Next.js's own auth guide recommends `jose` for stateless session encryption (compatible with Edge Runtime). Iron-session is the alternative but jose is more primitive/flexible and has no extra dependencies. For a single shared admin password (not per-user sessions), a custom implementation using jose + Next.js `cookies()` API is 50 lines and avoids dragging in a full auth library. |
| bcrypt (via `bcryptjs`) | 2.x | Hash the stored admin password | The admin password is stored hashed in an environment variable or `.env`. `bcryptjs` is the pure-JS version — no native build step. At this scale (1 admin login per session) the performance difference from native `bcrypt` is irrelevant. |

No NextAuth.js / Auth.js: these libraries are designed for per-user OAuth/credential flows with a users table. This project has no users table. A 3-step custom auth (hash compare → sign JWT → set HttpOnly cookie) is simpler and more transparent.

### UI / Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.2 | Utility-first styling | v4 is the current stable release. CSS-first config (`@theme {}` in CSS, no `tailwind.config.js`). Automatic content detection (no `content` array). Significantly faster builds than v3. Required for achieving the Notion/Linear minimal-white aesthetic — utility classes map directly to whitespace, typography, and border decisions. |
| shadcn/ui | latest (component library) | Pre-built accessible UI components | Not a package — it's a CLI that copies component source into your repo. Components are built on Radix UI primitives (accessible) + Tailwind. Directly relevant components: Table, Dialog, Form, Badge, Tabs. The "New York" variant and neutral color scheme match the Notion/Linear visual direction. Because source is owned, components can be stripped to bone-minimal styling without fighting a library. |
| Radix UI Primitives | 2.x (via shadcn) | Accessible headless primitives | Pulled in transitively by shadcn. Dialog, Popover, DropdownMenu are needed for the admin panel. No direct installation needed beyond `npx shadcn init`. |

### Validation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zod | 3.x | Schema validation for Server Action inputs | Next.js's own docs use Zod for Server Action validation (official recommendation). Validates admin form inputs (hackathon creation, team edits) before they touch the database. Pairs with `useActionState` for inline form error display. TypeScript-first — schema doubles as type definition. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `server-only` | latest | Prevents server-side code leaking to client bundle | Add to all files that contain DB queries or session logic. Next.js pattern — catches misuse at build time. |
| `clsx` + `tailwind-merge` | latest | Conditional Tailwind class merging | Required by shadcn components. Use for conditional class logic in custom components. |
| `date-fns` | 4.x | Date formatting (hackathon dates, submission deadlines) | Lightweight, tree-shakeable. Only import the functions you use. Avoid `moment.js` (not tree-shakeable, large). |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Next.js 16 | Remix / SvelteKit | Next.js has the largest ecosystem, most up-to-date docs, Vercel's direct investment. Remix is solid but smaller community. SvelteKit has less TypeScript tooling maturity for Prisma. |
| ORM | Prisma 6 | Drizzle ORM | Drizzle is lighter and its SQL-like query syntax is cleaner for power users. But Prisma's generated types and Prisma Studio give better DX at this stage. For a greenfield project with 2-3 contributors, Prisma reduces friction during schema iteration. |
| Styling | Tailwind 4 | CSS Modules / Styled Components | Tailwind v4 is dramatically faster than v3 and the CSS-first config is simpler. CSS Modules would work but require more bespoke design tokens. Styled Components adds a runtime. |
| Auth | Custom jose sessions | NextAuth.js / Clerk | NextAuth is designed for per-user OAuth. Clerk is a hosted auth service (external dependency, cost). The BAY admin case (one shared password, 2-3 leads) is too simple to justify either. Custom sessions with jose are 50 lines and have zero external runtime dependencies. |
| Database | PostgreSQL / Neon | SQLite / Turso | SQLite/Turso works for read-heavy low-write apps but concurrent writes during team joins at event time are risky. Neon free tier is generous and ops-free. |
| UI Components | shadcn/ui | Mantine / Chakra UI | Mantine and Chakra ship with their own theming systems that resist deep overrides. shadcn gives full ownership of component code, which is required to achieve the Notion/Linear sparse whitespace aesthetic without fighting defaults. |

---

## Installation

```bash
# Bootstrap Next.js project with TypeScript, Tailwind, App Router, Turbopack
npx create-next-app@latest bay-server --yes
cd bay-server

# Initialize shadcn/ui (choose "New York" style, neutral color)
npx shadcn@latest init

# Add specific shadcn components as needed
npx shadcn@latest add table dialog form badge tabs button input label

# Database (Prisma + Neon adapter)
npm install prisma @prisma/client @prisma/adapter-neon @neondatabase/serverless
npx prisma init

# Auth (JWT sessions + password hashing)
npm install jose bcryptjs
npm install -D @types/bcryptjs

# Validation
npm install zod

# Utilities
npm install server-only clsx tailwind-merge date-fns
```

---

## Environment Variables Required

```bash
# .env.local
DATABASE_URL="postgresql://..."          # Neon connection string (pooled)
DATABASE_URL_UNPOOLED="postgresql://..."  # Neon direct connection (for migrations)
SESSION_SECRET=""                         # 32-char random string: openssl rand -base64 32
ADMIN_PASSWORD_HASH=""                    # bcrypt hash of the shared admin password
```

---

## Confidence Levels

| Decision | Confidence | Source |
|----------|------------|--------|
| Next.js 16.1.7 as framework | HIGH | Official nextjs.org docs (verified 2026-03-17) |
| Tailwind CSS v4.2 | HIGH | Official tailwindcss.com docs (verified 2026-03-17) |
| App Router + Server Actions for mutations | HIGH | Official Next.js auth guide and updating-data guide |
| jose for JWT sessions | HIGH | Explicitly recommended in Next.js official auth guide |
| Prisma for ORM | MEDIUM | Official recommendation pattern; exact v6 minor not verified from official source |
| Neon for hosted Postgres | MEDIUM | Known provider; exact current free tier limits not re-verified |
| shadcn/ui component library | MEDIUM | Well-established community standard; version pinned to latest via CLI |
| bcryptjs for password hashing | MEDIUM | Standard Node.js pattern; exact current version not npm-verified |
| date-fns v4 | MEDIUM | Known major version; exact patch not npm-verified |

---

## Sources

- Next.js 16.1.7 official docs: https://nextjs.org/docs (verified 2026-03-17)
- Next.js authentication guide: https://nextjs.org/docs/app/guides/authentication (verified 2026-03-17)
- Next.js Server Actions guide: https://nextjs.org/docs/app/getting-started/updating-data (verified 2026-03-17)
- Tailwind CSS v4.2 announcement: https://tailwindcss.com/blog/tailwindcss-v4 (verified 2026-03-17)
- Tailwind CSS v4 installation: https://tailwindcss.com/docs/installation (verified 2026-03-17)
