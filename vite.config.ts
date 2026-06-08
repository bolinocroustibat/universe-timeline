import { sentrySvelteKit } from "@sentry/sveltekit"
import { sveltekit } from "@sveltejs/kit/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import packageJson from "./package.json" with { type: "json" }

export default defineConfig({
	plugins: [
		sentrySvelteKit({
			sourceMapsUploadOptions: {
				org: "adrien-carpentier",
				project: packageJson.name,
				release: {
					name: packageJson.version,
				},
			},
		}),
		sveltekit(),
		tailwindcss(),
	],
	define: {
		__APP_VERSION__: JSON.stringify(packageJson.version),
	},
})
