import { sveltekit } from "@sveltejs/kit/vite"
import { defineConfig } from "vite"
import packageJson from "./package.json" with { type: "json" }
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	define: {
		__APP_VERSION__: JSON.stringify(packageJson.version),
	}
})
