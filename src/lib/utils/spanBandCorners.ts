import { SPAN_BAND_CORNER_RADIUS_PX } from "$lib/constants/layout"

export type SpanBandCornerFlags = {
	roundTopLeft?: boolean
	roundTopRight?: boolean
	roundBottomLeft?: boolean
	roundBottomRight?: boolean
	radius?: number
}

/**
 * Builds a CSS `border-radius` value from per-corner flags.
 *
 * Follow-up — geological periods: reuse this helper in
 * [`GeologicalPeriodCard.svelte`](../components/main/content/GeologicalPeriodCard.svelte)
 * with horizontal neighbor flags from the layout, e.g.
 * `getSpanBandBorderRadius({ roundTopLeft: !leftNeighbor, roundBottomLeft: !leftNeighbor, ... })`
 * using `leftGeologicalPeriod` / `rightGeologicalPeriod`.
 * Optionally migrate geo markup to [`SpanBand.svelte`](../components/main/content/SpanBand.svelte) for DRY.
 */
export function getSpanBandBorderRadius(flags: SpanBandCornerFlags): string {
	const radius = flags.radius ?? SPAN_BAND_CORNER_RADIUS_PX

	const topLeft = flags.roundTopLeft ? radius : 0
	const topRight = flags.roundTopRight ? radius : 0
	const bottomRight = flags.roundBottomRight ? radius : 0
	const bottomLeft = flags.roundBottomLeft ? radius : 0

	return `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`
}

/** Top corners rounded only on the highest lane of a vertical stack; bottom stays flat. */
export function getEventPeriodBandCornerFlags(
	lane: number,
	maxLaneInGroup: number,
): SpanBandCornerFlags {
	const isTopLane = lane === maxLaneInGroup

	return {
		roundTopLeft: isTopLane,
		roundTopRight: isTopLane,
		roundBottomLeft: false,
		roundBottomRight: false,
	}
}

export function getSpanBandCornerRadiusStyle(
	flags: SpanBandCornerFlags,
): string {
	return `border-radius: ${getSpanBandBorderRadius(flags)};`
}

/** All corners — matches connector SVG path and period detail panels. */
export function getEventCardCornerRadiusStyle(): string {
	return getSpanBandCornerRadiusStyle({
		roundTopLeft: true,
		roundTopRight: true,
		roundBottomLeft: true,
		roundBottomRight: true,
	})
}

/** Top corners only — matches connector card clip and period band top lane. */
export function getEventCardTopCornerRadiusStyle(): string {
	return getSpanBandCornerRadiusStyle({
		roundTopLeft: true,
		roundTopRight: true,
	})
}
