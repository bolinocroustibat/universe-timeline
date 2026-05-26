import { isForcedLandscape } from "$lib/constants/display"

interface TimelineMetrics {
	screenAxisX: number
	screenAxisY: number
	screenSpan: number
	layoutPerScreenPx: number
}

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
