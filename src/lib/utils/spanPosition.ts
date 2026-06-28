export type ClampedSpanPosition = {
	x: number
	width: number
	centerX: number
	startX: number
	endX: number
}

export function yearToLayoutX(
	year: number,
	leftEdgeYear: number,
	yearsPerPixel: number,
): number {
	if (yearsPerPixel <= 0) {
		return 0
	}

	return (year - leftEdgeYear) / yearsPerPixel
}

export function snapLayoutX(x: number): number {
	return Math.round(x)
}

export function getClampedSpanPosition({
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
}): ClampedSpanPosition {
	const startX = yearToLayoutX(start, leftEdgeYear, yearsPerPixel)
	const endX = yearToLayoutX(end, leftEdgeYear, yearsPerPixel)
	const rightEdgeX = yearToLayoutX(rightEdgeYear, leftEdgeYear, yearsPerPixel)

	const clampedStartX = Math.max(0, startX)
	const clampedEndX = Math.min(endX, rightEdgeX)
	const width = Math.max(0, clampedEndX - clampedStartX)

	return {
		x: clampedStartX,
		width,
		centerX: clampedStartX + width / 2,
		startX,
		endX,
	}
}
