<script lang="ts">
import { onMount } from "svelte"
import { fetchEvents, fetchGeologicalPeriods } from "$lib/api"
import EventCard from "$lib/components/main/content/events/EventCard.svelte"
import GeologicalPeriodCard from "$lib/components/main/content/GeologicalPeriodCard.svelte"
import GeologicalPeriodPopover from "$lib/components/main/content/GeologicalPeriodPopover.svelte"
import TimelineGrid from "$lib/components/main/content/TimelineGrid.svelte"
import { GEOLOGICAL_PERIODS_BACKGROUND_HEIGHT_RATIO } from "$lib/constants"
import { displaySettings } from "$lib/stores/displayStore"
import { currentLocale } from "$lib/stores/localeStore"
import type { Event, GeologicalPeriod } from "$lib/types"
import { buildEventLayouts } from "$lib/utils/eventLayout"
import { getEventDateRange, isEventRangeVisible } from "$lib/utils/eventSpan"
import { buildVisibleGeologicalPeriodLayouts } from "$lib/utils/geologicalPeriodLayout"
import { getMaxGeologicalPeriodDepth } from "$lib/utils/geologicalPeriodVisibility"

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
let contentZoneElement: HTMLDivElement | undefined = $state()
let contentZoneHeight = $state(0)
let contentHeight = $state(0)

let events: Event[] = $state([])
let geologicalPeriods: GeologicalPeriod[] = $state([])
let isLoading = $state(true)

let topCardType = $state<"event" | "geologicalPeriod" | null>(null)
let topCardEventId = $state<number | null>(null)
let topCardGeologicalPeriodId = $state<number | null>(null)
let hoveredCardEventId = $state<number | null>(null)
let hoveredGeologicalPeriodId = $state<number | null>(null)

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
	if (!contentZoneElement) return

	const observer = new ResizeObserver(() => {
		contentZoneHeight = contentZoneElement?.clientHeight ?? 0
	})
	observer.observe(contentZoneElement)
	contentZoneHeight = contentZoneElement.clientHeight

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

const geologicalPeriodStripHeight = $derived(
	Math.round(contentZoneHeight * GEOLOGICAL_PERIODS_BACKGROUND_HEIGHT_RATIO),
)

const geologicalPeriodStripOffsetFromTop = 0

const maxGeologicalPeriodDepth = $derived(
	getMaxGeologicalPeriodDepth(viewportYearSpan, leftEdgeYear, rightEdgeYear),
)

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
		zoneHeight: contentZoneHeight,
	}),
)

const visibleGeologicalPeriodLayouts = $derived(
	buildVisibleGeologicalPeriodLayouts(
		geologicalPeriods,
		leftEdgeYear,
		rightEdgeYear,
		$displaySettings.showGeologicalPeriods ? maxGeologicalPeriodDepth : null,
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

function handleGeologicalPeriodHover(geologicalPeriodId: number | null) {
	hoveredGeologicalPeriodId = geologicalPeriodId
}

export function deselectCards() {
	topCardType = null
	topCardEventId = null
	topCardGeologicalPeriodId = null
}

const messages = {
	en: {
		loading: "Loading...",
	},
	fr: {
		loading: "Chargement...",
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
		<div bind:this={contentZoneElement} class="absolute inset-x-0 top-0 bottom-[1em]">
			{#if $displaySettings.showGeologicalPeriods && visibleGeologicalPeriodLayouts.length > 0}
				<div
					class="absolute inset-x-0 top-0 overflow-hidden"
					style="height: {geologicalPeriodStripHeight}px"
				>
					{#each visibleGeologicalPeriodLayouts as layout (layout.id)}
						<GeologicalPeriodCard
							{layout}
							zoneHeight={geologicalPeriodStripHeight}
							{leftEdgeYear}
							{rightEdgeYear}
							{yearsPerPixel}
							layer="background"
							isTopCard={topCardType === "geologicalPeriod" &&
								topCardGeologicalPeriodId === layout.id}
							isHovered={hoveredGeologicalPeriodId === layout.id}
							onCardClick={handleGeologicalPeriodClick}
							onPointerEnter={() => handleGeologicalPeriodHover(layout.id)}
							onPointerLeave={() => handleGeologicalPeriodHover(null)}
						/>
					{/each}
				</div>
			{/if}

			<div class="absolute inset-0 overflow-hidden">
				<div class="absolute inset-0 z-0">
					{#each eventLayouts as layout (`${layout.event.id}-background`)}
						<EventCard
							{layout}
							layer="background"
							zoneHeight={contentZoneHeight}
							isTopCard={topCardType === "event" &&
								topCardEventId === layout.event.id}
							isHovered={hoveredCardEventId === layout.event.id}
							onCardClick={handleEventClick}
							onCardHover={handleEventHover}
						/>
					{/each}
				</div>

				<div class="absolute inset-0 z-10">
					{#each eventLayouts as layout (layout.event.id)}
						<EventCard
							{layout}
							layer="foreground"
							zoneHeight={contentZoneHeight}
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
				zoneHeight={geologicalPeriodStripHeight}
				zoneOffsetFromTop={geologicalPeriodStripOffsetFromTop}
				{contentHeight}
				{leftEdgeYear}
				{rightEdgeYear}
				{yearsPerPixel}
				{viewportWidth}
			/>
		{/if}
	{/if}
</div>
