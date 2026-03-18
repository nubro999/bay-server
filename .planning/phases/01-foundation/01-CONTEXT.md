# Phase 1: Foundation - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Database schema (Cohort → Hackathon → Team → Member), admin authentication with shared bcrypt password, and admin CRUD for cohorts and hackathons. This phase delivers the data layer and admin tooling — no public-facing UI.

</domain>

<decisions>
## Implementation Decisions

### Hackathon data model
- Fields: title, description (medium-length paragraph), start date, end date, external link URL, cover image URL (paste only, no file upload), track/category tag (free-text, admin types anything)
- Description is plain text, medium length — a few sentences with rules/context
- Cover image is a URL field only — no file upload or storage needed
- Track tags are free-text strings (e.g. "EVM", "Solana", "Grants") — flexible for future cohorts

### Cohort data model
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

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project

### Established Patterns
- None — first phase establishes all patterns

### Integration Points
- Schema established here will be used by all subsequent phases
- Admin auth pattern set here carries through Phase 3

</code_context>

<specifics>
## Specific Ideas

- Hackathon external links reference real platforms: Colosseum (https://colosseum.com/) for Solana, XRPL Korea (https://xrplkorea.org/34) for Grants
- Minimal white design (Notion/Linear aesthetic) applies to admin panel too
- BAY is "Blockchain Academy Yonsei" — branding should reference this

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-18*
