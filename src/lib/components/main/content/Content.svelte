<script lang="ts">
import { onMount } from "svelte"
import EventCard from "$lib/components/main/content/EventCard.svelte"
import PeriodCard from "$lib/components/main/content/PeriodCard.svelte"
import { displaySettings } from "$lib/stores/displayStore"
import { currentLocale } from "$lib/stores/localeStore"
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

// Track which card is on top (type, event id, or period index)
let topCardType = $state<"event" | "period" | null>(null)
let topCardEventId = $state<number | null>(null)
let topCardIndex = $state<number | null>(null)
let hoveredCardEventId = $state<number | null>(null)

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

function getEventYPosition(): number {
	return 20
}

function handleEventClick(eventId: number, _index: number) {
	topCardType = "event"
	topCardEventId = eventId
}

function handleEventHover(eventId: number | null) {
	hoveredCardEventId = eventId
}

function handlePeriodClick(_periodId: number, index: number) {
	topCardType = "period"
	topCardIndex = index
}

function handleCardDeselect() {
	topCardType = null
	topCardEventId = null
	topCardIndex = null
}

function handleContentClick(e: MouseEvent) {
	const target = e.target as Element
	if (
		target.closest("[data-event-card]") ||
		target.closest("[data-period-card]")
	) {
		return
	}
	handleCardDeselect()
}

const messages = {
	en: {
		loading: "Loading...",
		eventsHidden: "Events are hidden.",
		periodsHidden: "Periods are hidden.",
		eventsAndPeriodsHidden: "Events and periods are hidden.",
	},
	fr: {
		loading: "Chargement...",
		eventsHidden: "Les événements sont masqués.",
		periodsHidden: "Les périodes sont masquées.",
		eventsAndPeriodsHidden: "Les événements et les périodes sont masqués.",
	},
}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
	class="w-full flex-[4] bg-background border-b border-border overflow-hidden relative"
	onclick={handleContentClick}
>
	
	{#if isLoading}
		<!-- Loading state -->
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="text-muted">{messages[$currentLocale].loading}</div>
		</div>
	{:else}
		{#if !$displaySettings.showEvents && !$displaySettings.showPeriods}
			<!-- Events and periods are hidden -->
			<div class="absolute inset-0 flex items-center justify-center">
				<div class="text-muted">{messages[$currentLocale].eventsAndPeriodsHidden}</div>
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
						isTopCard={topCardType === 'event' && topCardEventId === event.id}
						isHovered={hoveredCardEventId === event.id}
						onCardClick={handleEventClick}
						onCardHover={handleEventHover}
					/>
				{/each}
			{:else}
				<!-- Events are hidden -->
				<div class="absolute inset-0 flex items-center justify-center">
					<div class="text-muted">{messages[$currentLocale].eventsHidden}</div>
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
					/>
				{/each}
			{:else}
				<!-- Periods are hidden -->
				<div class="absolute inset-0 flex items-center justify-center">
					<div class="text-muted">{messages[$currentLocale].periodsHidden}</div>
				</div>
			{/if}
		{/if}
	{/if}
</div>
