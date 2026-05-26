<script lang="ts">
import { currentLocale } from "$lib/stores/localeStore"
import type { Event } from "$lib/types"
import { formatDate } from "$lib/utils/formatters"

const CARD_WIDTH = 200 // Width of event cards in pixels
const CARD_SCREEN_PADDING = 0 // Padding from edges
const Z_INDEX_SELECTED = 1000
const Z_INDEX_HOVERED = 999
const Z_INDEX_DEFAULT = 980

interface Props {
	event: Event
	leftEdgeYear: number
	yearsPerPixel: number
	viewportWidth: number
	yPosition: number
	index: number
	isTopCard: boolean
	isHovered: boolean
	onCardClick: (eventId: number, index: number) => void
	onCardHover: (eventId: number | null) => void
}

let {
	event,
	leftEdgeYear,
	yearsPerPixel,
	viewportWidth,
	yPosition,
	index,
	isTopCard,
	isHovered,
	onCardClick,
	onCardHover,
}: Props = $props()

const zIndex = $derived(
	isTopCard ? Z_INDEX_SELECTED : isHovered ? Z_INDEX_HOVERED : Z_INDEX_DEFAULT,
)

const isSelected = $derived(isTopCard)

function getEventXPosition(eventDate: number): number {
	return (eventDate - leftEdgeYear) / yearsPerPixel
}

function getEventCardXPosition(markerXPosition: number): number {
	let cardX = markerXPosition - CARD_WIDTH / 2

	if (cardX < CARD_SCREEN_PADDING) {
		cardX = CARD_SCREEN_PADDING
	}

	if (cardX + CARD_WIDTH > viewportWidth - CARD_SCREEN_PADDING) {
		cardX = viewportWidth - CARD_WIDTH - CARD_SCREEN_PADDING
	}

	return cardX
}

function handlePointerDown(e: PointerEvent) {
	e.stopPropagation()
	onCardClick(event.id, index)
}

function handlePointerEnter() {
	onCardHover(event.id)
}

function handlePointerLeave() {
	onCardHover(null)
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
	data-event-card
	class="absolute bg-gradient-to-br from-rose-50 to-white rounded-xl p-4 border-2 border-rose-300 cursor-pointer backdrop-blur-sm shadow-lg transition-colors duration-300 transition-shadow duration-300"
	class:border-rose-400={isSelected}
	class:shadow-2xl={isSelected}
	class:from-rose-100={isSelected}
	class:to-white={isSelected}
	class:hover:shadow-xl={!isSelected}
	class:hover:border-rose-200={!isSelected}
	style="transform: translateX({getEventCardXPosition(getEventXPosition(event.date))}px); bottom: {yPosition}px; z-index: {zIndex}; width: {CARD_WIDTH}px; box-shadow: 0 0 0 1px rgba(244, 63, 94, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);"
	onpointerdown={handlePointerDown}
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
	tabindex="0"
>
	
	<div class="font-semibold text-slate-800 mb-2 transition-all duration-200 text-sm">
		{event.name[$currentLocale]}
	</div>
	<div class="text-slate-600 font-medium mb-2 transition-all duration-200 text-xs">
		{formatDate(event.date, $currentLocale)}
	</div>
	{#if isSelected && event.description[$currentLocale]}
		<div class="text-slate-700 leading-relaxed transition-all duration-200 text-xs">
			{event.description[$currentLocale]}
		</div>
	{/if}
</div>
