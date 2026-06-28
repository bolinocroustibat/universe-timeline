import { GEOLOGICAL_PERIOD_CHILD_HEIGHT_RATIO } from "$lib/constants"
import type { GeologicalPeriod } from "$lib/types"
import { getClampedSpanPosition } from "$lib/utils/spanPosition"

export type GeologicalPeriodIndex = {
	byId: Map<number, GeologicalPeriod>
	depthById: Map<number, number>
}

export type GeologicalPeriodWithLayout = GeologicalPeriod & {
	depth: number
	leftGeologicalPeriod: GeologicalPeriod | null
	rightGeologicalPeriod: GeologicalPeriod | null
	hasVisibleDescendants: boolean
}

export type GeologicalPeriodCardGeometry = {
	height: number
	bottom: number
	zIndex: number
}

const Z_INDEX_SELECTED = 1000
const Z_INDEX_BASE = 100

export const GEOLOGICAL_PERIOD_SELECTED_SCALE = 1.07

export type GeologicalPeriodSelectionTransform = {
	scaleX: number
	scaleY: number
	translateY: number
}

export function getGeologicalPeriodSelectionTransform({
	zoneHeight,
	cardHeight,
	bottom,
	isSelected,
}: {
	zoneHeight: number
	cardHeight: number
	bottom: number
	isSelected: boolean
}): GeologicalPeriodSelectionTransform {
	if (!isSelected || zoneHeight <= 0 || cardHeight <= 0) {
		return { scaleX: 1, scaleY: 1, translateY: 0 }
	}

	const topGap = zoneHeight - bottom - cardHeight
	const bottomGap = bottom

	if (topGap <= 0 && bottomGap <= 0) {
		return {
			scaleX: GEOLOGICAL_PERIOD_SELECTED_SCALE,
			scaleY: 1,
			translateY: 0,
		}
	}

	const overflow = (cardHeight * (GEOLOGICAL_PERIOD_SELECTED_SCALE - 1)) / 2
	let translateY = 0

	if (topGap < overflow) {
		translateY += overflow - topGap
	}
	if (bottomGap < overflow) {
		translateY -= overflow - bottomGap
	}

	return {
		scaleX: GEOLOGICAL_PERIOD_SELECTED_SCALE,
		scaleY: GEOLOGICAL_PERIOD_SELECTED_SCALE,
		translateY,
	}
}

export function getGeologicalPeriodDepth(
	geologicalPeriod: GeologicalPeriod,
	byId: Map<number, GeologicalPeriod>,
): number {
	let depth = 0
	let current: GeologicalPeriod | undefined = geologicalPeriod
	const visited = new Set<number>()

	while (current.parentPeriodId != null) {
		if (visited.has(current.id)) break
		visited.add(current.id)

		const parent = byId.get(current.parentPeriodId)
		if (!parent) break

		depth++
		current = parent
	}

	return depth
}

export function buildGeologicalPeriodIndex(
	geologicalPeriods: GeologicalPeriod[],
): GeologicalPeriodIndex {
	const byId = new Map(
		geologicalPeriods.map((geologicalPeriod) => [
			geologicalPeriod.id,
			geologicalPeriod,
		]),
	)
	const depthById = new Map<number, number>()

	for (const geologicalPeriod of geologicalPeriods) {
		depthById.set(
			geologicalPeriod.id,
			getGeologicalPeriodDepth(geologicalPeriod, byId),
		)
	}

	return { byId, depthById }
}

export function isGeologicalPeriodVisible(
	geologicalPeriod: GeologicalPeriod,
	leftEdgeYear: number,
	rightEdgeYear: number,
): boolean {
	return (
		geologicalPeriod.end >= leftEdgeYear &&
		geologicalPeriod.start <= rightEdgeYear
	)
}

export function isDescendantOf(
	geologicalPeriod: GeologicalPeriod,
	ancestorId: number,
	byId: Map<number, GeologicalPeriod>,
): boolean {
	let current: GeologicalPeriod | undefined = geologicalPeriod
	const visited = new Set<number>()

	while (current.parentPeriodId != null) {
		if (visited.has(current.id)) break
		visited.add(current.id)

		if (current.parentPeriodId === ancestorId) return true

		current = byId.get(current.parentPeriodId)
		if (!current) break
	}

	return false
}

export function hasVisibleDescendants(
	geologicalPeriodId: number,
	visibleGeologicalPeriods: GeologicalPeriod[],
	byId: Map<number, GeologicalPeriod>,
): boolean {
	return visibleGeologicalPeriods.some((geologicalPeriod) =>
		isDescendantOf(geologicalPeriod, geologicalPeriodId, byId),
	)
}

export function getNormalGeologicalPeriodGeometry(
	depth: number,
	zoneHeight: number,
): Pick<GeologicalPeriodCardGeometry, "height" | "bottom"> {
	if (zoneHeight <= 0) {
		return { height: 0, bottom: 0 }
	}

	if (depth === 0) {
		return { height: zoneHeight, bottom: 0 }
	}

	const height = zoneHeight * GEOLOGICAL_PERIOD_CHILD_HEIGHT_RATIO ** depth
	return { height, bottom: zoneHeight - height }
}

export function getGeologicalPeriodCardGeometry({
	depth,
	zoneHeight,
	isSelected,
	hasVisibleDescendants: hasDescendants,
}: {
	depth: number
	zoneHeight: number
	isSelected: boolean
	hasVisibleDescendants: boolean
}): GeologicalPeriodCardGeometry {
	const { height: nominalHeight, bottom } = getNormalGeologicalPeriodGeometry(
		depth,
		zoneHeight,
	)
	const height =
		hasDescendants && zoneHeight > 0
			? nominalHeight * GEOLOGICAL_PERIOD_CHILD_HEIGHT_RATIO
			: nominalHeight

	return {
		height,
		bottom,
		zIndex: isSelected ? Z_INDEX_SELECTED : Z_INDEX_BASE + depth,
	}
}

export function getAdjacentGeologicalPeriodsInBand(
	geologicalPeriod: GeologicalPeriod,
	bandGeologicalPeriods: GeologicalPeriod[],
): { left: GeologicalPeriod | null; right: GeologicalPeriod | null } {
	const sorted = [...bandGeologicalPeriods].sort((a, b) => a.start - b.start)
	const index = sorted.findIndex(
		(candidate) => candidate.id === geologicalPeriod.id,
	)

	if (index === -1) {
		return { left: null, right: null }
	}

	return {
		left: index > 0 ? sorted[index - 1] : null,
		right: index < sorted.length - 1 ? sorted[index + 1] : null,
	}
}

export type GeologicalPeriodPopoverPlacement = "above" | "below"

export type GeologicalPeriodPopoverLayout = {
	anchorX: number
	anchorY: number
	popoverLeft: number
	popoverTop: number
	placement: GeologicalPeriodPopoverPlacement
	arrowOffsetX: number
	popoverWidth: number
}

const POPOVER_MAX_WIDTH = 280
const POPOVER_SCREEN_PADDING = 16
const POPOVER_GAP = 8
const POPOVER_ESTIMATED_HEIGHT = 120

export function getGeologicalPeriodHorizontalPosition({
	start,
	end,
	leftEdgeYear,
	rightEdgeYear,
	yearsPerPixel,
}: {
	start: number
	end: number
	leftEdgeYear: number
	rightEdgeYear: number
	yearsPerPixel: number
}): { x: number; width: number; centerX: number } {
	const { x, width, centerX } = getClampedSpanPosition({
		start,
		end,
		leftEdgeYear,
		rightEdgeYear,
		yearsPerPixel,
	})

	return { x, width, centerX }
}

function clampPopoverCenterX(
	centerX: number,
	popoverWidth: number,
	viewportWidth: number,
): number {
	const halfWidth = popoverWidth / 2
	const minCenter = POPOVER_SCREEN_PADDING + halfWidth
	const maxCenter = viewportWidth - POPOVER_SCREEN_PADDING - halfWidth

	if (maxCenter <= minCenter) {
		return viewportWidth / 2
	}

	return Math.min(Math.max(centerX, minCenter), maxCenter)
}

export function getGeologicalPeriodPopoverLayout({
	layout,
	zoneHeight,
	leftEdgeYear,
	rightEdgeYear,
	yearsPerPixel,
	viewportWidth,
	contentHeight,
	isSelected,
}: {
	layout: GeologicalPeriodWithLayout
	zoneHeight: number
	leftEdgeYear: number
	rightEdgeYear: number
	yearsPerPixel: number
	viewportWidth: number
	contentHeight: number
	isSelected: boolean
}): GeologicalPeriodPopoverLayout | null {
	if (
		zoneHeight <= 0 ||
		contentHeight <= 0 ||
		viewportWidth <= 0 ||
		!isGeologicalPeriodVisible(layout, leftEdgeYear, rightEdgeYear)
	) {
		return null
	}

	const { centerX: anchorX } = getGeologicalPeriodHorizontalPosition({
		start: layout.start,
		end: layout.end,
		leftEdgeYear,
		rightEdgeYear,
		yearsPerPixel,
	})

	const cardGeometry = getGeologicalPeriodCardGeometry({
		depth: layout.depth,
		zoneHeight,
		isSelected,
		hasVisibleDescendants: layout.hasVisibleDescendants,
	})

	if (cardGeometry.height <= 0) {
		return null
	}

	const selectionTransform = getGeologicalPeriodSelectionTransform({
		zoneHeight,
		cardHeight: cardGeometry.height,
		bottom: cardGeometry.bottom,
		isSelected,
	})

	const outerTop = zoneHeight - cardGeometry.bottom - cardGeometry.height
	const visualTop =
		outerTop +
		(cardGeometry.height * (1 - selectionTransform.scaleY)) / 2 +
		selectionTransform.translateY
	const visualBottom =
		visualTop + cardGeometry.height * selectionTransform.scaleY

	const spaceAbove = visualTop
	const placement: GeologicalPeriodPopoverPlacement =
		spaceAbove >= POPOVER_ESTIMATED_HEIGHT + POPOVER_GAP ? "above" : "below"

	const anchorY = placement === "above" ? visualTop : visualBottom
	const popoverWidth = Math.min(
		POPOVER_MAX_WIDTH,
		Math.max(0, viewportWidth - POPOVER_SCREEN_PADDING * 2),
	)
	const popoverLeft = clampPopoverCenterX(anchorX, popoverWidth, viewportWidth)
	const popoverTop =
		placement === "above" ? anchorY - POPOVER_GAP : anchorY + POPOVER_GAP

	return {
		anchorX,
		anchorY,
		popoverLeft,
		popoverTop,
		placement,
		arrowOffsetX: anchorX - popoverLeft,
		popoverWidth,
	}
}

export function buildVisibleGeologicalPeriodLayouts(
	geologicalPeriods: GeologicalPeriod[],
	leftEdgeYear: number,
	rightEdgeYear: number,
): GeologicalPeriodWithLayout[] {
	const { byId, depthById } = buildGeologicalPeriodIndex(geologicalPeriods)
	const visible = geologicalPeriods.filter((geologicalPeriod) =>
		isGeologicalPeriodVisible(geologicalPeriod, leftEdgeYear, rightEdgeYear),
	)

	const byDepth = new Map<number, GeologicalPeriod[]>()
	for (const geologicalPeriod of visible) {
		const depth = depthById.get(geologicalPeriod.id) ?? 0
		const band = byDepth.get(depth) ?? []
		band.push(geologicalPeriod)
		byDepth.set(depth, band)
	}

	return visible.map((geologicalPeriod) => {
		const depth = depthById.get(geologicalPeriod.id) ?? 0
		const bandGeologicalPeriods = byDepth.get(depth) ?? []
		const { left, right } = getAdjacentGeologicalPeriodsInBand(
			geologicalPeriod,
			bandGeologicalPeriods,
		)

		return {
			...geologicalPeriod,
			depth,
			leftGeologicalPeriod: left,
			rightGeologicalPeriod: right,
			hasVisibleDescendants: hasVisibleDescendants(
				geologicalPeriod.id,
				visible,
				byId,
			),
		}
	})
}
