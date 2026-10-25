/** Shared typography heuristics for detail fit checks (matches card/band padding). */
export const DETAIL_CHAR_WIDTH = 7.5
export const DETAIL_HORIZONTAL_PADDING = 32
export const DETAIL_VERTICAL_PADDING = 32
export const DETAIL_SECTION_GAP = 8
export const DETAIL_TITLE_LINE_HEIGHT = 20
export const DETAIL_TITLE_MAX_LINES = 2
export const DETAIL_SUBTITLE_HEIGHT = 16
export const DETAIL_DESCRIPTION_LINE_HEIGHT = 18

export type DetailContentParts = {
	title: string
	subtitle?: string
	description: string
}

function estimateLineCount(text: string, containerWidth: number): number {
	if (!text) {
		return 0
	}

	const innerWidth = Math.max(0, containerWidth - DETAIL_HORIZONTAL_PADDING)
	const charsPerLine = Math.max(1, Math.floor(innerWidth / DETAIL_CHAR_WIDTH))

	return Math.max(1, Math.ceil(text.length / charsPerLine))
}

/** Estimated pixel height for title + optional subtitle + description. */
export function estimateDetailContentHeight(
	parts: DetailContentParts,
	containerWidth: number,
): number {
	const titleLines = Math.min(
		DETAIL_TITLE_MAX_LINES,
		estimateLineCount(parts.title, containerWidth),
	)
	const descriptionLines = estimateLineCount(
		parts.description,
		containerWidth,
	)

	let height = DETAIL_VERTICAL_PADDING
	height += titleLines * DETAIL_TITLE_LINE_HEIGHT

	if (parts.subtitle) {
		height += DETAIL_SECTION_GAP + DETAIL_SUBTITLE_HEIGHT
	}

	if (parts.description) {
		height += DETAIL_SECTION_GAP
		height += descriptionLines * DETAIL_DESCRIPTION_LINE_HEIGHT
	}

	return height
}

export function detailContentFitsInContainer(
	parts: DetailContentParts,
	containerWidth: number,
	containerHeight: number,
): boolean {
	if (containerWidth <= 0 || containerHeight <= 0) {
		return false
	}

	if (!parts.description) {
		return true
	}

	return (
		estimateDetailContentHeight(parts, containerWidth) <= containerHeight
	)
}

/** Title-only fit check (band/card header without description). */
export function detailTitleFitsInContainer(
	title: string,
	containerWidth: number,
	containerHeight: number,
): boolean {
	if (containerWidth <= 0 || containerHeight <= 0) {
		return false
	}

	const titleLines = Math.min(
		1,
		estimateLineCount(title, containerWidth),
	)
	const height =
		DETAIL_VERTICAL_PADDING + titleLines * DETAIL_TITLE_LINE_HEIGHT

	return height <= containerHeight
}
