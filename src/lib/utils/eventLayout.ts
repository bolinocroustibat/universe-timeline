import type { Event } from "$lib/types"
import { EVENT_CARD_MIN_BOTTOM_OFFSET_PX } from "$lib/constants"
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
/** Collapsed card height (padding + 2-line title + date). Measured from rendered EventCard. */
export const EVENT_CARD_HEIGHT = 128
export const EVENT_LANE_PEEK_GAP_PX = 25
export const EVENT_CARD_SCREEN_PADDING = 0
export const EVENT_Z_INDEX_BASE = 980
export const EVENT_Z_INDEX_HOVERED = 999
export const EVENT_Z_INDEX_SELECTED = 1000
/** Default z-index ceiling — keeps selected cards above any deep stack. */
export const EVENT_Z_INDEX_MAX_DEFAULT = EVENT_Z_INDEX_HOVERED - 1

export function computeEventZIndexBase(lane: number): number {
	return Math.min(EVENT_Z_INDEX_BASE + lane, EVENT_Z_INDEX_MAX_DEFAULT)
}

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
}

type EventLayoutDraft = Omit<
	EventLayout,
	"lane" | "bottom" | "markerHeight" | "spanBand" | "zIndexBase"
>

/** Per-group vertical spacing derived from that group's lane count only. */
type GroupVerticalLayout = {
	laneStep: number
	maxLane: number
}

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
	minBottomOffset = EVENT_CARD_MIN_BOTTOM_OFFSET_PX,
): { bottom: number; height: number } {
	if (zoneHeight <= minBottomOffset) {
		return { bottom: minBottomOffset, height: 0 }
	}

	const usableHeight = zoneHeight - minBottomOffset
	const bandCount = maxLane + 1
	const bandHeight = usableHeight / bandCount

	return {
		bottom: minBottomOffset + lane * bandHeight,
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

/**
 * Greedy lane assignment for a single collision group.
 * Events are processed left-to-right; each event reuses the first lane whose
 * previous occupant ends at or before its own left edge.
 */
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

/**
 * Lane step within one collision group. Uses the natural card height + peek gap
 * when the group fits; compresses only when this group's stack exceeds zone height.
 */
function computeLaneStep(
	zoneHeight: number,
	maxLane: number,
	cardHeight: number,
	peekGap: number,
	minBottomOffset = EVENT_CARD_MIN_BOTTOM_OFFSET_PX,
): number {
	const naturalLaneStep = cardHeight + peekGap
	const usableZoneHeight = Math.max(0, zoneHeight - minBottomOffset)

	if (usableZoneHeight <= 0 || maxLane <= 0) {
		return naturalLaneStep
	}

	const requiredHeight = maxLane * naturalLaneStep + cardHeight
	if (requiredHeight <= usableZoneHeight) {
		return naturalLaneStep
	}

	return Math.max(0, (usableZoneHeight - cardHeight) / maxLane)
}

/**
 * Partition event indices into collision groups (connected components).
 *
 * Two events belong to the same group when their horizontal footprints overlap,
 * directly or through a chain (A overlaps B, B overlaps C → one group).
 *
 * Groups are independent for vertical layout: a deep stack on the right must not
 * compress spacing for unrelated cards on the left.
 */
function findCollisionGroups(drafts: EventLayoutDraft[]): number[][] {
	const sortedIndices = drafts
		.map((_, index) => index)
		.sort((a, b) => {
			const draftA = drafts[a]
			const draftB = drafts[b]
			if (!draftA || !draftB) return 0
			return draftA.collisionLeft - draftB.collisionLeft
		})

	const groups: number[][] = []
	let currentGroup: number[] = []
	let groupRight = -Infinity

	for (const index of sortedIndices) {
		const draft = drafts[index]
		if (!draft) continue

		// Strict `<`: touching edges (left === previous right) stay in separate groups,
		// matching assignLanes which treats that as non-overlapping.
		if (currentGroup.length === 0 || draft.collisionLeft < groupRight) {
			currentGroup.push(index)
			groupRight = Math.max(groupRight, draft.collisionRight)
			continue
		}

		groups.push(currentGroup)
		currentGroup = [index]
		groupRight = draft.collisionRight
	}

	if (currentGroup.length > 0) {
		groups.push(currentGroup)
	}

	return groups
}

/** Assign lane numbers within one collision group (each group starts at lane 0). */
function assignLanesForGroup(
	drafts: EventLayoutDraft[],
	groupIndices: number[],
): Map<number, number> {
	const groupDrafts: EventLayoutDraft[] = []
	const validIndices: number[] = []

	for (const index of groupIndices) {
		const draft = drafts[index]
		if (!draft) continue
		groupDrafts.push(draft)
		validIndices.push(index)
	}

	const groupLanes = assignLanes(groupDrafts)
	const laneByIndex = new Map<number, number>()

	validIndices.forEach((index, groupPosition) => {
		laneByIndex.set(index, groupLanes[groupPosition] ?? 0)
	})

	return laneByIndex
}

function computeGroupVerticalLayout(
	groupIndices: number[],
	laneByIndex: Map<number, number>,
	zoneHeight: number,
	cardHeight: number,
	peekGap: number,
): GroupVerticalLayout {
	const maxLane = Math.max(
		0,
		...groupIndices.map((index) => laneByIndex.get(index) ?? 0),
	)

	return {
		maxLane,
		laneStep: computeLaneStep(zoneHeight, maxLane, cardHeight, peekGap),
	}
}

/**
 * Build final layouts in three stages:
 * 1. Horizontal geometry + collision boxes per event
 * 2. Lane assignment partitioned by collision group
 * 3. Vertical spacing computed independently per group
 */
export function buildEventLayouts(
	params: BuildEventLayoutsParams,
): EventLayout[] {
	const {
		events,
		zoneHeight,
		cardHeight = EVENT_CARD_HEIGHT,
		peekGap = EVENT_LANE_PEEK_GAP_PX,
	} = params

	if (events.length === 0 || zoneHeight <= 0) {
		return []
	}

	const drafts = events.map((event) => buildEventLayoutDraft(event, params))
	const collisionGroups = findCollisionGroups(drafts)

	const laneByIndex = new Map<number, number>()
	const groupLayoutByIndex = new Map<number, GroupVerticalLayout>()

	for (const groupIndices of collisionGroups) {
		const groupLanes = assignLanesForGroup(drafts, groupIndices)
		const groupLayout = computeGroupVerticalLayout(
			groupIndices,
			groupLanes,
			zoneHeight,
			cardHeight,
			peekGap,
		)

		for (const index of groupIndices) {
			laneByIndex.set(index, groupLanes.get(index) ?? 0)
			groupLayoutByIndex.set(index, groupLayout)
		}
	}

	return drafts.map((draft, index) => {
		const lane = laneByIndex.get(index) ?? 0
		const { laneStep, maxLane } = groupLayoutByIndex.get(index) ?? {
			laneStep: computeLaneStep(zoneHeight, 0, cardHeight, peekGap),
			maxLane: 0,
		}

		if (draft.tier === "period") {
			const spanBand = getEventSpanBandGeometry(lane, maxLane, zoneHeight)

			return {
				...draft,
				lane,
				bottom: spanBand.bottom,
				markerHeight: 0,
				spanBand,
				zIndexBase: computeEventZIndexBase(lane),
			}
		}

		const bottom =
			EVENT_CARD_MIN_BOTTOM_OFFSET_PX + lane * laneStep
		const connectorHeight = bottom - EVENT_CARD_MIN_BOTTOM_OFFSET_PX

		return {
			...draft,
			lane,
			bottom,
			markerHeight: connectorHeight,
			spanBand: null,
			zIndexBase: computeEventZIndexBase(lane),
		}
	})
}
