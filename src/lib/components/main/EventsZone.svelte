<script lang="ts">
import type { Event } from "$lib/types"
import { formatYear } from "$lib/utils/formatters"
import { onMount } from "svelte"

interface Props {
	zoomLevel: number
	viewportWidth: number
	viewportYearSpan: number
	yearsPerPixel: number
	leftEdgeYear: number
	rightEdgeYear: number
}

let {
	zoomLevel,
	viewportWidth,
	viewportYearSpan,
	yearsPerPixel,
	leftEdgeYear,
	rightEdgeYear,
}: Props = $props()

// Load events from JSON file
let events: Event[] = $state([])

// Load events on component mount
onMount(async () => {
	try {
		const response = await fetch("/src/data/events.json")
		events = await response.json()
	} catch (error) {
		console.error("Failed to load events:", error)
	}
})

// Filter events that are visible in the current viewport
const visibleEvents = $derived(
	events.filter((event) => {
		return event.date >= leftEdgeYear && event.date <= rightEdgeYear
	}),
)

// Calculate event position within the viewport
function getEventPosition(eventDate: number): number {
	return (eventDate - leftEdgeYear) / yearsPerPixel
}
</script>

<div class="w-full flex-[4] bg-slate-300 border-b border-slate-200 overflow-hidden">
	<div class="h-full relative overflow-hidden">
		<!-- Events will be rendered here -->
		{#each visibleEvents as event}
			<div 
				class="absolute top-4 bg-white rounded-lg shadow-md p-3 max-w-xs border border-gray-200"
				style="transform: translateX({getEventPosition(event.date)}px)"
			>
				<div class="font-semibold text-sm text-gray-800">
					{event.name.fr}
				</div>
				<div class="text-xs text-gray-600 mt-1">
					{formatYear(event.date)}
				</div>
				{#if event.description.fr}
					<div class="text-xs text-gray-500 mt-2">
						{event.description.fr}
					</div>
				{/if}
			</div>
		{/each}
		
		<!-- Debug info -->
		<div class="absolute bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs">
			Events: {visibleEvents.length} visible
			<br>
			Viewport: {formatYear(leftEdgeYear)} → {formatYear(rightEdgeYear)}
		</div>
	</div>
</div>
