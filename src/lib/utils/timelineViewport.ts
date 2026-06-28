import { TIME_CONSTANTS } from "$lib/constants"

export function getMaxLeftEdgeOffset(
	viewportWidth: number,
	yearsPerPixel: number,
): number {
	if (viewportWidth <= 0 || yearsPerPixel <= 0) {
		return 0
	}

	const viewportSpan = viewportWidth * yearsPerPixel
	return Math.max(
		0,
		TIME_CONSTANTS.END_YEAR - TIME_CONSTANTS.START_YEAR - viewportSpan,
	)
}

export function clampLeftEdgeOffset(
	offset: number,
	viewportWidth: number,
	yearsPerPixel: number,
): number {
	if (viewportWidth <= 0 || yearsPerPixel <= 0) {
		return Math.max(0, offset)
	}

	const maxOffset = getMaxLeftEdgeOffset(viewportWidth, yearsPerPixel)

	if (offset < 0) return 0
	if (offset > maxOffset) return maxOffset
	return offset
}

export function canPanEarlier(leftEdgeYearOffset: number): boolean {
	return leftEdgeYearOffset > 0
}

export function canPanLater(
	leftEdgeYearOffset: number,
	viewportWidth: number,
	yearsPerPixel: number,
): boolean {
	return leftEdgeYearOffset < getMaxLeftEdgeOffset(viewportWidth, yearsPerPixel)
}

export function computeCenteredLeftEdgeOffset(
	centerYear: number,
	viewportWidth: number,
	yearsPerPixel: number,
): number {
	const offset =
		centerYear - TIME_CONSTANTS.START_YEAR - (viewportWidth * yearsPerPixel) / 2

	return clampLeftEdgeOffset(offset, viewportWidth, yearsPerPixel)
}
