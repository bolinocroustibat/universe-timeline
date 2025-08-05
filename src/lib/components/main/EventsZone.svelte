<script lang="ts">
import type { Event, Period } from "$lib/types"
import { formatYear } from "$lib/utils/formatters"
import { onMount } from "svelte"
import { currentLanguage } from "$lib/stores/languageStore"

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

// Load events and periods from JSON files
let events: Event[] = $state([])
let periods: Period[] = $state([])
let isLoading = $state(true)

// Load events and periods on component mount
onMount(async () => {
	try {
		// Load both events and periods in parallel
		const [eventsResponse, periodsResponse] = await Promise.all([
			fetch("/events.json"),
			fetch("/periods.json")
		])
		
		if (!eventsResponse.ok) {
			throw new Error(`HTTP error! status: ${eventsResponse.status}`)
		}
		if (!periodsResponse.ok) {
			throw new Error(`HTTP error! status: ${periodsResponse.status}`)
		}
		
		events = await eventsResponse.json()
		periods = await periodsResponse.json()
	} catch (error) {
		console.error("EventsZone: Failed to load data:", error)
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

// Efficient overlap detection - stack events vertically when they overlap
// Pre-calculate all event positions to avoid recursive calls
const eventPositions = $derived(() => {
	const positions: { x: number; y: number }[] = []
	const baseY = 20
	const eventHeight = 80
	const verticalSpacing = 25
	
	visibleEvents.forEach((event, index) => {
		const currentX = getEventPosition(event.date)
		let maxY = baseY
		
		// Check if this event overlaps with any previous events
		for (let i = 0; i < index; i++) {
			const prevX = positions[i].x
			const prevY = positions[i].y
			
			// Check for horizontal overlap (approximate event width of 200px)
			const horizontalOverlap = 
				currentX < prevX + 200 + verticalSpacing &&
				currentX + 200 + verticalSpacing > prevX
			
			if (horizontalOverlap) {
				// Stack this event above the overlapping event
				const stackY = prevY + eventHeight + verticalSpacing
				maxY = Math.max(maxY, stackY)
			}
		}
		
		positions.push({ x: currentX, y: maxY })
	})
	
	return positions
})

function getEventYPosition(eventIndex: number): number {
	return eventPositions()[eventIndex]?.y ?? 20
}

// Get current language
const language = $derived($currentLanguage)
</script>

<div class="w-full flex-[4] bg-slate-300 border-b border-slate-200 overflow-hidden relative">
	
	{#if isLoading}
		<!-- Loading state -->
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="text-gray-500">Loading events...</div>
		</div>
	{:else}
		<!-- Events will be rendered here -->
		{#each visibleEvents as event, index}
			<div 
				class="absolute bg-white rounded-lg shadow-lg p-4 max-w-xs border border-gray-200 hover:shadow-xl transition-shadow cursor-pointer z-10"
				style="transform: translateX({getEventPosition(event.date)}px); bottom: {getEventYPosition(index)}px;"
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
				<div class="absolute bottom-0 left-0 translate-y-full w-px bg-blue-500" style="height: {getEventYPosition(index) + 8}px;"></div>
			</div>
		{/each}
	{/if}
	

</div>
