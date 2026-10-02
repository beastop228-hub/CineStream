# Skill: Vidstack Video Player Architecture (repo: vidstack/player)

## Core Principles
- Reference: High-performance HLS media architecture inspired by `vidstack/player`.
- Embed & Stream Failover Protocol:
  - Default primary: Multi-server cloud iframe fallback toolbar (`vidsrc.to`, `vidsrc.xyz`, `autoembed.co`, `2embed.cc`).
  - HLS Fallback: When direct `.m3u8` streams are supplied, mount a custom scrub bar, volume slider, time indicator, and playback speed menu.
  - Inactivity Timer: Player control chrome must auto-hide after 2.5 seconds of mouse inactivity when playing in full screen.

## When to use
Replacing or upgrading the iframe-based `StreamPlayer` (`src/components/media/StreamPlayer.tsx`) with a first-class HLS player for the `/watch/[id]` route — custom scrub bar, keyboard shortcuts, auto-hiding chrome, quality/subtitle menus (SITE_SPEC `<meaningful_interactions>`).

## Setup
```bash
npm install @vidstack/react player styles
# styles imported in the player component:
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
```

## Core usage (App Router, client component)
```tsx
"use client";
import { MediaPlayer, MediaProvider, Poster, Track } from "@vidstack/react/player";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";

<MediaPlayer
  src={{ src: hlsUrl, type: "application/x-mpegurl" }}
  crossOrigin
  title={titleName}
  className="h-full w-full"
  onCanPlay={() => /* track video_play_started */}
  onEnded={() => /* track completed */}
>
  <MediaProvider>
    <Poster className="vds-poster" alt="" />
  </MediaProvider>
  <DefaultVideoLayout icons={defaultLayoutIcons} />
</MediaPlayer>
```

## CineStream integration notes
- **Dynamic import with ssr:false** (SITE_SPEC `<performance_optimization>`): wrap the player in `next/dynamic` so the SDK is deferred and hydration stays clean:
  ```tsx
  const Player = dynamic(() => import("./PlayerShell"), { ssr: false });
  ```
- **HLS source:** stream manifests come from Cloudflare Stream / Bunny.net (`VIDEO_CDN_BASE_URL` env). `.m3u8` plays natively via hls.js bundled inside Vidstack.
- **Keyboard shortcuts (spec):** Space = play/pause, F = fullscreen, M = mute, ←/→ = 10s skip — Vidstack provides these by default; customize via `keyShortcuts` prop if skip must be 10s.
- **Auto-hiding chrome (spec: 2.5s inactivity in fullscreen):** DefaultVideoLayout hides controls on idle automatically; set `--video-controls-hide-delay: 2.5s` to match the spec exactly.
- **Progress tracking:** use `onTimeUpdate` to heartbeat `progressSeconds` to `/api/progress` (Prisma-backed, Phase 2 pending) and fire milestone events (25/50/75/completed) for PostHog.
- **Episode drawer:** keep the slide-out episode selector as a sibling component; Vidstack doesn't manage playlists.

## Gotchas
- Must be a client component; never render server-side (Web Components + hydration).
- Import both `theme.css` and `layouts/video.css` or controls render unstyled.
- For the current third-party embed servers (vidsrc/2embed/autoembed), iframes are still required — Vidstack applies only when direct HLS URLs exist.
- Next 16: `next/dynamic` with `ssr: false` is not allowed in Server Components — do it inside a client wrapper.