import { blendColors } from "$lib/utils/colors"

export type SpanBandGradientOptions = {
	color: string
	leftNeighborColor?: string | null
	rightNeighborColor?: string | null
	fadeEdges?: boolean
}

export function getSpanBandBackgroundStyle({
	color,
	leftNeighborColor = null,
	rightNeighborColor = null,
	fadeEdges = false,
}: SpanBandGradientOptions): string {
	if (!leftNeighborColor && !rightNeighborColor) {
		if (fadeEdges) {
			return `background: linear-gradient(to right, color-mix(in srgb, ${color} 35%, transparent) 0%, ${color} 10%, ${color} 90%, color-mix(in srgb, ${color} 35%, transparent) 100%);`
		}

		return `background-color: ${color};`
	}

	const leftColor = leftNeighborColor ?? color
	const rightColor = rightNeighborColor ?? color

	const leftBlend = leftNeighborColor ? blendColors(leftColor, color) : color
	const rightBlend = rightNeighborColor ? blendColors(color, rightColor) : color

	if (leftNeighborColor && !rightNeighborColor) {
		return `background: linear-gradient(to right, ${leftBlend} 0%, ${color} 10%, ${color} 100%);`
	}

	if (!leftNeighborColor && rightNeighborColor) {
		return `background: linear-gradient(to right, ${color} 0%, ${color} 90%, ${rightBlend} 100%);`
	}

	return `background: linear-gradient(to right, ${leftBlend} 0%, ${color} 10%, ${color} 90%, ${rightBlend} 100%);`
}
