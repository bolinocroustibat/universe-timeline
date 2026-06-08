import { TIME_CONSTANTS } from "$lib/constants"

export interface NavigatorThumbGeometry {
	leftX: number
	width: number
	centerX: number
}

export function getTimelineTotalSpan(): number {
	return TIME_CONSTANTS.END_YEAR - TIME_CONSTANTS.START_YEAR
}

export function yearToTrackX(year: number, trackWidth: number): number {
	const totalSpan = getTimelineTotalSpan()
	if (trackWidth <= 0 || totalSpan <= 0) return 0

	return ((year - TIME_CONSTANTS.START_YEAR) / totalSpan) * trackWidth
}

export function trackXToYear(trackX: number, trackWidth: number): number {
	const totalSpan = getTimelineTotalSpan()
	if (trackWidth <= 0 || totalSpan <= 0) return TIME_CONSTANTS.START_YEAR

	return TIME_CONSTANTS.START_YEAR + (trackX / trackWidth) * totalSpan
}

export function computeNavigatorThumb(
	leftEdgeYear: number,
	rightEdgeYear: number,
	trackWidth: number,
	minWidthPx: number = 1,
): NavigatorThumbGeometry {
	if (trackWidth <= 0) {
		return { leftX: 0, width: 0, centerX: 0 }
	}

	const totalSpan = getTimelineTotalSpan()
	const visibleSpan = rightEdgeYear - leftEdgeYear
	let leftX = yearToTrackX(leftEdgeYear, trackWidth)
	let rightX = yearToTrackX(rightEdgeYear, trackWidth)

	if (leftEdgeYear <= TIME_CONSTANTS.START_YEAR) {
		leftX = 0
	}
	if (rightEdgeYear >= TIME_CONSTANTS.END_YEAR) {
		rightX = trackWidth
	}

	if (visibleSpan >= totalSpan * 0.999 && leftX === 0) {
		return {
			leftX: 0,
			width: trackWidth,
			centerX: trackWidth / 2,
		}
	}

	let width = Math.max(minWidthPx, rightX - leftX)
	width = Math.min(trackWidth, width)

	let clampedLeftX = leftX
	if (clampedLeftX + width > trackWidth) {
		clampedLeftX = trackWidth - width
	}
	clampedLeftX = Math.max(0, clampedLeftX)

	return {
		leftX: clampedLeftX,
		width,
		centerX: clampedLeftX + width / 2,
	}
}

export function buildNavigatorTickPositions(
	trackWidth: number,
	majorInterval: number,
	minorInterval: number,
): { major: number[]; minor: number[] } {
	if (trackWidth <= 0 || majorInterval <= 0 || minorInterval <= 0) {
		return { major: [], minor: [] }
	}

	const major: number[] = []
	const minor: number[] = []

	const startMajorTick = Math.floor(TIME_CONSTANTS.START_YEAR / majorInterval)
	const endMajorTick = Math.ceil(TIME_CONSTANTS.END_YEAR / majorInterval)

	for (let tickIndex = startMajorTick; tickIndex <= endMajorTick; tickIndex++) {
		const year = tickIndex * majorInterval
		if (year >= TIME_CONSTANTS.START_YEAR && year <= TIME_CONSTANTS.END_YEAR) {
			major.push(yearToTrackX(year, trackWidth))
		}
	}

	const startMinorTick = Math.floor(TIME_CONSTANTS.START_YEAR / minorInterval)
	const endMinorTick = Math.ceil(TIME_CONSTANTS.END_YEAR / minorInterval)

	for (let tickIndex = startMinorTick; tickIndex <= endMinorTick; tickIndex++) {
		const year = tickIndex * minorInterval
		if (
			year >= TIME_CONSTANTS.START_YEAR &&
			year <= TIME_CONSTANTS.END_YEAR &&
			year % majorInterval !== 0
		) {
			minor.push(yearToTrackX(year, trackWidth))
		}
	}

	return { major, minor }
}
