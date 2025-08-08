import * as Sentry from "@sentry/sveltekit"
import { handleErrorWithSentry, replayIntegration } from "@sentry/sveltekit"

Sentry.init({
	dsn: "https://ea95fe04436ff6b884fa14af3657a371@o352691.ingest.us.sentry.io/4509797086593024",

	tracesSampleRate: 1.0,

	// Enable logs to be sent to Sentry
	enableLogs: true,

	// This sets the sample rate to be 10%. You may want this to be 100% while
	// in development and sample at a lower rate in production
	replaysSessionSampleRate: 0.1,

	// If the entire session is not sampled, use the below sample rate to sample
	// sessions when an error occurs.
	replaysOnErrorSampleRate: 1.0,

	// If you don't want to use Session Replay, just remove the line below:
	integrations: [replayIntegration()],
})

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry()
