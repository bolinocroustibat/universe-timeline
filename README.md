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

Copy `.env.example` to `.env` and adjust values as needed:

```env
# Host port for Docker (default: 3000)
APP_PORT=3000

# Environment (development, production, etc.)
VITE_ENV=development

# Enable debug mode (true/false)
PUBLIC_DEBUG=false
```

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
