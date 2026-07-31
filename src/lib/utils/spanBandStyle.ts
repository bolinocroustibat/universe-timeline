import { blendColors } from "$lib/utils/colors"
import { buildPigmentBackgroundStyle } from "$lib/utils/spanBandPigment"

export type SpanBandGradientOptions = {
	color: string
	leftNeighborColor?: string | null
	rightNeighborColor?: string | null
	fadeEdges?: boolean
}

function getNeighborBlendLayer(
	color: string,
	leftNeighborColor: string | null,
	rightNeighborColor: string | null,
): string | undefined {
	if (!leftNeighborColor && !rightNeighborColor) {
		return undefined
	}

	const leftColor = leftNeighborColor ?? color
	const rightColor = rightNeighborColor ?? color

	const leftBlend = leftNeighborColor ? blendColors(leftColor, color) : color
	const rightBlend = rightNeighborColor ? blendColors(color, rightColor) : color

	if (leftNeighborColor && !rightNeighborColor) {
		return `linear-gradient(to right, ${leftBlend} 0%, ${color} 10%, ${color} 100%)`
	}

	if (!leftNeighborColor && rightNeighborColor) {
		return `linear-gradient(to right, ${color} 0%, ${color} 90%, ${rightBlend} 100%)`
	}

	return `linear-gradient(to right, ${leftBlend} 0%, ${color} 10%, ${color} 90%, ${rightBlend} 100%)`
}

export function getSpanBandBackgroundStyle({
	color,
	leftNeighborColor = null,
	rightNeighborColor = null,
	fadeEdges = false,
}: SpanBandGradientOptions): string {
	if (fadeEdges && !leftNeighborColor && !rightNeighborColor) {
		const edgeFade = `linear-gradient(to right, color-mix(in srgb, ${color} 35%, transparent) 0%, ${color} 10%, ${color} 90%, color-mix(in srgb, ${color} 35%, transparent) 100%)`
		return buildPigmentBackgroundStyle(color, edgeFade)
	}

	const neighborLayer = getNeighborBlendLayer(
		color,
		leftNeighborColor,
		rightNeighborColor,
	)

	return buildPigmentBackgroundStyle(color, neighborLayer)
}
