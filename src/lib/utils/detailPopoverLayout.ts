import {
	DETAIL_SECTION_GAP,
	DETAIL_SUBTITLE_HEIGHT,
	DETAIL_TITLE_LINE_HEIGHT,
	DETAIL_VERTICAL_PADDING,
	estimateDetailContentHeight,
} from "#lib/utils/detailContentFit.js"

export type DetailPopoverPlacement = "above" | "below"

export type DetailPopoverLayout = {
	popoverLeft: number
	popoverTop: number
	placement: DetailPopoverPlacement
	arrowOffsetX: number
	popoverWidth: number
}

export const DETAIL_POPOVER_MAX_WIDTH = 280
export const DETAIL_POPOVER_SCREEN_PADDING = 16
export const DETAIL_POPOVER_GAP = 8
export const DETAIL_POPOVER_MAX_SCROLL_HEIGHT = 192

export function clampPopoverCenterX(
	centerX: number,
	popoverWidth: number,
	viewportWidth: number,
): number {
	const halfWidth = popoverWidth / 2
	const minCenter = DETAIL_POPOVER_SCREEN_PADDING + halfWidth
	const maxCenter = viewportWidth - DETAIL_POPOVER_SCREEN_PADDING - halfWidth

	if (maxCenter <= minCenter) {
		return viewportWidth / 2
	}

	return Math.min(Math.max(centerX, minCenter), maxCenter)
}

export function getDetailPopoverWidth(viewportWidth: number): number {
	return Math.min(
		DETAIL_POPOVER_MAX_WIDTH,
		Math.max(0, viewportWidth - DETAIL_POPOVER_SCREEN_PADDING * 2),
	)
}

type TopAnchoredPopoverParams = {
	anchorX: number
	anchorTop: number
	anchorBottom: number
	zoneTop: number
	popoverWidth: number
	viewportWidth: number
	estimatedPopoverHeight: number
}

/** Popover layout using top-based coordinates (geological periods zone). */
export function getTopAnchoredDetailPopoverLayout(
	params: TopAnchoredPopoverParams,
): DetailPopoverLayout {
	const {
		anchorX,
		anchorTop,
		anchorBottom,
		zoneTop,
		popoverWidth,
		viewportWidth,
		estimatedPopoverHeight,
	} = params

	const spaceAbove = anchorTop - zoneTop
	const placement: DetailPopoverPlacement =
		spaceAbove >= estimatedPopoverHeight + DETAIL_POPOVER_GAP
			? "above"
			: "below"

	const anchorY = placement === "above" ? anchorTop : anchorBottom
	const popoverLeft = clampPopoverCenterX(anchorX, popoverWidth, viewportWidth)
	const popoverTop =
		placement === "above"
			? anchorY - DETAIL_POPOVER_GAP
			: anchorY + DETAIL_POPOVER_GAP

	return {
		popoverLeft,
		popoverTop,
		placement,
		arrowOffsetX: anchorX - popoverLeft,
		popoverWidth,
	}
}

type BottomAnchoredPopoverParams = {
	anchorX: number
	anchorTopFromBottom: number
	anchorBottomFromBottom: number
	zoneHeight: number
	popoverWidth: number
	viewportWidth: number
	estimatedPopoverHeight: number
}

/** Converts bottom-based anchor coords to top-based popover layout (events zone). */
export function getBottomAnchoredDetailPopoverLayout(
	params: BottomAnchoredPopoverParams,
): DetailPopoverLayout {
	const {
		anchorX,
		anchorTopFromBottom,
		anchorBottomFromBottom,
		zoneHeight,
		popoverWidth,
		viewportWidth,
		estimatedPopoverHeight,
	} = params

	return getTopAnchoredDetailPopoverLayout({
		anchorX,
		anchorTop: zoneHeight - anchorTopFromBottom,
		anchorBottom: zoneHeight - anchorBottomFromBottom,
		zoneTop: 0,
		popoverWidth,
		viewportWidth,
		estimatedPopoverHeight,
	})
}

export function estimateDetailPopoverHeight(
	title: string,
	subtitle: string | undefined,
	description: string,
	popoverWidth: number,
): number {
	return estimateDetailContentHeight(
		{ title, subtitle, description },
		popoverWidth,
	)
}

export function getDetailPopoverScrollMaxHeight(
	title: string,
	subtitle: string | undefined,
	description: string,
	popoverWidth: number,
): number {
	const contentHeight = estimateDetailContentHeight(
		{ title, subtitle, description },
		popoverWidth,
	)
	const chromeHeight =
		DETAIL_VERTICAL_PADDING +
		DETAIL_TITLE_LINE_HEIGHT * 2 +
		(subtitle ? DETAIL_SUBTITLE_HEIGHT + DETAIL_SECTION_GAP : 0) +
		DETAIL_SECTION_GAP

	return Math.min(
		DETAIL_POPOVER_MAX_SCROLL_HEIGHT,
		Math.max(0, contentHeight - chromeHeight),
	)
}
