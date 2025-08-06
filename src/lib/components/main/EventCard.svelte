<script lang="ts">
import type { Event } from "$lib/types"
import { formatDate } from "$lib/utils/formatters"
import { currentLocale } from "$lib/stores/localeStore"

const CARD_WIDTH = 200 // Width of event cards in pixels
const CARD_SCREEN_PADDING = 0 // Padding from edges
const SELECTED_CARD_WIDTH = 240 // Width when card is selected
const SELECTED_CARD_SCALE = 1.2 // Scale factor when selected

interface Props {
	event: Event
	leftEdgeYear: number
	yearsPerPixel: number
	viewportWidth: number
	yPosition: number
	index: number
	isTopCard: boolean
	onCardClick: (eventId: number, index: number) => void
}

let { event, leftEdgeYear, yearsPerPixel, viewportWidth, yPosition, index, isTopCard, onCardClick }: Props = $props()

// Calculate z-index: base z-index + index, with clicked cards on top
const zIndex = $derived(isTopCard ? 1000 : 10 + index)

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

<!-- Event marker line (positioned relative to timeline) -->
<div 
	class="absolute bottom-0 w-px bg-red-500"
	style="transform: translateX({getEventXPosition(event.date)}px); height: {yPosition + 8}px; z-index: {zIndex};"
></div>

<!-- Event card -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_tabindex, a11y_no_static_element_interactions -->
<div 
	class="absolute bg-white rounded-lg shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-all duration-200 cursor-pointer"
	class:border-blue-500={isSelected}
	class:shadow-2xl={isSelected}
	style="transform: translateX({getEventCardXPosition(getEventXPosition(event.date))}px) scale({isSelected ? SELECTED_CARD_SCALE : 1}); bottom: {yPosition}px; z-index: {zIndex}; width: {currentCardWidth}px;"
	onclick={handleClick}
	tabindex="0"
>
	<div class="font-semibold text-gray-800 mb-1 transition-all duration-200" class:text-lg={isSelected} class:text-sm={!isSelected}>
		{event.name[$currentLocale]}
	</div>
	<div class="text-blue-600 font-medium mb-2 transition-all duration-200" class:text-sm={isSelected} class:text-xs={!isSelected}>
		{formatDate(event.date, $currentLocale)}
	</div>
	{#if event.description[$currentLocale]}
		<div class="text-gray-600 leading-relaxed transition-all duration-200" class:text-sm={isSelected} class:text-xs={!isSelected}>
			{event.description[$currentLocale]}
		</div>
	{/if}
</div>
