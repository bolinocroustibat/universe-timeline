# The Timeline of the Universe

An interactive web application for exploring and visualizing the complete history of the universe from the Big Bang to present day through a zoomable timeline interface.

## 📦 Tech stack

- [Bun](https://bun.sh) — package manager and production runtime
- [Svelte 5](https://svelte.dev) + [SvelteKit](https://kit.svelte.dev) — frontend
- [TypeScript](https://www.typescriptlang.org) - programming language
- [Vite](https://vite.dev) — build tool
- [Tailwind CSS](https://tailwindcss.com) — styling
- [Sentry](https://sentry.io) — error tracking
- [Biome](https://biomejs.dev) — linting and formatting

## 🔧 Environment Variables

Copy [`.env.example`](.env.example) to `.env` and adjust values as needed.

## 🤖 Coding modern Svelte with AI assistants like Cursor

[svelte-llm](https://svelte-llm.khromov.se) provides an up-to-date Svelte 5 and SvelteKit documentation via a Model Context Protocol (MCP) server.
Connect the MCP Server to your IDE / Coding Assistant following [svelte-llm](https://svelte-llm.khromov.se) documentation.

## 🤝 Contributing

Lint and format the code with [Biome](https://biome.sh) with:
```bash
bunx biome check --write src
```

On every PR to `main`, the [check-lint-and-build workflow](.github/workflows/check-lint-and-build.yaml) runs `bun run check`, `bunx biome check src`, and `bun run build`.

## 🚀 Developing

Once you've created a project and installed dependencies with `bun install` (or `npm install`), start a development server:

```bash
bun run dev

# or start the server and open the app in a new browser tab
bun run dev -- --open
```

## 🏗️ Building

### Without Docker

To create a production version of your app:

```bash
bun run build
```

You can preview the production build with `bun run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

### 🐳 With Docker

Copy `.env.example` to `.env`, then build and run the app:

```bash
docker compose up --build
```

The app is available at [http://localhost:3000](http://localhost:3000) (override with `APP_PORT` in `.env`). Timeline data in `static/` is mounted into the container.

Production releases are triggered by pushing a version tag. The [deploy workflow](.github/workflows/deploy.yaml) bumps the version, builds and pushes the Docker image to GHCR, redeploys via `docker compose`, then creates a GitHub Release and a Sentry release.

## TODO

Future UX improvements to tackle (in priority order):

- [x] **1 — Timeline as content background** — `TimelineGrid` inside `Content`: **full-height vertical tick grid** behind geological periods and events; **date labels on a reserved bottom band** that foreground never covers. Reclaims the vertical space formerly used by the dedicated timeline strip for the timeline navigator. Full spec: [docs/plans/timeline-as-content-background.md](docs/plans/timeline-as-content-background.md). *Later (optional):* slight transparency on fills so grid lines show through the middle of the canvas.
- [x] **2 — Timeline navigator** — *Depends on #1.* Dedicated strip (~48–56px) below the content area (replacing the former dedicated timeline strip), outside `pan-container`. **Horizontal** layout, same axis as the main timeline (Big Bang left, today right): upper row is a linear track with a scrollbar-style thumb (**position** = viewport center year; **fixed minimum width**, not proportional span); lower row shows the formatted center date centered under the thumb (edge-clamped), plus zoom tier label from `tierId` in `src/lib/constants/zoom.ts`. Draggable thumb for coarse navigation; label updates live while panning. Full spec: [docs/plans/timeline-navigator.md](docs/plans/timeline-navigator.md).
- [x] **3 — Zoom-dependent event uncertainty spans** — When `dateUncertainty` is visually meaningful at the current zoom, render an event as a horizontal span in the **events zone** (lower band); otherwise keep the point marker + card. Full spec: [docs/plans/geological-periods-and-uncertainty-spans.md](docs/plans/geological-periods-and-uncertainty-spans.md).
- [x] **4 — Lane stacking for overlapping event spans/cards** — When multiple events or uncertainty spans overlap horizontally, assign vertical lanes with peek spacing so each item stays readable and clickable.
- [ ] **5 — Event colors in data** — Populate optional `color` per event in `events.jsonc` for span and card styling.
- [ ] **6 — Geological period uncertainty rendering** — Render `startUncertainty` and `endUncertainty` as meaningful spans or ± ranges when zoom makes them visible.
- [ ] **7 — Shareable URLs** — Encode viewport state in the query string (e.g. `?at=-4540000000&zoom=8`) so users can link directly to a date and zoom level.
- [ ] **8 — Images in detail views** — Show event/geological-period images in expanded states (`EventCard`, `GeologicalPeriodPopover`); image paths already exist in `static/events.jsonc` and `static/geologicalPeriods.jsonc`.
- [ ] **9 — Date ranges for geological periods** — Display geological period start–end dates (with uncertainty when relevant) in detail views, matching how event cards already show `formatDate(event.date)`.
