# Database Rules

## Default Scope
- Default to **no database** for static marketing sites. Persistent storage is added only when the spec (`SITE_SPEC.xml`) or business goal requires it (user accounts, dynamic content, transactions).

## Technology Selection
- **Relational / general-purpose:** PostgreSQL (hosted: Supabase, Neon, or Vercel Postgres) — default choice when structured data and relations are needed.
- **ORM:** Drizzle or Prisma with typed schemas; schema files live in `db/` or `src/db/` and are version-controlled.
- **Blob/storage:** Use the platform's object storage (e.g., Vercel Blob, Supabase Storage, S3) for media; never store large binaries in the database.

## Schema Discipline
- Every table has a primary key (`uuid` preferred), `created_at`, and `updated_at` timestamps.
- Use explicit foreign keys with defined `ON DELETE` behavior; add indexes for all foreign keys and frequent query columns.
- Schema changes only via migrations — never manual edits in a console. Migrations are committed and reproducible from a fresh database.

## Access Patterns
- Server-side data access only; the database is never exposed directly to the client.
- Wrap queries in typed data-access functions (e.g., `db/queries/`), not inline in components.
- Use connection pooling in serverless environments; avoid opening a new connection per request.

## Data Hygiene
- Validate all writes with schema validation (Zod) before they reach the database.
- No PII stored without a documented reason recorded in `.cline/memory.md`.
- Seed scripts (`db/seed.ts`) must be idempotent and safe to re-run.