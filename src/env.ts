import { defineEnvVars } from "@sveltejs/kit/env"

export const variables = defineEnvVars({
	PUBLIC_ENV: {
		public: true,
		schema: (input: string | undefined): string => input || "unknown",
	},
	PUBLIC_SENTRY_DSN: {
		public: true,
		schema: (input: string | undefined): string => input ?? "",
	},
	PUBLIC_DEBUG: {
		public: true,
		schema: (input: string | undefined): string => input ?? "",
	},
})
