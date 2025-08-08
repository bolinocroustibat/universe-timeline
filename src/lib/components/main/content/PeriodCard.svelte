<script lang="ts">
import type { Period } from "$lib/types"
import { currentLocale } from "$lib/stores/localeStore"

interface Props {
	period: Period
	leftEdgeYear: number
	yearsPerPixel: number
	viewportWidth: number
}

let { period, leftEdgeYear, yearsPerPixel, viewportWidth }: Props = $props()

// Calculate period position and width
function getPeriodPosition(): { x: number; width: number } {
	const startX = (period.start - leftEdgeYear) / yearsPerPixel
	const endX = (period.end - leftEdgeYear) / yearsPerPixel
	const width = endX - startX
	
	return {
		x: Math.max(0, startX),
		width: Math.min(width, viewportWidth - startX)
	}
}

// Get period color or default
const periodColor = $derived(period.color || "#6b7280")

// Calculate visibility
const startX = (period.start - leftEdgeYear) / yearsPerPixel
const endX = (period.end - leftEdgeYear) / yearsPerPixel
const width = endX - startX
const isVisible = width > 0 && startX < viewportWidth && endX > 0
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
