<script lang="ts">
import { onMount } from "svelte"
import { fetchEvents, fetchGeologicalPeriods } from "$lib/api"
import EventCard from "$lib/components/main/content/events/EventCard.svelte"
import GeologicalPeriodCard from "$lib/components/main/content/GeologicalPeriodCard.svelte"
import GeologicalPeriodPopover from "$lib/components/main/content/GeologicalPeriodPopover.svelte"
import TimelineGrid from "$lib/components/main/content/TimelineGrid.svelte"
import {
	EVENTS_ZONE_HEIGHT_RATIO,
	GEOLOGICAL_PERIODS_ZONE_HEIGHT_RATIO,
} from "$lib/constants"
import { displaySettings } from "$lib/stores/displayStore"
import { currentLocale } from "$lib/stores/localeStore"
import type { Event, GeologicalPeriod } from "$lib/types"
import { buildEventLayouts } from "$lib/utils/eventLayout"
import { getEventDateRange, isEventRangeVisible } from "$lib/utils/eventSpan"
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
let eventsZoneElement: HTMLDivElement | undefined = $state()
let geologicalPeriodsZoneHeight = $state(0)
let eventsZoneHeight = $state(0)
let contentHeight = $state(0)

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
		const [loadedEvents, loadedGeologicalPeriods] = await Promise.all([
			fetchEvents(),
			fetchGeologicalPeriods(),
		])

		events = loadedEvents
		geologicalPeriods = loadedGeologicalPeriods
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
	if (!eventsZoneElement) return

	const observer = new ResizeObserver(() => {
		eventsZoneHeight = eventsZoneElement?.clientHeight ?? 0
	})
	observer.observe(eventsZoneElement)
	eventsZoneHeight = eventsZoneElement.clientHeight

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

const visibleEvents = $derived(
	events.filter((event) =>
		isEventRangeVisible(getEventDateRange(event), leftEdgeYear, rightEdgeYear),
	),
)

const eventLayouts = $derived(
	buildEventLayouts({
		events: visibleEvents,
		leftEdgeYear,
		rightEdgeYear,
		yearsPerPixel,
		viewportWidth,
		zoneHeight: eventsZoneHeight,
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

function handleEventClick(eventId: number) {
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
		geologicalPeriodsHidden: "Geological periods are hidden.",
	},
	fr: {
		loading: "Chargement...",
		geologicalPeriodsHidden: "Les périodes géologiques sont masquées.",
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
							{leftEdgeYear}
							{rightEdgeYear}
							{yearsPerPixel}
							isTopCard={topCardType === "geologicalPeriod" &&
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

			<div
				bind:this={eventsZoneElement}
				class="absolute bottom-0 left-0 right-0 overflow-hidden"
				style="height: {EVENTS_ZONE_HEIGHT_RATIO * 100}%"
			>
				<!-- Uncertainty visuals (period spans, range bars, point ticks) sit behind cards. -->
				<div class="absolute inset-0 z-0">
					{#each eventLayouts as layout (`${layout.event.id}-background`)}
						<EventCard
							{layout}
							layer="background"
							zoneHeight={eventsZoneHeight}
							isTopCard={topCardType === "event" &&
								topCardEventId === layout.event.id}
							isHovered={hoveredCardEventId === layout.event.id}
							onCardClick={handleEventClick}
							onCardHover={handleEventHover}
						/>
					{/each}
				</div>

				<!-- Cards and the active event's own uncertainty visuals render in front. -->
				<div class="absolute inset-0 z-10">
					{#each eventLayouts as layout (layout.event.id)}
						<EventCard
							{layout}
							layer="foreground"
							zoneHeight={eventsZoneHeight}
							isTopCard={topCardType === "event" &&
								topCardEventId === layout.event.id}
							isHovered={hoveredCardEventId === layout.event.id}
							onCardClick={handleEventClick}
							onCardHover={handleEventHover}
						/>
					{/each}
				</div>
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
</div>
