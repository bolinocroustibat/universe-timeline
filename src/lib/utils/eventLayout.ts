import type { Event } from "$lib/types"
import {
	getEventDateRange,
	getEventSpanWidthPx,
	hasEventDateUncertainty,
} from "$lib/utils/eventSpan"
import {
	getClampedSpanPosition,
	snapLayoutX,
	yearToLayoutX,
} from "$lib/utils/spanPosition"

export const EVENT_CARD_WIDTH = 200
export const EVENT_CARD_HEIGHT = 72
export const EVENT_LANE_PEEK_GAP_PX = 25
export const EVENT_MARKER_EXTENSION_PX = 12
export const EVENT_CARD_SCREEN_PADDING = 0
export const EVENT_Z_INDEX_BASE = 980

export type EventDisplayTier = "point" | "range" | "period"

export type EventLayout = {
	event: Event
	tier: EventDisplayTier
	anchor: { x: number; width: number; centerX: number }
	dateMarkerX: number
	card: { x: number; width: number }
	collisionLeft: number
	collisionRight: number
	lane: number
	bottom: number
	markerHeight: number
	spanBand: { bottom: number; height: number } | null
	showEdgeBlur: boolean
	zIndexBase: number
}

type BuildEventLayoutsParams = {
	events: Event[]
	leftEdgeYear: number
	rightEdgeYear: number
	yearsPerPixel: number
	viewportWidth: number
	zoneHeight: number
	cardWidth?: number
	cardHeight?: number
	peekGap?: number
	markerExtension?: number
}

type EventLayoutDraft = Omit<
	EventLayout,
	"lane" | "bottom" | "markerHeight" | "spanBand" | "zIndexBase"
>

export function getEventCardXPosition({
	centerX,
	viewportWidth,
	cardWidth = EVENT_CARD_WIDTH,
	screenPadding = EVENT_CARD_SCREEN_PADDING,
}: {
	centerX: number
	viewportWidth: number
	cardWidth?: number
	screenPadding?: number
}): number {
	let cardX = centerX - cardWidth / 2

	if (cardX < screenPadding) {
		cardX = screenPadding
	}

	if (cardX + cardWidth > viewportWidth - screenPadding) {
		cardX = viewportWidth - cardWidth - screenPadding
	}

	return cardX
}

export function getEventSpanBandGeometry(
	lane: number,
	maxLane: number,
	zoneHeight: number,
): { bottom: number; height: number } {
	if (zoneHeight <= 0) {
		return { bottom: 0, height: 0 }
	}

	const bandCount = maxLane + 1
	const bandHeight = zoneHeight / bandCount

	return {
		bottom: lane * bandHeight,
		height: bandHeight,
	}
}

function resolveEventDisplayTier(
	spanWidthPx: number,
	hasUncertainty: boolean,
	cardWidth: number,
): EventDisplayTier {
	if (!hasUncertainty || spanWidthPx < 1) {
		return "point"
	}

	if (spanWidthPx < cardWidth) {
		return "range"
	}

	return "period"
}

function buildEventLayoutDraft(
	event: Event,
	params: BuildEventLayoutsParams,
): EventLayoutDraft {
	const {
		leftEdgeYear,
		rightEdgeYear,
		yearsPerPixel,
		viewportWidth,
		cardWidth = EVENT_CARD_WIDTH,
	} = params

	const range = getEventDateRange(event)
	const spanWidthPx = getEventSpanWidthPx(range, yearsPerPixel)
	const hasUncertainty = hasEventDateUncertainty(event)
	const tier = resolveEventDisplayTier(spanWidthPx, hasUncertainty, cardWidth)

	const clampedSpan = getClampedSpanPosition({
		start: range.start,
		end: range.end,
		leftEdgeYear,
		rightEdgeYear,
		yearsPerPixel,
	})

	const dateMarkerX = yearToLayoutX(range.center, leftEdgeYear, yearsPerPixel)

	let anchor: EventLayout["anchor"]

	if (tier === "point") {
		const x = snapLayoutX(dateMarkerX)
		anchor = {
			x,
			width: 1,
			centerX: x,
		}
	} else if (tier === "range") {
		const startX = clampedSpan.startX
		const endX = clampedSpan.endX
		const x = Math.min(startX, endX)
		const width = Math.max(1, Math.abs(endX - startX))
		anchor = {
			x,
			width,
			centerX: (startX + endX) / 2,
		}
	} else {
		anchor = {
			x: clampedSpan.x,
			width: clampedSpan.width,
			centerX: clampedSpan.centerX,
		}
	}

	const cardX = getEventCardXPosition({
		centerX: dateMarkerX,
		viewportWidth,
		cardWidth,
	})

	const card = { x: cardX, width: cardWidth }
	const collisionLeft =
		tier === "period" ? anchor.x : Math.min(anchor.x, card.x)
	const collisionRight =
		tier === "period"
			? anchor.x + anchor.width
			: Math.max(anchor.x + anchor.width, card.x + card.width)

	return {
		event,
		tier,
		anchor,
		dateMarkerX,
		card,
		collisionLeft,
		collisionRight,
		showEdgeBlur: tier === "period",
	}
}

function assignLanes(drafts: EventLayoutDraft[]): number[] {
	if (drafts.length === 0) {
		return []
	}

	const sorted = drafts
		.map((draft, index) => ({ draft, index }))
		.sort((a, b) => a.draft.collisionLeft - b.draft.collisionLeft)

	const laneRights: number[] = []
	const laneByIndex = new Map<number, number>()

	for (const { draft, index } of sorted) {
		let assignedLane = -1

		for (let lane = 0; lane < laneRights.length; lane++) {
			if (draft.collisionLeft >= laneRights[lane]) {
				assignedLane = lane
				laneRights[lane] = draft.collisionRight
				break
			}
		}

		if (assignedLane === -1) {
			assignedLane = laneRights.length
			laneRights.push(draft.collisionRight)
		}

		laneByIndex.set(index, assignedLane)
	}

	return drafts.map((_, index) => laneByIndex.get(index) ?? 0)
}

function computeLaneStep(
	zoneHeight: number,
	maxLane: number,
	cardHeight: number,
	peekGap: number,
): number {
	const naturalLaneStep = cardHeight + peekGap

	if (zoneHeight <= 0 || maxLane <= 0) {
		return naturalLaneStep
	}

	const requiredHeight = maxLane * naturalLaneStep + cardHeight
	if (requiredHeight <= zoneHeight) {
		return naturalLaneStep
	}

	return Math.max(0, (zoneHeight - cardHeight) / maxLane)
}

export function buildEventLayouts(
	params: BuildEventLayoutsParams,
): EventLayout[] {
	const {
		events,
		zoneHeight,
		cardHeight = EVENT_CARD_HEIGHT,
		peekGap = EVENT_LANE_PEEK_GAP_PX,
		markerExtension = EVENT_MARKER_EXTENSION_PX,
	} = params

	if (events.length === 0 || zoneHeight <= 0) {
		return []
	}

	const drafts = events.map((event) => buildEventLayoutDraft(event, params))

	const lanes = assignLanes(drafts)
	const maxLane = Math.max(0, ...lanes)
	const laneStep = computeLaneStep(zoneHeight, maxLane, cardHeight, peekGap)

	return drafts.map((draft, index) => {
		const lane = lanes[index] ?? 0

		if (draft.tier === "period") {
			const spanBand = getEventSpanBandGeometry(lane, maxLane, zoneHeight)

			return {
				...draft,
				lane,
				bottom: spanBand.bottom,
				markerHeight: 0,
				spanBand,
				zIndexBase: EVENT_Z_INDEX_BASE + lane,
			}
		}

		const bottom = lane * laneStep
		const markerHeight = bottom + markerExtension

		return {
			...draft,
			lane,
			bottom,
			markerHeight,
			spanBand: null,
			zIndexBase: EVENT_Z_INDEX_BASE + lane,
		}
	})
}
