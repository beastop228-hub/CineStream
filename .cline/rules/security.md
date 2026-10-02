# Security Rules

## Secrets & Environment
- Never hardcode secrets, API keys, or tokens in source code. All secrets live in environment variables (`.env.local`, excluded from git via `.gitignore`).
- Only variables prefixed with `NEXT_PUBLIC_` are exposed to the client — treat everything else as server-only.
- Provide `.env.example` documenting every required variable (names only, no values).

## Input Handling
- Validate and sanitize **all** external input (forms, query params, webhooks, CMS content) with Zod schemas on the server — client-side validation is UX only, never a security control.
- Escape/sanitize any user-supplied content rendered as HTML; avoid `dangerouslySetInnerHTML` unless content is sanitized server-side.

## API & Form Endpoints
- Rate-limit public form/API endpoints (e.g., in-memory or Upstash Redis limiter) to prevent abuse.
- Apply CSRF protection for state-changing routes where cookies/sessions are involved.
- Return generic error messages to clients; log detailed errors server-side only (no PII in logs).

## Dependencies & Platform
- Keep dependencies minimal and pinned; run `npm audit` before releases and address high/critical findings.
- Enable standard security headers (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`) via `next.config.ts` or middleware.
- Serve everything over HTTPS; set `Secure`, `HttpOnly`, `SameSite=Lax` on any cookies.

## Data Protection & Compliance
- Collect the minimum personal data necessary; document any collection in the privacy policy and `.cline/memory.md`.
- If analytics or forms collect personal data, a cookie consent banner and privacy policy link are mandatory.
- No PII in client-side storage (localStorage/sessionStorage).