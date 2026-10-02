# Skill: Lucide React Media Icons (repo: lucide-react)

## Core Principles
- Install: `npm install lucide-react`.
- Design Mapping for CineStream:
  - Play / Pause: `<Play className="w-5 h-5 fill-current" />`, `<Pause className="w-5 h-5" />`
  - Audio: `<Volume2 />` (unmuted), `<VolumeX />` (muted)
  - Ratings & Badges: `<Star className="w-4 h-4 fill-secondary text-secondary" />`
  - Navigation: `<Search />`, `<Bookmark />`, `<Check />`, `<SlidersHorizontal />`
  - Streaming Controls: `<Maximize />`, `<RotateCcw />` (10s back), `<RotateCw />` (10s forward), `<Server />`
- Icon buttons must always include an accessible `aria-label` property.

## When to use
Any iconography in the app. Lucide is the spec'd icon set (SITE_SPEC `<custom_assets>`) and is already installed.

## Usage
```tsx
import { Play, Pause, Volume2, VolumeX, Star, Plus, Check } from "lucide-react";

<Play size={20} aria-hidden="true" />
<Star size={12} className="fill-gold" aria-hidden="true" />
```

## Spec'd icon inventory (SITE_SPEC)
Play, Pause, Volume2, VolumeX, Bookmark, Plus, Check, Star, Search, SlidersHorizontal, Maximize, Settings — plus in-use extras: ArrowLeft, Info, Server, ChevronLeft/Right. For 10s skip controls prefer `RotateCcw`/`RotateCw` (per Design Mapping) over `SkipBack`/`SkipForward`.

## Conventions (enforced in this codebase)
- Always pass `aria-hidden="true"` for decorative icons; pair with `sr-only` text or `aria-label` on the parent control.
- Sizing: the Design Mapping above uses Tailwind size classes (`w-5 h-5`); existing components also use the `size={n}` prop — both are acceptable, prefer the Design Mapping style for new player/nav controls.
- Color via Tailwind classes (`text-accent`, `text-gold`, `text-text-secondary`), fill via `fill-gold` for starred ratings.
- Icon-only buttons must include `aria-label` (WCAG 2.1 AA) — see watchlist toggle in `MediaCard`.

## Gotchas
- Tree-shaking: import named icons only (`import { Play } from "lucide-react"`), never the default export.
- `fill-*` Tailwind utilities work on Lucide's `fill="none"` SVGs — set both `fill` class and keep `stroke` default for the two-tone look.
- Don't mix icon libraries; if an icon is missing, prefer a close Lucide alternative over adding another package.