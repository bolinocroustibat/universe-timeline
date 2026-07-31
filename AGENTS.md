# AGENTS.md

## Cursor Cloud specific instructions

This is a single self-contained **SvelteKit 5 + Bun** static-data web app ("The Timeline of the Universe"). There is no database, backend API, or other external service — the timeline is driven entirely by static `.jsonc` files in `static/` fetched client-side. The `db`/`api` entries in `docker-compose.yaml` are commented-out placeholders and are not part of the current product.

### Toolchain
- **Bun is the required package manager and runtime** (see `.cursor/rules/bun.mdc`). Never use `npm`/`npx`/`pnpm`. Use `bun`/`bunx`. Bun is installed at `~/.bun/bin` and symlinked into `/usr/local/bin`, so it is on `PATH` for non-interactive shells. Dependencies are refreshed automatically by the startup update script (`bun install`).

### Commands (standard ones are in `README.md` / `package.json`)
- Dev server: `bun run dev` (Vite, serves on port **5173**, not the Docker port 3000). Use `bun run dev --host` to bind on all interfaces.
- Type/Svelte check: `bun run check`
- Lint: `bunx biome check src` (add `--write` to auto-fix). CI treats lint failures as errors.
- Unit tests: `bun test` (runs `*.test.ts` under `src/lib/utils/`).
- Production build: `bun run build`; preview with `bun run preview`.

### Non-obvious notes
- Copy `.env.example` to `.env` before running (it is gitignored). Defaults are fine for local dev; `PUBLIC_ENV=local` keeps Sentry inert, so no Sentry DSN or auth token is needed. Sentry warnings during `bun run build` about a missing auth token are expected and harmless in dev.
- `bun run dev` serves on **5173**; only the Docker/production run (`docker compose up --build`) uses **3000**.
- Lint (`bunx biome check src`) may report pre-existing import-ordering violations in the current tree; these are not caused by environment setup.
