# The Timeline of the Universe

An interactive web application for exploring and visualizing the complete history of the universe from the Big Bang to present day through a zoomable timeline interface.

## 📦 Dependencies

- [Bun](https://bun.sh) for the package manager
- [SvelteKit](https://kit.svelte.dev) for the frontend framework
- [TailwindCSS](https://tailwindcss.com) for styling
- [Biome](https://biomejs.dev) for linting and formatting

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Environment (development, production, etc.)
VITE_ENV=development

# Enable debug mode (true/false)
PUBLIC_DEBUG=false
```

## 🤖 Coding modern Svelte with AI assistants like Cursor

[svelte-llm](https://svelte-llm.khromov.se) provides developer documentation for Svelte in an LLM-ready format for coding with AI assistants like [Cursor](https://cursor.sh), so that the AI assitant knows about modern Svelte 5 syntax and patterns.

For this project, add the mention `@https://svelte-llm.khromov.se/svelte-kit` when asking the AI assistant.

## 🤝 Contributing

Lint and format the code with [Biome](https://biome.sh) with:
```bash
bunx biome check --write src
```

## 🚀 Developing

Once you've created a project and installed dependencies with `bun install` (or `npm install`), start a development server:

```bash
bun run dev

# or start the server and open the app in a new browser tab
bun run dev -- --open
```

## 🏗️ Building

To create a production version of your app:

```bash
bun run build
```

You can preview the production build with `bun run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
