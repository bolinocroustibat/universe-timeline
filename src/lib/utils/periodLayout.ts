import { PERIOD_CHILD_HEIGHT_RATIO } from "$lib/constants"
import type { Period } from "$lib/types"

export type PeriodIndex = {
	byId: Map<number, Period>
	depthById: Map<number, number>
}

export type PeriodWithLayout = Period & {
	depth: number
	leftPeriod: Period | null
	rightPeriod: Period | null
	hasVisibleDescendants: boolean
}

export type PeriodCardGeometry = {
	height: number
	bottom: number
	zIndex: number
}

const Z_INDEX_SELECTED = 1000
const Z_INDEX_BASE = 100

export const PERIOD_SELECTED_SCALE = 1.07

export type PeriodSelectionTransform = {
	scaleX: number
	scaleY: number
	translateY: number
}

export function getPeriodSelectionTransform({
	zoneHeight,
	cardHeight,
	bottom,
	isSelected,
}: {
	zoneHeight: number
	cardHeight: number
	bottom: number
	isSelected: boolean
}): PeriodSelectionTransform {
	if (!isSelected || zoneHeight <= 0 || cardHeight <= 0) {
		return { scaleX: 1, scaleY: 1, translateY: 0 }
	}

	const topGap = zoneHeight - bottom - cardHeight
	const bottomGap = bottom

	if (topGap <= 0 && bottomGap <= 0) {
		return {
			scaleX: PERIOD_SELECTED_SCALE,
			scaleY: 1,
			translateY: 0,
		}
	}

	const overflow = (cardHeight * (PERIOD_SELECTED_SCALE - 1)) / 2
	let translateY = 0

	if (topGap < overflow) {
		translateY += overflow - topGap
	}
	if (bottomGap < overflow) {
		translateY -= overflow - bottomGap
	}

	return {
		scaleX: PERIOD_SELECTED_SCALE,
		scaleY: PERIOD_SELECTED_SCALE,
		translateY,
	}
}

export function getPeriodDepth(
	period: Period,
	byId: Map<number, Period>,
): number {
	let depth = 0
	let current: Period | undefined = period
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

export function buildPeriodIndex(periods: Period[]): PeriodIndex {
	const byId = new Map(periods.map((period) => [period.id, period]))
	const depthById = new Map<number, number>()

	for (const period of periods) {
		depthById.set(period.id, getPeriodDepth(period, byId))
	}

	return { byId, depthById }
}

export function isPeriodVisible(
	period: Period,
	leftEdgeYear: number,
	rightEdgeYear: number,
): boolean {
	return period.end >= leftEdgeYear && period.start <= rightEdgeYear
}

export function isDescendantOf(
	period: Period,
	ancestorId: number,
	byId: Map<number, Period>,
): boolean {
	let current: Period | undefined = period
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
	periodId: number,
	visiblePeriods: Period[],
	byId: Map<number, Period>,
): boolean {
	return visiblePeriods.some((period) => isDescendantOf(period, periodId, byId))
}

export function getNormalPeriodGeometry(
	depth: number,
	zoneHeight: number,
): Pick<PeriodCardGeometry, "height" | "bottom"> {
	if (zoneHeight <= 0) {
		return { height: 0, bottom: 0 }
	}

	if (depth === 0) {
		return { height: zoneHeight, bottom: 0 }
	}

	const height = zoneHeight * PERIOD_CHILD_HEIGHT_RATIO ** depth
	return { height, bottom: zoneHeight - height }
}

export function getPeriodCardGeometry({
	depth,
	zoneHeight,
	isSelected,
	hasVisibleDescendants: hasDescendants,
}: {
	depth: number
	zoneHeight: number
	isSelected: boolean
	hasVisibleDescendants: boolean
}): PeriodCardGeometry {
	const { height: nominalHeight, bottom } = getNormalPeriodGeometry(
		depth,
		zoneHeight,
	)
	const height =
		hasDescendants && zoneHeight > 0
			? nominalHeight * PERIOD_CHILD_HEIGHT_RATIO
			: nominalHeight

	return {
		height,
		bottom,
		zIndex: isSelected ? Z_INDEX_SELECTED : Z_INDEX_BASE + depth,
	}
}

export function getAdjacentPeriodsInBand(
	period: Period,
	bandPeriods: Period[],
): { left: Period | null; right: Period | null } {
	const sorted = [...bandPeriods].sort((a, b) => a.start - b.start)
	const index = sorted.findIndex((candidate) => candidate.id === period.id)

	if (index === -1) {
		return { left: null, right: null }
	}

	return {
		left: index > 0 ? sorted[index - 1] : null,
		right: index < sorted.length - 1 ? sorted[index + 1] : null,
	}
}

export function buildVisiblePeriodLayouts(
	periods: Period[],
	leftEdgeYear: number,
	rightEdgeYear: number,
): PeriodWithLayout[] {
	const { byId, depthById } = buildPeriodIndex(periods)
	const visible = periods.filter((period) =>
		isPeriodVisible(period, leftEdgeYear, rightEdgeYear),
	)

	const byDepth = new Map<number, Period[]>()
	for (const period of visible) {
		const depth = depthById.get(period.id) ?? 0
		const band = byDepth.get(depth) ?? []
		band.push(period)
		byDepth.set(depth, band)
	}

	return visible.map((period) => {
		const depth = depthById.get(period.id) ?? 0
		const bandPeriods = byDepth.get(depth) ?? []
		const { left, right } = getAdjacentPeriodsInBand(period, bandPeriods)

		return {
			...period,
			depth,
			leftPeriod: left,
			rightPeriod: right,
			hasVisibleDescendants: hasVisibleDescendants(period.id, visible, byId),
		}
	})
}
