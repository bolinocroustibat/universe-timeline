<script lang="ts">
import { currentLocale } from "$lib/stores/localeStore"
import type { Period } from "$lib/types"
import { clickOutside } from "$lib/utils/clickOutside"
import { blendColors } from "$lib/utils/colors"

interface Props {
	period: Period
	leftEdgeYear: number
	rightEdgeYear: number
	yearsPerPixel: number
	viewportWidth: number
	index: number
	isTopCard: boolean
	leftPeriod: Period | null
	rightPeriod: Period | null
	onCardClick: (periodId: number, index: number) => void
	onCardDeselect: () => void
}

let {
	period,
	leftEdgeYear,
	rightEdgeYear,
	yearsPerPixel,
	viewportWidth,
	index,
	isTopCard,
	leftPeriod,
	rightPeriod,
	onCardClick,
	onCardDeselect,
}: Props = $props()

// Calculate period position and width
const periodPosition = $derived(() => {
	const startX = (period.start - leftEdgeYear) / yearsPerPixel
	const endX = (period.end - leftEdgeYear) / yearsPerPixel
	const rightEdgeX = (rightEdgeYear - leftEdgeYear) / yearsPerPixel

	const clampedStartX = Math.max(0, startX)
	const clampedEndX = Math.min(endX, rightEdgeX)
	const width = clampedEndX - clampedStartX

	return {
		x: clampedStartX,
		width: width,
	}
})

// Get period color or default
const periodColor = $derived(period.color || "#6b7280")

// Calculate gradient background based on adjacent periods
const gradientBackground = $derived(() => {
	const currentColor = period.color || "#6b7280"
	const leftColor = leftPeriod?.color || currentColor
	const rightColor = rightPeriod?.color || currentColor

	// Calculate blended colors
	const leftBlend = leftPeriod
		? blendColors(leftColor, currentColor)
		: currentColor
	const rightBlend = rightPeriod
		? blendColors(currentColor, rightColor)
		: currentColor

	// If no adjacent periods, use solid color
	if (!leftPeriod && !rightPeriod) {
		return `background-color: ${currentColor};`
	}

	// If only left period exists
	if (leftPeriod && !rightPeriod) {
		return `background: linear-gradient(to right, ${leftBlend} 0%, ${currentColor} 10%, ${currentColor} 100%);`
	}

	// If only right period exists
	if (!leftPeriod && rightPeriod) {
		return `background: linear-gradient(to right, ${currentColor} 0%, ${currentColor} 90%, ${rightBlend} 100%);`
	}

	// If both adjacent periods exist
	return `background: linear-gradient(to right, ${leftBlend} 0%, ${currentColor} 10%, ${currentColor} 90%,${rightBlend} 100%);`
})

// Calculate visibility using both edges
const isVisible = $derived(
	period.end >= leftEdgeYear && period.start <= rightEdgeYear,
)

// Calculate z-index: selected cards appear on top
const zIndex = $derived(isTopCard ? 1000 : 100)

// Determine if this card is selected
const isSelected = $derived(isTopCard)

function handleClick() {
	// Call the callback function to bring this card to top
	onCardClick(period.id, index)
}
</script>

{#if isVisible}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_tabindex, a11y_no_static_element_interactions -->
	<div 
		class="absolute bottom-0 backdrop-blur-sm flex items-center justify-center px-2 text-xs font-medium shadow-sm cursor-pointer"
		class:shadow-lg={isSelected}
		class:shadow-md={!isSelected}
		class:border-2={isSelected}
		class:border-white={isSelected}
		style="left: {periodPosition().x}px; width: {periodPosition().width}px; {gradientBackground()}; color: white; height: {isSelected ? 'auto' : '8rem'}; min-height: 8rem; z-index: {zIndex};"
		title="{period.name[$currentLocale]}"
		onclick={handleClick}
		use:clickOutside={onCardDeselect}
		tabindex="0"
	>
		<div class="flex flex-col items-center justify-center w-full p-2">
			<span class="truncate font-semibold mb-1">
				{period.name[$currentLocale]}
			</span>
			{#if isSelected && period.description[$currentLocale]}
				<div class="truncate text-xs leading-relaxed text-center opacity-90 max-w-full">
					{period.description[$currentLocale]}
				</div>
			{/if}
		</div>
	</div>
{/if}
