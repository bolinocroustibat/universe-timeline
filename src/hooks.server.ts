import * as Sentry from "@sentry/sveltekit"
import { handleErrorWithSentry, sentryHandle } from "@sentry/sveltekit"
import { sequence } from "@sveltejs/kit/hooks"

Sentry.init({
	dsn: "https://ea95fe04436ff6b884fa14af3657a371@o352691.ingest.us.sentry.io/4509797086593024",

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
