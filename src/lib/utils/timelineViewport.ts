import { TIME_CONSTANTS } from "$lib/constants"

export function clampLeftEdgeOffset(
	offset: number,
	viewportWidth: number,
	yearsPerPixel: number,
): number {
	if (viewportWidth <= 0 || yearsPerPixel <= 0) {
		return Math.max(0, offset)
	}

	const viewportSpan = viewportWidth * yearsPerPixel
	const maxOffset =
		TIME_CONSTANTS.END_YEAR - TIME_CONSTANTS.START_YEAR - viewportSpan

	if (offset < 0) return 0
	if (offset > maxOffset) return Math.max(0, maxOffset)
	return offset
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
