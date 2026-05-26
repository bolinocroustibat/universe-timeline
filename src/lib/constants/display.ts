/** Must stay in sync with the portrait media query in app.css */
export const FORCED_LANDSCAPE_MEDIA =
	"(max-width: 1024px) and (orientation: portrait)"

export function isForcedLandscape(): boolean {
	return window.matchMedia(FORCED_LANDSCAPE_MEDIA).matches
}
