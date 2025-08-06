<script lang="ts">
import type { Event, Period } from "$lib/types"
import { onMount } from "svelte"
import { displaySettings } from "$lib/stores/displayStore"
import EventCard from "./EventCard.svelte"

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

// Track which card is on top
let topCardIndex = $state<number | null>(null)

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

// Efficient overlap detection - stack events vertically when they overlap
// Pre-calculate all event positions to avoid recursive calls
const eventPositions = $derived(() => {
	const positions: { x: number; y: number }[] = []
	const baseY = 20
	const eventHeight = 80
	const verticalSpacing = 25
	
	visibleEvents.forEach((event, index) => {
		const currentX = (event.date - leftEdgeYear) / yearsPerPixel
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

// Handle card click to bring it to top
function handleCardClick(eventId: number, index: number) {
	console.log('EventsZone: Card clicked, setting topCardIndex to:', index)
	topCardIndex = index
}
</script>

<div class="w-full flex-[4] bg-slate-300 border-b border-slate-200 overflow-hidden relative">
	
	{#if isLoading}
		<!-- Loading state -->
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="text-gray-500">Loading events...</div>
		</div>
	{:else if $displaySettings.showEvents}
		<!-- Events are rendered here -->
		{#each visibleEvents as event, index}
			<EventCard 
				event={event}
				leftEdgeYear={leftEdgeYear}
				yearsPerPixel={yearsPerPixel}
				viewportWidth={viewportWidth}
				yPosition={getEventYPosition(index)}
				index={index}
				isTopCard={topCardIndex === index}
				onCardClick={handleCardClick}
			/>
		{/each}
	{:else}
		<!-- Events are hidden -->
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="text-gray-500">Events are hidden</div>
		</div>
	{/if}

</div>
