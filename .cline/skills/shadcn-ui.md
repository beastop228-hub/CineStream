# Skill: shadcn/ui Architecture (repo: shadcn-ui/ui)

## Core Principles
- Always install components via the official CLI: `npx shadcn@latest add <component-name>`.
- Use accessible, dark-themed primitives:
  - `dialog`: For instant trailer popups and title synopsis modals.
  - `sheet` / `drawer`: For episode lists and season selectors on mobile screens.
  - `dropdown-menu`: For server switching (Server 1, Server 2) and subtitle/audio track selectors.
  - `skeleton`: For pulse-loading placeholders when TMDB poster images are fetching.
- Never write ad-hoc modal styling when a shadcn primitive exists.

## When to use
Building or extending UI primitives (buttons, dialogs, dropdowns, toasts, forms, tooltips) in `src/components/ui/` while keeping the CineStream design tokens from `SITE_SPEC.xml`.

## Setup (this project)
- Tailwind CSS v4 (CSS-first config in `src/app/globals.css` `@theme` — there is NO `tailwind.config.ts`).
- Path alias `@/*` → `src/*` (see `tsconfig.json`).
- Install CLI: `npx shadcn@latest init`, then add components: `npx shadcn@latest add button dialog dropdown-menu`.

## Token mapping (shadcn CSS vars → CineStream palette)
Map shadcn's semantic variables in `globals.css` to the brand palette:
- `--background: #0B0E14` (deep obsidian)
- `--card` / `--popover: #151B26` (slate navy surface)
- `--border: #232B3B` (subtle boundary)
- `--primary: #E50914` (crimson accent — primary actions)
- `--secondary-foreground` / ratings: `#FBBF24` (amber gold)
- `--foreground: #F9FAFB`, `--muted-foreground: #9CA3AF`
- Radius: rounded-xl cards, rounded-full pills (match existing `Button`/`Badge`).

## Conventions
- Existing primitives (`Button.tsx`, `Badge.tsx`) use `cn()`-style class merging — install `clsx` + `tailwind-merge` and use the same pattern for new shadcn components.
- shadcn components are copied into the repo (not npm imports) — place them in `src/components/ui/` and adapt classes to tokens; never import from `shadcn-ui` packages.
- Forms: pair shadcn `Form` with React Hook Form + Zod (SITE_SPEC `<form_state>`).
- Accessibility: keep Radix-based focus rings (`focus-visible:outline-2 outline-accent`) consistent with existing components.

## Gotchas
- Tailwind v4: shadcn's `@apply`-heavy components work, but define `@theme` tokens first; `css.lint.unknownAtRules: ignore` is already set in `.vscode/settings.json`.
- Dark-only app: set `class="dark"` semantics aside — hardcode dark palette values instead of light/dark switching.