<script lang="ts">
import type { Event } from "$lib/types"
import { formatYear } from "$lib/utils/formatters"
import { currentLanguage } from "$lib/stores/languageStore"

const CARD_WIDTH = 200 // Width of event cards in pixels

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

// Get current language
const language = $derived($currentLanguage)

// Calculate z-index: base z-index + index, with clicked cards on top
const zIndex = $derived(isTopCard ? 1000 : 10 + index)

// Calculate event X position within the viewport (for marker line)
function getEventXPosition(eventDate: number): number {
	return (eventDate - leftEdgeYear) / yearsPerPixel
}

// Calculate event card X position
function getEventCardXPosition(markerXPosition: number): number {
	const padding = 20 // Padding from edges
	
	// Center the card on the marker line
	let cardX = markerXPosition - (CARD_WIDTH / 2)
	
	// Prevent card from going off the left edge
	if (cardX < padding) {
		cardX = padding
	}
	
	// Prevent card from going off the right edge
	if (cardX + CARD_WIDTH > viewportWidth - padding) {
		cardX = viewportWidth - CARD_WIDTH - padding
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
	class="absolute bottom-0 w-px bg-blue-500"
	style="transform: translateX({getEventXPosition(event.date)}px); height: {yPosition + 8}px; z-index: {zIndex};"
></div>

<!-- Event card -->
<div 
	class="absolute bg-white rounded-lg shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-shadow cursor-pointer"
	style="transform: translateX({getEventCardXPosition(getEventXPosition(event.date))}px); bottom: {yPosition}px; z-index: {zIndex}; width: {CARD_WIDTH}px;"
	onclick={handleClick}
	tabindex="0"
>
	<div class="font-semibold text-sm text-gray-800 mb-1">
		{event.name[language]}
	</div>
	<div class="text-xs text-blue-600 font-medium mb-2">
		{formatYear(event.date, language)}
	</div>
	{#if event.description[language]}
		<div class="text-xs text-gray-600 leading-relaxed">
			{event.description[language]}
		</div>
	{/if}
</div>
