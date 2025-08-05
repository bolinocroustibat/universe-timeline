<script lang="ts">
import type { Event } from "$lib/types"
import { formatYear } from "$lib/utils/formatters"
import { currentLanguage } from "$lib/stores/languageStore"
import { createEventDispatcher } from "svelte"

interface Props {
	event: Event
	xPosition: number
	yPosition: number
	index: number
	isTopCard: boolean
}

let { event, xPosition, yPosition, index, isTopCard }: Props = $props()

// Get current language
const language = $derived($currentLanguage)

// Calculate z-index: base z-index + index, with clicked cards on top
const zIndex = $derived(isTopCard ? 1000 : 10 + index)

const dispatch = createEventDispatcher()

function handleClick() {
	// Dispatch event to parent to bring this card to top
	dispatch('cardClick', { eventId: event.id, index })
}
</script>

<!-- Event marker line (positioned relative to timeline) -->
<div 
	class="absolute bottom-0 w-px bg-blue-500"
	style="transform: translateX({xPosition}px); height: {yPosition + 8}px; z-index: {zIndex};"
></div>

<!-- Event card -->
<div 
	class="absolute bg-white rounded-lg shadow-lg p-4 max-w-xs border border-gray-200 hover:shadow-xl transition-shadow cursor-pointer"
	style="transform: translateX({xPosition}px); bottom: {yPosition}px; z-index: {zIndex};"
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
