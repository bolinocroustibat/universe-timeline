<script lang="ts">
import { onMount } from "svelte"
import EventCard from "$lib/components/main/content/EventCard.svelte"
import PeriodCard from "$lib/components/main/content/PeriodCard.svelte"
import { displaySettings } from "$lib/stores/displayStore"
import type { Event, Period } from "$lib/types"

interface Props {
	viewportWidth: number
	yearsPerPixel: number
	leftEdgeYear: number
	rightEdgeYear: number
}

let { viewportWidth, yearsPerPixel, leftEdgeYear, rightEdgeYear }: Props =
	$props()

// Load events and periods from JSON files
let events: Event[] = $state([])
let periods: Period[] = $state([])
let isLoading = $state(true)

// Track which card is on top (type and index)
let topCardType = $state<"event" | "period" | null>(null)
let topCardIndex = $state<number | null>(null)

// Load events and periods on component mount
onMount(async () => {
	try {
		// Load both events and periods in parallel
		const [eventsResponse, periodsResponse] = await Promise.all([
			fetch("/events.jsonc"),
			fetch("/periods.jsonc"),
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

// Filter periods that are visible and have parentPeriodId = 0
const visiblePeriods = $derived(
	periods.filter((period) => {
		return (
			period.parentPeriodId === 0 &&
			period.end >= leftEdgeYear &&
			period.start <= rightEdgeYear
		)
	}),
)

// Simple vertical positioning - all events at the same level
function getEventYPosition(): number {
	return 20
}

// Handle card click to bring it to top
function handleEventClick(_eventId: number, index: number) {
	console.log(
		"Content: Event card clicked, setting topCardType to event, index to:",
		index,
	)
	topCardType = "event"
	topCardIndex = index
}

function handlePeriodClick(_periodId: number, index: number) {
	console.log(
		"Content: Period card clicked, setting topCardType to period, index to:",
		index,
	)
	topCardType = "period"
	topCardIndex = index
}

// Handle deselecting cards when clicking outside
function handleCardDeselect() {
	console.log("Content: Deselecting all cards")
	topCardType = null
	topCardIndex = null
}
</script>

<div class="w-full flex-[4] bg-slate-300 border-b border-slate-200 overflow-hidden relative">
	
	{#if isLoading}
		<!-- Loading state -->
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="text-gray-500">Loading events...</div>
		</div>
	{:else}
		<!-- Events are rendered here -->
		{#if $displaySettings.showEvents}
			{#each visibleEvents as event, index}
				<EventCard 
					event={event}
					leftEdgeYear={leftEdgeYear}
					yearsPerPixel={yearsPerPixel}
					viewportWidth={viewportWidth}
					yPosition={getEventYPosition()}
					index={index}
					isTopCard={topCardType === 'event' && topCardIndex === index}
					onCardClick={handleEventClick}
					onCardDeselect={handleCardDeselect}
				/>
			{/each}
		{:else}
			<!-- Events are hidden -->
			<div class="absolute inset-0 flex items-center justify-center">
				<div class="text-gray-500">Events are hidden</div>
			</div>
		{/if}
		
		<!-- Periods are rendered here -->
		{#if $displaySettings.showPeriods}
			{#each visiblePeriods as period, index}
				<PeriodCard 
					period={period}
					leftEdgeYear={leftEdgeYear}
					rightEdgeYear={rightEdgeYear}
					yearsPerPixel={yearsPerPixel}
					viewportWidth={viewportWidth}
					index={index}
					isTopCard={topCardType === 'period' && topCardIndex === index}
					leftPeriod={index > 0 ? visiblePeriods[index - 1] : null}
					rightPeriod={index < visiblePeriods.length - 1 ? visiblePeriods[index + 1] : null}
					onCardClick={handlePeriodClick}
					onCardDeselect={handleCardDeselect}
				/>
			{/each}
		{/if}
	{/if}

</div>
