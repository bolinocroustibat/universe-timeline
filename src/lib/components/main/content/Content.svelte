<script lang="ts">
import { onMount } from "svelte"
import EventCard from "$lib/components/main/content/EventCard.svelte"
import PeriodCard from "$lib/components/main/content/PeriodCard.svelte"
import { PERIODS_ZONE_HEIGHT_RATIO } from "$lib/constants"
import { displaySettings } from "$lib/stores/displayStore"
import { currentLocale } from "$lib/stores/localeStore"
import type { Event, Period } from "$lib/types"
import { buildVisiblePeriodLayouts } from "$lib/utils/periodLayout"

interface Props {
	viewportWidth: number
	yearsPerPixel: number
	leftEdgeYear: number
	rightEdgeYear: number
}

let { viewportWidth, yearsPerPixel, leftEdgeYear, rightEdgeYear }: Props =
	$props()

let periodsZoneElement: HTMLDivElement | undefined = $state()
let periodsZoneHeight = $state(0)

// Load events and periods from JSON files
let events: Event[] = $state([])
let periods: Period[] = $state([])
let isLoading = $state(true)

// Track which card is on top (type, event id, or period id)
let topCardType = $state<"event" | "period" | null>(null)
let topCardEventId = $state<number | null>(null)
let topCardPeriodId = $state<number | null>(null)
let hoveredCardEventId = $state<number | null>(null)

// Load events and periods on component mount
onMount(async () => {
	try {
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

$effect(() => {
	if (!periodsZoneElement) return

	const observer = new ResizeObserver(() => {
		periodsZoneHeight = periodsZoneElement?.clientHeight ?? 0
	})
	observer.observe(periodsZoneElement)
	periodsZoneHeight = periodsZoneElement.clientHeight

	return () => observer.disconnect()
})

// Filter events that are visible in the current viewport
const visibleEvents = $derived(
	events.filter((event) => {
		return event.date >= leftEdgeYear && event.date <= rightEdgeYear
	}),
)

const visiblePeriodLayouts = $derived(
	buildVisiblePeriodLayouts(periods, leftEdgeYear, rightEdgeYear),
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

function handlePeriodClick(periodId: number) {
	if (topCardType === "period" && topCardPeriodId === periodId) {
		handleCardDeselect()
		return
	}

	topCardType = "period"
	topCardPeriodId = periodId
}

function handleCardDeselect() {
	topCardType = null
	topCardEventId = null
	topCardPeriodId = null
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
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="text-muted">{messages[$currentLocale].loading}</div>
		</div>
	{:else}
		{#if !$displaySettings.showEvents && !$displaySettings.showPeriods}
			<div class="absolute inset-0 flex items-center justify-center">
				<div class="text-muted">{messages[$currentLocale].eventsAndPeriodsHidden}</div>
			</div>
		{:else}
			{#if $displaySettings.showEvents}
				{#each visibleEvents as event, index}
					<EventCard
						event={event}
						leftEdgeYear={leftEdgeYear}
						yearsPerPixel={yearsPerPixel}
						viewportWidth={viewportWidth}
						yPosition={getEventYPosition()}
						index={index}
						isTopCard={topCardType === "event" && topCardEventId === event.id}
						isHovered={hoveredCardEventId === event.id}
						onCardClick={handleEventClick}
						onCardHover={handleEventHover}
					/>
				{/each}
			{:else}
				<div class="absolute inset-0 flex items-center justify-center">
					<div class="text-muted">{messages[$currentLocale].eventsHidden}</div>
				</div>
			{/if}
			<div
				bind:this={periodsZoneElement}
				class="absolute top-0 left-0 right-0 overflow-hidden"
				style="height: {PERIODS_ZONE_HEIGHT_RATIO * 100}%"
			>
				{#if $displaySettings.showPeriods}
					{#each visiblePeriodLayouts as layout (layout.id)}
						<PeriodCard
							{layout}
							zoneHeight={periodsZoneHeight}
							leftEdgeYear={leftEdgeYear}
							rightEdgeYear={rightEdgeYear}
							yearsPerPixel={yearsPerPixel}
							isTopCard={topCardType === "period" && topCardPeriodId === layout.id}
							onCardClick={handlePeriodClick}
						/>
					{/each}
				{:else}
					<div class="absolute inset-0 flex items-center justify-center">
						<div class="text-muted">{messages[$currentLocale].periodsHidden}</div>
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</div>
