<script lang="ts">
import { onMount } from "svelte"
import EventCard from "$lib/components/main/content/EventCard.svelte"
import GeologicalPeriodCard from "$lib/components/main/content/GeologicalPeriodCard.svelte"
import GeologicalPeriodPopover from "$lib/components/main/content/GeologicalPeriodPopover.svelte"
import TimelineGrid from "$lib/components/main/content/TimelineGrid.svelte"
import { GEOLOGICAL_PERIODS_ZONE_HEIGHT_RATIO } from "$lib/constants"
import { displaySettings } from "$lib/stores/displayStore"
import { currentLocale } from "$lib/stores/localeStore"
import type { Event, GeologicalPeriod } from "$lib/types"
import { buildVisibleGeologicalPeriodLayouts } from "$lib/utils/geologicalPeriodLayout"

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

let contentElement: HTMLDivElement | undefined = $state()
let geologicalPeriodsZoneElement: HTMLDivElement | undefined = $state()
let geologicalPeriodsZoneHeight = $state(0)
let contentHeight = $state(0)

// Load events and geological periods from JSON files
let events: Event[] = $state([])
let geologicalPeriods: GeologicalPeriod[] = $state([])
let isLoading = $state(true)

let topCardType = $state<"event" | "geologicalPeriod" | null>(null)
let topCardEventId = $state<number | null>(null)
let topCardGeologicalPeriodId = $state<number | null>(null)
let hoveredCardEventId = $state<number | null>(null)

// Load events and geological periods on component mount
onMount(async () => {
	try {
		const [eventsResponse, geologicalPeriodsResponse] = await Promise.all([
			fetch("/events.jsonc"),
			fetch("/geologicalPeriods.jsonc"),
		])

		if (!eventsResponse.ok) {
			throw new Error(`HTTP error! status: ${eventsResponse.status}`)
		}
		if (!geologicalPeriodsResponse.ok) {
			throw new Error(`HTTP error! status: ${geologicalPeriodsResponse.status}`)
		}

		events = await eventsResponse.json()
		geologicalPeriods = await geologicalPeriodsResponse.json()
	} catch (error) {
		console.error("Content: Failed to load data:", error)
	} finally {
		isLoading = false
	}
})

$effect(() => {
	if (!geologicalPeriodsZoneElement) return

	const observer = new ResizeObserver(() => {
		geologicalPeriodsZoneHeight =
			geologicalPeriodsZoneElement?.clientHeight ?? 0
	})
	observer.observe(geologicalPeriodsZoneElement)
	geologicalPeriodsZoneHeight = geologicalPeriodsZoneElement.clientHeight

	return () => observer.disconnect()
})

$effect(() => {
	if (!contentElement) return

	const observer = new ResizeObserver(() => {
		contentHeight = contentElement?.clientHeight ?? 0
	})
	observer.observe(contentElement)
	contentHeight = contentElement.clientHeight

	return () => observer.disconnect()
})

// Filter events that are visible in the current viewport
const visibleEvents = $derived(
	events.filter((event) => {
		return event.date >= leftEdgeYear && event.date <= rightEdgeYear
	}),
)

const visibleGeologicalPeriodLayouts = $derived(
	buildVisibleGeologicalPeriodLayouts(
		geologicalPeriods,
		leftEdgeYear,
		rightEdgeYear,
	),
)

const selectedGeologicalPeriodLayout = $derived(
	topCardType === "geologicalPeriod" && topCardGeologicalPeriodId != null
		? (visibleGeologicalPeriodLayouts.find(
				(layout) => layout.id === topCardGeologicalPeriodId,
			) ?? null)
		: null,
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

function handleGeologicalPeriodClick(geologicalPeriodId: number) {
	topCardType = "geologicalPeriod"
	topCardGeologicalPeriodId = geologicalPeriodId
}

export function deselectCards() {
	topCardType = null
	topCardEventId = null
	topCardGeologicalPeriodId = null
}

const messages = {
	en: {
		loading: "Loading...",
		eventsHidden: "Events are hidden.",
		geologicalPeriodsHidden: "Geological periods are hidden.",
		eventsAndGeologicalPeriodsHidden:
			"Events and geological periods are hidden.",
	},
	fr: {
		loading: "Chargement...",
		eventsHidden: "Les événements sont masqués.",
		geologicalPeriodsHidden: "Les périodes géologiques sont masquées.",
		eventsAndGeologicalPeriodsHidden:
			"Les événements et les périodes géologiques sont masqués.",
	},
}
</script>

<div
	bind:this={contentElement}
	class="w-full flex-1 bg-background overflow-hidden relative text-xs"
>
	<TimelineGrid
		{zoomLevel}
		{viewportWidth}
		{viewportYearSpan}
		{yearsPerPixel}
		{leftEdgeYear}
		{rightEdgeYear}
	/>

	{#if isLoading}
		<div
			class="absolute inset-x-0 top-0 bottom-[1em] flex items-center justify-center"
		>
			<div class="text-muted">{messages[$currentLocale].loading}</div>
		</div>
	{:else}
		{#if !$displaySettings.showEvents && !$displaySettings.showGeologicalPeriods}
			<div
				class="absolute inset-x-0 top-0 bottom-[1em] flex items-center justify-center"
			>
				<div class="text-muted">
					{messages[$currentLocale].eventsAndGeologicalPeriodsHidden}
				</div>
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
				<div
					class="absolute inset-x-0 top-0 bottom-[1em] flex items-center justify-center"
				>
					<div class="text-muted">{messages[$currentLocale].eventsHidden}</div>
				</div>
			{/if}
			<div class="absolute inset-x-0 top-0 bottom-[1em]">
				<div
					bind:this={geologicalPeriodsZoneElement}
					class="absolute top-0 left-0 right-0 overflow-hidden"
					style="height: {GEOLOGICAL_PERIODS_ZONE_HEIGHT_RATIO * 100}%"
				>
					{#if $displaySettings.showGeologicalPeriods}
						{#each visibleGeologicalPeriodLayouts as layout (layout.id)}
							<GeologicalPeriodCard
								{layout}
								zoneHeight={geologicalPeriodsZoneHeight}
								leftEdgeYear={leftEdgeYear}
								rightEdgeYear={rightEdgeYear}
								yearsPerPixel={yearsPerPixel}
								isTopCard={topCardType === "geological_period" &&
									topCardGeologicalPeriodId === layout.id}
								onCardClick={handleGeologicalPeriodClick}
							/>
						{/each}
					{:else}
						<div class="absolute inset-0 flex items-center justify-center">
							<div class="text-muted">
								{messages[$currentLocale].geologicalPeriodsHidden}
							</div>
						</div>
					{/if}
				</div>
			</div>
			{#if selectedGeologicalPeriodLayout && $displaySettings.showGeologicalPeriods}
				<GeologicalPeriodPopover
					layout={selectedGeologicalPeriodLayout}
					zoneHeight={geologicalPeriodsZoneHeight}
					{contentHeight}
					{leftEdgeYear}
					{rightEdgeYear}
					{yearsPerPixel}
					{viewportWidth}
				/>
			{/if}
		{/if}
	{/if}
</div>
