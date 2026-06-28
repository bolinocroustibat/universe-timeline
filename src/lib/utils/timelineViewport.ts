import { TIME_CONSTANTS } from "$lib/constants"

export function getMaxLeftEdgeOffset(viewportYearSpan: number): number {
	return Math.max(
		0,
		TIME_CONSTANTS.END_YEAR - TIME_CONSTANTS.START_YEAR - viewportYearSpan,
	)
}

export function clampLeftEdgeOffset(
	offset: number,
	viewportYearSpan: number,
): number {
	if (viewportYearSpan <= 0) {
		return Math.max(0, offset)
	}

	const maxOffset = getMaxLeftEdgeOffset(viewportYearSpan)

	if (offset < 0) return 0
	if (offset > maxOffset) return maxOffset
	return offset
}

export function canPanEarlier(leftEdgeYearOffset: number): boolean {
	return leftEdgeYearOffset > 0
}

export function canPanLater(
	leftEdgeYearOffset: number,
	viewportYearSpan: number,
): boolean {
	return leftEdgeYearOffset < getMaxLeftEdgeOffset(viewportYearSpan)
}

export function computeCenteredLeftEdgeOffset(
	centerYear: number,
	viewportWidth: number,
	yearsPerPixel: number,
	viewportYearSpan: number,
): number {
	const offset =
		centerYear - TIME_CONSTANTS.START_YEAR - (viewportWidth * yearsPerPixel) / 2

	return clampLeftEdgeOffset(offset, viewportYearSpan)
}
