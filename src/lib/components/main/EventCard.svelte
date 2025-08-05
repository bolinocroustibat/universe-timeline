<script lang="ts">
import type { Event } from "$lib/types"
import { formatYear } from "$lib/utils/formatters"
import { currentLanguage } from "$lib/stores/languageStore"

interface Props {
	event: Event
	xPosition: number
	yPosition: number
	markerHeight: number
}

let { event, xPosition, yPosition, markerHeight }: Props = $props()

// Get current language
const language = $derived($currentLanguage)
</script>

<div 
	class="absolute bg-white rounded-lg shadow-lg p-4 max-w-xs border border-gray-200 hover:shadow-xl transition-shadow cursor-pointer z-10"
	style="transform: translateX({xPosition}px); bottom: {yPosition}px;"
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
	<!-- Event marker line -->
	<div class="absolute bottom-0 left-0 translate-y-full w-px bg-blue-500" style="height: {markerHeight}px;"></div>
</div>
