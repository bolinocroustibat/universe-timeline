import * as Sentry from "@sentry/sveltekit"
import { handleErrorWithSentry, sentryHandle } from "@sentry/sveltekit"
import { sequence } from "@sveltejs/kit/hooks"
import { env } from "$env/dynamic/public"

const sentryEnvironment = env.PUBLIC_ENV ?? "unknown"

Sentry.init({
	dsn: env.PUBLIC_SENTRY_DSN,
	enabled: Boolean(env.PUBLIC_SENTRY_DSN) && sentryEnvironment !== "local",
	environment: sentryEnvironment,
	release: __APP_VERSION__,
	tracesSampleRate: 1.0,
	// Enable logs to be sent to Sentry
	enableLogs: true,
	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: import.meta.env.DEV,
})

// If you have custom handlers, make sure to place them after `sentryHandle()` in the `sequence` function.
export const handle = sequence(sentryHandle())

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry()
