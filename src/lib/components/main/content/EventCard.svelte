<script lang="ts">
import { currentLocale } from "$lib/stores/localeStore"
import type { Event } from "$lib/types"
import { formatDate } from "$lib/utils/formatters"
import { bindPointerClick } from "$lib/utils/pointerClickOrDrag"

const CARD_WIDTH = 200
const CARD_SCREEN_PADDING = 0
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

function handlePointerEnter() {
	onCardHover(event.id)
}

function handlePointerLeave() {
	onCardHover(null)
}
</script>

<!-- Event marker line with visual continuity to card -->
<div
	class="absolute bottom-0 w-1 bg-gradient-to-t from-accent/60 to-accent-secondary/40"
	class:from-accent={isSelected}
	class:to-accent-secondary={isSelected}
	style="transform: translateX({getEventXPosition(event.date)}px); height: {yPosition + 12}px; z-index: {zIndex}; clip-path: polygon(0 0, 100% 0, 50% 100%);"
></div>

<!-- Event card -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_tabindex, a11y_no_static_element_interactions -->
<div
	data-event-card
	data-selected={isSelected || undefined}
	class="absolute rounded-xl p-4 border-2 border-accent/35 cursor-pointer transition-colors duration-300 transition-shadow duration-300 overflow-hidden bg-surface-raised {isSelected ? 'border-accent ring-1 ring-accent/30' : 'hover:border-accent/55'}"
	style="transform: translateX({getEventCardXPosition(getEventXPosition(event.date))}px); bottom: {yPosition}px; z-index: {zIndex}; width: {CARD_WIDTH}px;"
	use:bindPointerClick={() => onCardClick(event.id, index)}
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
	tabindex="0"
>
	<div class="font-semibold text-foreground mb-2 transition-all duration-200 text-sm">
		{event.name[$currentLocale]}
	</div>
	<div class="text-muted font-medium mb-2 transition-all duration-200 text-xs">
		{formatDate(event.date, $currentLocale)}
	</div>
	{#if isSelected && event.description[$currentLocale]}
		<div class="text-foreground/90 leading-relaxed transition-all duration-200 text-xs">
			{event.description[$currentLocale]}
		</div>
	{/if}
</div>
