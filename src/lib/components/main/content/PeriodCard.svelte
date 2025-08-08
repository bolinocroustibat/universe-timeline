<script lang="ts">
import type { Period } from "$lib/types"
import { currentLocale } from "$lib/stores/localeStore"

interface Props {
	period: Period
	leftEdgeYear: number
	rightEdgeYear: number
	yearsPerPixel: number
	viewportWidth: number
}

let { period, leftEdgeYear, rightEdgeYear, yearsPerPixel, viewportWidth }: Props = $props()

// Calculate period position and width
function getPeriodPosition(): { x: number; width: number } {
	const startX = (period.start - leftEdgeYear) / yearsPerPixel
	const endX = (period.end - leftEdgeYear) / yearsPerPixel
	const rightEdgeX = (rightEdgeYear - leftEdgeYear) / yearsPerPixel
	
	const clampedStartX = Math.max(0, startX)
	const clampedEndX = Math.min(endX, rightEdgeX)
	const width = clampedEndX - clampedStartX
	
	return {
		x: clampedStartX,
		width: width
	}
}

// Get period color or default
const periodColor = $derived(period.color || "#6b7280")

// Calculate visibility using both edges
const isVisible = period.end >= leftEdgeYear && period.start <= rightEdgeYear
</script>

{#if isVisible}
	<div 
		class="absolute bottom-0 h-32 backdrop-blur-sm flex items-center justify-center px-2 text-xs font-medium shadow-sm"
		style="left: {getPeriodPosition().x}px; width: {getPeriodPosition().width}px; background-color: {periodColor}; color: white;"
		title="{period.name[$currentLocale]}"
	>
		<span class="truncate">
			{period.name[$currentLocale]}
		</span>
	</div>
{/if}
