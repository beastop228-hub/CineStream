# Frontend Rules

## Stack
- Default: Next.js (App Router) + TypeScript + Tailwind CSS, unless `SITE_SPEC.xml` specifies otherwise.
- Use the App Router (`app/` directory) with server components by default; add `"use client"` only where interactivity is required.

## Component Architecture
- Feature-based organization: `components/ui/` for primitives, `components/sections/` for page sections, `components/features/` for feature-specific logic.
- Components must be small, typed, and single-purpose. Props typed with explicit interfaces; no `any`.
- Co-locate component-specific styles, tests, and types with the component when practical.

## Styling
- Tailwind-first; mobile-first responsive classes (`sm:`, `md:`, `lg:`, `xl:`).
- Define design tokens (colors, fonts, spacing) in `tailwind.config.ts` / CSS variables — never hardcode raw hex values in components.
- Respect `prefers-reduced-motion` for all animations and transitions.

## Accessibility (WCAG 2.1 AA)
- Semantic HTML5 landmarks (`header`, `nav`, `main`, `footer`, `section` with `aria-labelledby`).
- Single H1 per page; logical heading hierarchy H1→H6.
- Minimum 4.5:1 contrast for body text, 3:1 for large text and UI boundaries.
- All interactive elements keyboard-reachable with visible focus states; images require meaningful `alt` text.

## Performance
- Use `next/image` for all imagery, `next/font` for fonts (no render-blocking font CSS).
- Lazy-load below-the-fold and heavy components via `next/dynamic`.
- Target Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1.

## Code Hygiene
- No dead code, no commented-out blocks, no `console.log` in committed code.
- Run `lint` and `typecheck` before declaring any frontend task complete.