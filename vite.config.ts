import { sentrySvelteKit } from "@sentry/sveltekit/vite"
import adapter from "@sveltejs/adapter-bun"
import { sveltekit } from "@sveltejs/kit/vite"
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import packageJson from "./package.json" with { type: "json" }

export default defineConfig({
	plugins: [
		sentrySvelteKit({
			org: "adrien-carpentier",
			project: packageJson.name,
			release: {
				name: packageJson.version,
			},
		}),
		sveltekit({
			preprocess: vitePreprocess(),
			adapter: adapter(),
		}),
		tailwindcss(),
	],
	define: {
		__APP_VERSION__: JSON.stringify(packageJson.version),
	},
})
