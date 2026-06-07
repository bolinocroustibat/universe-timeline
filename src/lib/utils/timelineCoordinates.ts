import { isForcedLandscape } from "$lib/constants/display"

interface TimelineMetrics {
	screenAxisX: number
	screenAxisY: number
	screenSpan: number
	layoutPerScreenPx: number
}

/**
 * Derives screen-to-layout coordinate mapping for the timeline container.
 * In forced-landscape (rotated portrait) mode the timeline axis follows the
 * screen Y axis; otherwise it follows screen X.
 *
 * @param container - Timeline container element whose `clientWidth` is the layout axis length
 * @returns Axis projection weights, visible screen span, and layout pixels per screen pixel
 */
function getTimelineMetrics(container: HTMLElement): TimelineMetrics {
	const layoutWidth = container.clientWidth
	const screenRect = container.getBoundingClientRect()

	if (isForcedLandscape()) {
		const screenSpan = screenRect.height
		return {
			screenAxisX: 0,
			screenAxisY: 1,
			screenSpan: screenSpan > 0 ? screenSpan : 1,
			layoutPerScreenPx: layoutWidth / (screenSpan > 0 ? screenSpan : 1),
		}
	}

	const screenSpan = screenRect.width
	return {
		screenAxisX: 1,
		screenAxisY: 0,
		screenSpan: screenSpan > 0 ? screenSpan : 1,
		layoutPerScreenPx: layoutWidth / (screenSpan > 0 ? screenSpan : 1),
	}
}

/**
 * Maps a screen pointer position to layout X along the timeline axis.
 * Accounts for CSS rotation when forced-landscape is active.
 *
 * @param container - Timeline container element
 * @param clientX - Pointer X in viewport coordinates
 * @param clientY - Pointer Y in viewport coordinates
 * @returns Position in layout pixels from the container's leading edge along the timeline
 */
export function screenToTimelineX(
	container: HTMLElement,
	clientX: number,
	clientY: number,
): number {
	const { screenAxisX, screenAxisY, layoutPerScreenPx } =
		getTimelineMetrics(container)
	const screenRect = container.getBoundingClientRect()
	const sx = clientX - screenRect.left
	const sy = clientY - screenRect.top
	const projected = sx * screenAxisX + sy * screenAxisY

	return projected * layoutPerScreenPx
}

/**
 * Maps a screen drag delta to a layout delta along the timeline axis.
 * Used for panning; respects forced-landscape axis projection.
 *
 * @param container - Timeline container element
 * @param startClientX - Drag start X in viewport coordinates
 * @param startClientY - Drag start Y in viewport coordinates
 * @param currentClientX - Current pointer X in viewport coordinates
 * @param currentClientY - Current pointer Y in viewport coordinates
 * @returns Signed layout-pixel delta along the timeline axis
 */
export function screenToTimelinePanDelta(
	container: HTMLElement,
	startClientX: number,
	startClientY: number,
	currentClientX: number,
	currentClientY: number,
): number {
	const { screenAxisX, screenAxisY, layoutPerScreenPx } =
		getTimelineMetrics(container)
	const dx = currentClientX - startClientX
	const dy = currentClientY - startClientY
	const projected = dx * screenAxisX + dy * screenAxisY

	return projected * layoutPerScreenPx
}

/**
 * Maps a wheel delta to a layout delta along the timeline axis.
 * Used for trackpad / mouse wheel panning; respects forced-landscape axis projection.
 *
 * @param container - Timeline container element
 * @param deltaX - WheelEvent deltaX in screen pixels
 * @param deltaY - WheelEvent deltaY in screen pixels
 * @returns Signed layout-pixel delta along the timeline axis
 */
export function wheelDeltaToTimelinePanDelta(
	container: HTMLElement,
	deltaX: number,
	deltaY: number,
): number {
	const { screenAxisX, screenAxisY, layoutPerScreenPx } =
		getTimelineMetrics(container)
	const projected = deltaX * screenAxisX + deltaY * screenAxisY

	return projected * layoutPerScreenPx
}

/**
 * Maps a wheel delta to the axis perpendicular to the timeline.
 * Used to distinguish zoom gestures from pan gestures under CSS rotation.
 *
 * @param deltaX - WheelEvent deltaX in screen pixels
 * @param deltaY - WheelEvent deltaY in screen pixels
 * @returns Signed screen-pixel delta along the zoom axis
 */
export function wheelDeltaToZoomDelta(deltaX: number, deltaY: number): number {
	const screenAxisX = isForcedLandscape() ? 0 : 1
	const screenAxisY = isForcedLandscape() ? 1 : 0

	return deltaX * screenAxisY + deltaY * screenAxisX
}
