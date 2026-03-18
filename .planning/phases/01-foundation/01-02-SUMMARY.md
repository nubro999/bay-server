---
phase: 01-foundation
plan: 02
subsystem: auth
tags: [jwt, jose, bcryptjs, next-auth, proxy, session, cookie, server-actions]

# Dependency graph
requires:
  - phase: 01-foundation/01-01
    provides: Next.js 16 bootstrap, Vitest scaffold, db.ts, definitions.ts, shadcn UI components
provides:
  - "JWT session management via jose HS256 (encrypt/decrypt/createSession/deleteSession)"
  - "DAL verifySession() memoized with React cache() — defense-in-depth for Server Actions"
  - "proxy.ts route guard — redirects unauthenticated /admin/** to /admin/login"
  - "login/logout Server Actions with bcrypt password comparison"
  - "Admin login page at /admin/login with shadcn Input, Button, useActionState"
  - "POST /api/admin/logout route as alternative logout endpoint"
affects: [01-03, 01-04, phase-02, all-admin-crud-plans]

# Tech tracking
tech-stack:
  added: []  # jose, bcryptjs, server-only all pre-installed from Plan 01
  patterns:
    - "Next.js 16: cookies() must be awaited (const cookieStore = await cookies())"
    - "proxy.ts replaces middleware.ts — export named proxy not middleware"
    - "React cache() on verifySession for deduplication across Server Action calls"
    - "TDD RED-GREEN cycle: failing tests committed before implementation"
    - "'use server' on Server Actions, 'use client' on form components using useActionState"

key-files:
  created:
    - app/lib/session.ts
    - app/lib/dal.ts
    - proxy.ts
    - app/actions/auth.ts
    - app/api/admin/logout/route.ts
    - app/(admin)/admin/login/page.tsx
    - app/(admin)/admin/login/LoginForm.tsx
  modified:
    - tests/session.test.ts
    - tests/auth.test.ts
    - tests/proxy.test.ts
    - tsconfig.json

key-decisions:
  - "proxy.ts at project root (not middleware.ts) per Next.js 16 breaking change — export function proxy not middleware"
  - "All cookies() calls awaited — Next.js 16 requires async cookies()"
  - "verifySession() wrapped in React cache() to prevent redundant cookie reads per request cycle"
  - "bcrypt hash in test fixture corrected — plan's pre-computed hash did not match testpassword"
  - "tsconfig.json excludes tests/ dir and adds typeRoots to prevent adm-zip workspace type pollution"

patterns-established:
  - "Pattern 1: Server-only guard — import 'server-only' at top of all session/DAL files"
  - "Pattern 2: Two-layer auth — proxy.ts at edge + verifySession() in each Server Action"
  - "Pattern 3: TDD with vi.mock at describe-level, vi.clearAllMocks() in beforeEach"

requirements-completed: [ADMN-01]

# Metrics
duration: 5min
completed: 2026-03-18
---

# Phase 1 Plan 02: Admin Authentication Summary

**bcrypt + jose JWT auth with proxy.ts edge guard, DAL verifySession, and shadcn login page UI for /admin/**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-18T05:48:39Z
- **Completed:** 2026-03-18T05:53:11Z
- **Tasks:** 2
- **Files modified:** 11 (7 created, 4 modified)

## Accomplishments
- JWT session management using jose HS256 — encrypt/decrypt/createSession/deleteSession with 7-day expiry httpOnly cookie
- proxy.ts edge route guard redirecting unauthenticated /admin/** requests to /admin/login (Next.js 16 pattern)
- verifySession() DAL function wrapped in React cache() for server-side defense-in-depth
- Admin login page at /admin/login with password form using useActionState and shadcn components
- All 8 tests pass (4 session, 2 proxy, 2 auth); TypeScript build clean

## Task Commits

Each task was committed atomically:

1. **Task 1 (TDD RED): Session tests** - `07ae6c5` (test)
2. **Task 1 (TDD GREEN): session.ts + dal.ts** - `61f235e` (feat)
3. **Task 2 (TDD RED): Auth + proxy tests** - `337e66d` (test)
4. **Task 2 (TDD GREEN): proxy.ts + auth actions + login UI** - `9d6ad0d` (feat)

_TDD tasks have separate test and implementation commits_

## Files Created/Modified
- `app/lib/session.ts` - JWT encrypt/decrypt/createSession/deleteSession using jose HS256
- `app/lib/dal.ts` - verifySession() with React cache(), redirects unauthenticated callers
- `proxy.ts` - Next.js 16 route guard at project root, export function proxy
- `app/actions/auth.ts` - login (bcrypt compare + createSession) and logout Server Actions
- `app/api/admin/logout/route.ts` - POST /api/admin/logout as alternative endpoint
- `app/(admin)/admin/login/page.tsx` - Admin login page
- `app/(admin)/admin/login/LoginForm.tsx` - Client form with useActionState for login action
- `tests/session.test.ts` - 4 tests: encrypt produces string, decrypt valid/invalid/empty
- `tests/auth.test.ts` - 2 tests: wrong password error, correct password calls createSession
- `tests/proxy.test.ts` - 2 tests: unauthenticated redirects, /admin/login passes through
- `tsconfig.json` - Exclude tests/, add typeRoots to local node_modules/@types only

## Decisions Made
- Used `export function proxy` (not `middleware`) per Next.js 16 breaking change — proxy.ts at project root
- All `cookies()` calls are awaited — required by Next.js 16 async Headers API
- `verifySession()` wrapped in `cache()` from react to prevent duplicate cookie reads within same request
- Login form uses `useActionState` from React 19 (not deprecated `useFormState`)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Incorrect bcrypt hash in test fixture**
- **Found during:** Task 2 (TDD GREEN — auth tests failing after implementation)
- **Issue:** The plan's pre-computed bcrypt hash (`$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`) did not match "testpassword", causing `createSession` to never be called during the correct-password test
- **Fix:** Generated correct hash via `bcrypt.hash('testpassword', 10)` and updated tests/auth.test.ts
- **Files modified:** tests/auth.test.ts
- **Verification:** Auth test "calls createSession for correct password" passes
- **Committed in:** `9d6ad0d` (Task 2 implementation commit)

**2. [Rule 1 - Bug] TypeScript build failure — vi globals not typed in tests/setup.ts**
- **Found during:** Task 2 verification (`npm run build`)
- **Issue:** tests/setup.ts used `vi` global without type declaration; tsconfig.json included tests/ in compilation; `adm-zip` types from parent workspace node_modules also leaked in
- **Fix:** Added `"tests"` to tsconfig exclude array; added `"typeRoots": ["./node_modules/@types"]` to restrict type search to local packages only
- **Files modified:** tsconfig.json
- **Verification:** `npm run build` succeeds; TypeScript clean; 6 routes compiled
- **Committed in:** `9d6ad0d` (Task 2 implementation commit)

**3. [Rule 1 - Bug] Mock isolation issue — vi.resetModules() doesn't preserve mock factory**
- **Found during:** Task 2 (TDD GREEN — createSession spy not called)
- **Issue:** Adding `vi.resetModules()` in beforeEach caused the re-imported session module to lose connection to the top-level `vi.mock()` factory, making the spy invisible to the login action
- **Fix:** Removed `vi.resetModules()`, imported session module directly in the test (not via destructuring from earlier import) so the reference stays within the same mock factory instance
- **Files modified:** tests/auth.test.ts
- **Verification:** Both auth tests pass
- **Committed in:** `9d6ad0d` (Task 2 implementation commit)

---

**Total deviations:** 3 auto-fixed (1 incorrect test fixture, 1 TypeScript config, 1 mock isolation)
**Impact on plan:** All fixes required for correctness. No scope creep. Core auth pattern unchanged from plan.

## Issues Encountered
- Vitest module caching behavior with `vi.mock()` factories and `vi.resetModules()` required careful handling — `resetModules` breaks the mock factory binding; solution is to keep mock at describe-level and import fresh references within each test body

## User Setup Required
Before first run, add to `.env.local`:
```
SESSION_SECRET=<32+ character random string>
ADMIN_PASSWORD_HASH=<bcrypt hash of your admin password>
```

Generate a hash: `node -e "require('bcryptjs').hash('yourpassword', 10).then(console.log)"`

## Next Phase Readiness
- Auth layer fully operational — proxy.ts + verifySession() ready to protect Plan 03/04 admin CRUD pages
- All /admin/** routes are guarded; /admin/login is the sole unauthenticated entry point
- Two concerns from STATE.md still pending (ghost UX, race condition) — out of scope for this phase

---
*Phase: 01-foundation*
*Completed: 2026-03-18*
