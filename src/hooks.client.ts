import * as Sentry from "@sentry/sveltekit"
import { handleErrorWithSentry, replayIntegration } from "@sentry/sveltekit"
import { PUBLIC_ENV, PUBLIC_SENTRY_DSN } from "$app/env/public"

const sentryEnvironment = PUBLIC_ENV

Sentry.init({
	dsn: PUBLIC_SENTRY_DSN,
	enabled: Boolean(PUBLIC_SENTRY_DSN) && sentryEnvironment !== "local",
	environment: sentryEnvironment,
	release: __APP_VERSION__,
	// If you don't want to use Session Replay, just remove the line below:
	integrations: [replayIntegration()],
	tracesSampleRate: 1.0,
	// This sets the sample rate to be 10%. You may want this to be 100% while
	// in development and sample at a lower rate in production
	replaysSessionSampleRate: 0.1,
	// If the entire session is not sampled, use the below sample rate to sample
	// sessions when an error occurs.
	replaysOnErrorSampleRate: 1.0,
})

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry()
