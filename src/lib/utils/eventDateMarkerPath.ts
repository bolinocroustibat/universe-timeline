/** Fraction of marker height used to place Bézier control points along each side. */
export const EVENT_MARKER_CURVE_RATIO = 0.35

export type EventDateMarkerPathParams = {
	topLeft: number
	topRight: number
	bottomLeft: number
	bottomRight: number
	height: number
	curveRatio?: number
}

export type EventDateMarkerBBox = {
	left: number
	width: number
	height: number
}

export function getEventDateMarkerBBox(
	params: Omit<EventDateMarkerPathParams, "curveRatio">,
): EventDateMarkerBBox {
	const { topLeft, topRight, bottomLeft, bottomRight, height } = params
	const left = Math.min(topLeft, bottomLeft)
	const right = Math.max(topRight, bottomRight)

	return {
		left,
		width: Math.max(1, right - left),
		height,
	}
}

/**
 * Builds a closed SVG path for the card-to-anchor connector.
 * Uses standard SVG coordinates (y increases downward; top edge at y=0).
 */
export function buildEventDateMarkerPath(
	params: EventDateMarkerPathParams,
	bboxLeft: number,
): string {
	const {
		topLeft,
		topRight,
		bottomLeft,
		bottomRight,
		height,
		curveRatio = EVENT_MARKER_CURVE_RATIO,
	} = params

	const topLeftLocal = topLeft - bboxLeft
	const topRightLocal = topRight - bboxLeft
	const bottomLeftLocal = bottomLeft - bboxLeft
	const bottomRightLocal = bottomRight - bboxLeft

	const controlNearTop = height * curveRatio
	const controlNearBottom = height * (1 - curveRatio)

	return [
		`M ${bottomLeftLocal} ${height}`,
		`L ${bottomRightLocal} ${height}`,
		`C ${bottomRightLocal} ${controlNearBottom} ${topRightLocal} ${controlNearTop} ${topRightLocal} 0`,
		`L ${topLeftLocal} 0`,
		`C ${topLeftLocal} ${controlNearTop} ${bottomLeftLocal} ${controlNearBottom} ${bottomLeftLocal} ${height}`,
		"Z",
	].join(" ")
}
