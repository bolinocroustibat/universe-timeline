<script lang="ts">
import type { Event } from "$lib/types"
import { formatDate } from "$lib/utils/formatters"
import { currentLocale } from "$lib/stores/localeStore"
import { clickOutside } from "$lib/utils/clickOutside"

const CARD_WIDTH = 200 // Width of event cards in pixels
const CARD_SCREEN_PADDING = 0 // Padding from edges
const SELECTED_CARD_WIDTH = 240 // Width when card is selected
const SELECTED_CARD_SCALE = 1.1 // Scale factor when selected

interface Props {
	event: Event
	leftEdgeYear: number
	yearsPerPixel: number
	viewportWidth: number
	yPosition: number
	index: number
	isTopCard: boolean
	onCardClick: (eventId: number, index: number) => void
	onCardDeselect: () => void
}

let { event, leftEdgeYear, yearsPerPixel, viewportWidth, yPosition, index, isTopCard, onCardClick, onCardDeselect }: Props = $props()

// Calculate z-index: inverted so lower cards (closer to timeline) have higher z-index
const zIndex = $derived(isTopCard ? 1000 : 1000 - yPosition)

// Determine if this card is selected (isTopCard)
const isSelected = $derived(isTopCard)

// Calculate current card width based on selection state
const currentCardWidth = $derived(isSelected ? SELECTED_CARD_WIDTH : CARD_WIDTH)

// Calculate event X position within the viewport (for marker line)
function getEventXPosition(eventDate: number): number {
	return (eventDate - leftEdgeYear) / yearsPerPixel
}

// Calculate event card X position
function getEventCardXPosition(markerXPosition: number): number {
	// Center the card on the marker line
	let cardX = markerXPosition - (currentCardWidth / 2)
	
	// Prevent card from going off the left edge
	if (cardX < CARD_SCREEN_PADDING) {
		cardX = CARD_SCREEN_PADDING
	}
	
	// Prevent card from going off the right edge
	if (cardX + currentCardWidth > viewportWidth - CARD_SCREEN_PADDING) {
		cardX = viewportWidth - currentCardWidth - CARD_SCREEN_PADDING
	}
	
	return cardX
}

function handleClick() {
	// Call the callback function to bring this card to top
	onCardClick(event.id, index)
}
</script>

<!-- Event marker line with visual continuity to card -->
<div 
	class="absolute bottom-0 w-1 bg-gradient-to-t from-rose-300 to-rose-200"
	class:from-rose-500={isSelected}
	class:to-rose-400={isSelected}
	style="transform: translateX({getEventXPosition(event.date)}px); height: {yPosition + 12}px; z-index: {zIndex}; clip-path: polygon(0 0, 100% 0, 50% 100%);"
></div>

<!-- Event card with modern styling and visual continuity -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_tabindex, a11y_no_static_element_interactions -->
<div 
	class="absolute bg-gradient-to-br from-rose-50 to-white rounded-xl p-4 border-2 border-rose-300 cursor-pointer backdrop-blur-sm shadow-lg transition-colors duration-300 transition-shadow duration-300"
	class:border-rose-400={isSelected}
	class:shadow-2xl={isSelected}
	class:from-rose-100={isSelected}
	class:to-white={isSelected}
	class:hover:shadow-xl={!isSelected}
	class:hover:border-rose-200={!isSelected}
	style="transform: translateX({getEventCardXPosition(getEventXPosition(event.date))}px) scale({isSelected ? SELECTED_CARD_SCALE : 1}); bottom: {yPosition}px; z-index: {zIndex}; width: {currentCardWidth}px; box-shadow: 0 0 0 1px rgba(244, 63, 94, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);"
	onclick={handleClick}
	use:clickOutside={onCardDeselect}
	tabindex="0"
>
	
	<div class="font-semibold text-slate-800 mb-2 transition-all duration-200" class:text-lg={isSelected} class:text-sm={!isSelected}>
		{event.name[$currentLocale]}
	</div>
	<div class="text-slate-600 font-medium mb-2 transition-all duration-200" class:text-sm={isSelected} class:text-xs={!isSelected}>
		{formatDate(event.date, $currentLocale)}
	</div>
	{#if event.description[$currentLocale]}
		<div class="text-slate-700 leading-relaxed transition-all duration-200" class:text-sm={isSelected} class:text-xs={!isSelected}>
			{event.description[$currentLocale]}
		</div>
	{/if}
</div>
