import { sentrySvelteKit } from "@sentry/sveltekit";
import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vite"
import packageJson from "./package.json" with { type: "json" }
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
	plugins: [sentrySvelteKit({
        sourceMapsUploadOptions: {
            org: "adrien-carpentier",
            project: "universe-timeline"
        }
    }), sveltekit(), tailwindcss()],
	define: {
		__APP_VERSION__: JSON.stringify(packageJson.version),
	}
})