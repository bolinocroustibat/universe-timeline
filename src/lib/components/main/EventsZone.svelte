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
let isLoading = $state(true)

// Load events on component mount
onMount(async () => {
	try {
		const response = await fetch("/events.json")
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}
		events = await response.json()
	} catch (error) {
		console.error("EventsZone: Failed to load events:", error)
	} finally {
		isLoading = false
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

<div class="w-full flex-[4] bg-slate-300 border-b border-slate-200 overflow-hidden relative">
	
	{#if isLoading}
		<!-- Loading state -->
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="text-gray-500">Loading events...</div>
		</div>
	{:else}
		<!-- Events will be rendered here -->
		{#each visibleEvents as event}
			<div 
				class="absolute bg-white rounded-lg shadow-lg p-4 max-w-xs border border-gray-200 hover:shadow-xl transition-shadow cursor-pointer z-10"
				style="left: {getEventPosition(event.date)}px; bottom: 20px;"
			>
				<div class="font-semibold text-sm text-gray-800 mb-1">
					{event.name.fr}
				</div>
				<div class="text-xs text-blue-600 font-medium mb-2">
					{formatYear(event.date)}
				</div>
				{#if event.description.fr}
					<div class="text-xs text-gray-600 leading-relaxed">
						{event.description.fr}
					</div>
				{/if}
				<!-- Event marker line -->
				<div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0.5 h-8 bg-blue-500"></div>
			</div>
		{/each}
	{/if}
	

</div>
