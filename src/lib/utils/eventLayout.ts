import { EVENT_CARD_MIN_BOTTOM_OFFSET_PX } from "#lib/constants/index.js"
import type { Event } from "#lib/types/index.js"
import {
	getEventDateRange,
	getEventSpanWidthPx,
	hasEventDateUncertainty,
} from "#lib/utils/eventSpan.js"
import {
	getClampedSpanPosition,
	snapLayoutX,
	yearToLayoutX,
} from "#lib/utils/spanPosition.js"

export const EVENT_CARD_WIDTH = 200
/** Collapsed card height (padding + 2-line title + date). Measured from rendered EventCard. */
export const EVENT_CARD_HEIGHT = 128
export const EVENT_LANE_PEEK_GAP_PX = 25
/** Funnel height under a lane-0 card, so the date anchor stays visible on the scale. */
export const EVENT_CONNECTOR_MIN_HEIGHT_PX = 80
export const EVENT_CARD_SCREEN_PADDING = 0
export const EVENT_Z_INDEX_BASE = 980
export const EVENT_Z_INDEX_HOVERED = 999
export const EVENT_Z_INDEX_SELECTED = 1000
/** Default z-index ceiling — keeps selected cards above any deep stack. */
export const EVENT_Z_INDEX_MAX_DEFAULT = EVENT_Z_INDEX_HOVERED - 1

export function computeEventZIndexBase(lane: number): number {
	return Math.min(EVENT_Z_INDEX_BASE + lane, EVENT_Z_INDEX_MAX_DEFAULT)
}

export type EventDisplayTier = "point" | "range"

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
	"lane" | "bottom" | "markerHeight" | "zIndexBase"
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

function resolveEventDisplayTier(
	spanWidthPx: number,
	hasUncertainty: boolean,
): EventDisplayTier {
	if (!hasUncertainty || spanWidthPx < 1) {
		return "point"
	}

	return "range"
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
	const tier = resolveEventDisplayTier(spanWidthPx, hasUncertainty)

	const clampedSpan = getClampedSpanPosition({
		start: range.start,
		end: range.end,
		leftEdgeYear,
		rightEdgeYear,
		yearsPerPixel,
	})

	const dateMarkerX = yearToLayoutX(range.center, leftEdgeYear, yearsPerPixel)
	const snappedDateX = snapLayoutX(dateMarkerX)

	const anchor: EventLayout["anchor"] =
		tier === "point"
			? {
					x: snappedDateX,
					width: 1,
					centerX: snappedDateX,
				}
			: {
					x: clampedSpan.x,
					width: Math.max(1, clampedSpan.width),
					centerX: clampedSpan.centerX,
				}

	const cardX = getEventCardXPosition({
		centerX: dateMarkerX,
		viewportWidth,
		cardWidth,
	})

	const cardSpansEvent = tier === "range" && anchor.width > cardWidth
	const card = cardSpansEvent
		? { x: anchor.x, width: anchor.width }
		: { x: cardX, width: cardWidth }

	return {
		event,
		tier,
		anchor,
		dateMarkerX,
		card,
		collisionLeft: Math.min(anchor.x, card.x),
		collisionRight: Math.max(anchor.x + anchor.width, card.x + card.width),
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
	minConnectorHeight = EVENT_CONNECTOR_MIN_HEIGHT_PX,
): number {
	const naturalLaneStep = cardHeight + peekGap
	const usableZoneHeight = Math.max(
		0,
		zoneHeight - minBottomOffset - minConnectorHeight,
	)

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

function eventUsesFunnel(draft: EventLayoutDraft): boolean {
	return draft.card.width <= EVENT_CARD_WIDTH
}

function computeGroupLaneStep(
	groupIndices: number[],
	laneByIndex: Map<number, number>,
	zoneHeight: number,
	cardHeight: number,
	peekGap: number,
	minConnectorHeight: number,
): number {
	const maxLane = Math.max(
		0,
		...groupIndices.map((index) => laneByIndex.get(index) ?? 0),
	)

	return computeLaneStep(
		zoneHeight,
		maxLane,
		cardHeight,
		peekGap,
		EVENT_CARD_MIN_BOTTOM_OFFSET_PX,
		minConnectorHeight,
	)
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
	const laneStepByIndex = new Map<number, number>()

	for (const groupIndices of collisionGroups) {
		const groupLanes = assignLanesForGroup(drafts, groupIndices)
		const hasFunnel = groupIndices.some((index) => {
			const draft = drafts[index]
			return draft != null && eventUsesFunnel(draft)
		})
		const laneStep = computeGroupLaneStep(
			groupIndices,
			groupLanes,
			zoneHeight,
			cardHeight,
			peekGap,
			hasFunnel ? EVENT_CONNECTOR_MIN_HEIGHT_PX : 0,
		)

		for (const index of groupIndices) {
			laneByIndex.set(index, groupLanes.get(index) ?? 0)
			laneStepByIndex.set(index, laneStep)
		}
	}

	return drafts.map((draft, index) => {
		const lane = laneByIndex.get(index) ?? 0
		const laneStep =
			laneStepByIndex.get(index) ??
			computeLaneStep(zoneHeight, 0, cardHeight, peekGap)
		const usesFunnel = eventUsesFunnel(draft)
		const markerHeight =
			(usesFunnel ? EVENT_CONNECTOR_MIN_HEIGHT_PX : 0) + lane * laneStep
		const bottom = EVENT_CARD_MIN_BOTTOM_OFFSET_PX + markerHeight

		return {
			...draft,
			lane,
			bottom,
			markerHeight,
			zIndexBase: computeEventZIndexBase(lane),
		}
	})
}
