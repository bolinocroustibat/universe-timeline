/** Fraction of marker height used to place Bézier control points along each side. */
export const EVENT_MARKER_CURVE_RATIO = 0.35

/** Top corner radius for connector cards (`rounded-t-xl`). */
export const EVENT_CONNECTOR_CARD_CORNER_RADIUS = 12

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

export type EventConnectorPathParams = EventDateMarkerPathParams & {
	cardHeight: number
	cornerRadius?: number
}

export function getEventConnectorBBox(
	params: Omit<EventConnectorPathParams, "curveRatio" | "cornerRadius">,
): EventDateMarkerBBox {
	const markerBBox = getEventDateMarkerBBox(params)

	return {
		left: markerBBox.left,
		width: markerBBox.width,
		height: params.height + params.cardHeight,
	}
}

/**
 * Builds a closed SVG path for the unified connector card (rounded-top card + funnel).
 * Coordinates: y=0 at card top, y=cardHeight+markerHeight at zone floor.
 */
export function buildEventConnectorPath(
	params: EventConnectorPathParams,
	bboxLeft: number,
): string {
	const {
		topLeft,
		topRight,
		bottomLeft,
		bottomRight,
		height: markerHeight,
		cardHeight,
		curveRatio = EVENT_MARKER_CURVE_RATIO,
		cornerRadius = EVENT_CONNECTOR_CARD_CORNER_RADIUS,
	} = params

	const topLeftLocal = topLeft - bboxLeft
	const topRightLocal = topRight - bboxLeft
	const bottomLeftLocal = bottomLeft - bboxLeft
	const bottomRightLocal = bottomRight - bboxLeft

	const connectorTopY = cardHeight
	const connectorBottomY = cardHeight + markerHeight
	const radius = Math.min(
		cornerRadius,
		cardHeight / 2,
		(topRightLocal - topLeftLocal) / 2,
	)

	const controlNearTop = markerHeight * curveRatio
	const controlNearBottom = markerHeight * (1 - curveRatio)

	return [
		`M ${bottomLeftLocal} ${connectorBottomY}`,
		`L ${bottomRightLocal} ${connectorBottomY}`,
		`C ${bottomRightLocal} ${connectorBottomY - controlNearBottom} ${topRightLocal} ${connectorTopY + controlNearTop} ${topRightLocal} ${connectorTopY}`,
		`L ${topRightLocal} ${radius}`,
		`A ${radius} ${radius} 0 0 0 ${topRightLocal - radius} 0`,
		`L ${topLeftLocal + radius} 0`,
		`A ${radius} ${radius} 0 0 0 ${topLeftLocal} ${radius}`,
		`L ${topLeftLocal} ${connectorTopY}`,
		`C ${topLeftLocal} ${connectorTopY + controlNearTop} ${bottomLeftLocal} ${connectorBottomY - controlNearBottom} ${bottomLeftLocal} ${connectorBottomY}`,
		"Z",
	].join(" ")
}
