import { PERIOD_BAND_COUNT } from "$lib/constants"
import type { Period } from "$lib/types"

export type PeriodIndex = {
	byId: Map<number, Period>
	depthById: Map<number, number>
}

export type PeriodWithLayout = Period & {
	depth: number
	leftPeriod: Period | null
	rightPeriod: Period | null
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
	const { depthById } = buildPeriodIndex(periods)
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
		}
	})
}

export function getBandHeight(contentHeight: number): number {
	if (contentHeight <= 0) return 0
	return contentHeight / PERIOD_BAND_COUNT
}
