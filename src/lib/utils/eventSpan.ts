import type { Event } from "$lib/types"

export type EventDateRange = {
	start: number
	end: number
	center: number
}

export function getEventDateRange(event: Event): EventDateRange {
	const uncertainty = event.dateUncertainty

	if (uncertainty == null || uncertainty <= 0) {
		return {
			start: event.date,
			end: event.date,
			center: event.date,
		}
	}

	const halfUncertainty = uncertainty / 2

	return {
		start: event.date - halfUncertainty,
		end: event.date + halfUncertainty,
		center: event.date,
	}
}

export function isEventRangeVisible(
	range: EventDateRange,
	leftEdgeYear: number,
	rightEdgeYear: number,
): boolean {
	return range.end >= leftEdgeYear && range.start <= rightEdgeYear
}

export function getEventSpanWidthPx(
	range: EventDateRange,
	yearsPerPixel: number,
): number {
	if (yearsPerPixel <= 0) {
		return 0
	}

	return (range.end - range.start) / yearsPerPixel
}

export function hasEventDateUncertainty(event: Event): boolean {
	return event.dateUncertainty != null && event.dateUncertainty > 0
}
