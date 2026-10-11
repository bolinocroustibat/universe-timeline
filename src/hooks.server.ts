import * as Sentry from "@sentry/sveltekit"
import { handleErrorWithSentry, sentryHandle } from "@sentry/sveltekit"
import { sequence } from "@sveltejs/kit/hooks"
import { PUBLIC_ENV, PUBLIC_SENTRY_DSN } from "$app/env/public"

const sentryEnvironment = PUBLIC_ENV

Sentry.init({
	dsn: PUBLIC_SENTRY_DSN,
	enabled: Boolean(PUBLIC_SENTRY_DSN) && sentryEnvironment !== "local",
	environment: sentryEnvironment,
	release: __APP_VERSION__,
	tracesSampleRate: 1.0,
	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: import.meta.env.DEV,
})

// If you have custom handlers, make sure to place them after `sentryHandle()` in the `sequence` function.
export const handle = sequence(sentryHandle())

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry()
