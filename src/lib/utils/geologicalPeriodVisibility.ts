import { GEOLOGICAL_PERIODS_MAX_VIEWPORT_SPAN_YEARS } from "$lib/constants/geologicalPeriods"

/** Earliest year covered by geological period data (Hadean start). */
export const GEOLOGICAL_TIME_START_YEAR = -4_567_000_000

/** Latest year covered by geological period data (present). */
export const GEOLOGICAL_TIME_END_YEAR = 2_015

/**
 * Viewport span thresholds for the deepest visible hierarchy level.
 * When the span is above a threshold, only depths up to the paired level are shown.
 */
const DEPTH_BY_VIEWPORT_SPAN: readonly {
	maxSpanYears: number
	maxDepth: number
}[] = [
	{ maxSpanYears: 4_000_000_000, maxDepth: 0 },
	{ maxSpanYears: 500_000_000, maxDepth: 0 },
	{ maxSpanYears: 50_000_000, maxDepth: 1 },
	{ maxSpanYears: 5_000_000, maxDepth: 2 },
	{ maxSpanYears: 0, maxDepth: 3 },
]

export function viewportOverlapsGeologicalTime(
	leftEdgeYear: number,
	rightEdgeYear: number,
): boolean {
	return (
		rightEdgeYear >= GEOLOGICAL_TIME_START_YEAR &&
		leftEdgeYear <= GEOLOGICAL_TIME_END_YEAR
	)
}

/**
 * Returns the deepest geological-period hierarchy level to render, or `null` when
 * periods should be hidden (cosmic zoom or viewport outside Earth history).
 */
export function getMaxGeologicalPeriodDepth(
	viewportYearSpan: number,
	leftEdgeYear: number,
	rightEdgeYear: number,
): number | null {
	if (viewportYearSpan > GEOLOGICAL_PERIODS_MAX_VIEWPORT_SPAN_YEARS) {
		return null
	}

	if (!viewportOverlapsGeologicalTime(leftEdgeYear, rightEdgeYear)) {
		return null
	}

	for (const threshold of DEPTH_BY_VIEWPORT_SPAN) {
		if (viewportYearSpan > threshold.maxSpanYears) {
			return threshold.maxDepth
		}
	}

	return 3
}
