<script lang="ts">
import { env } from "$env/dynamic/public"
import { TIME_CONSTANTS, ZOOM_SCALES } from "$lib/constants"
import { zoomLevel } from "$lib/stores/zoomStore"
import { formatYear } from "$lib/utils/formatters"
import { onMount } from "svelte"
import DebugInfo from "./main/DebugInfo.svelte"

// New: Viewport tracking
let containerElement: HTMLDivElement = $state()
let scrollLeft = $state(0)
let viewportWidth = $state(0)

// Track scroll position and viewport width
onMount(() => {
	const observer = new ResizeObserver((entries) => {
		viewportWidth = entries[0].contentRect.width
	})

	observer.observe(containerElement)

	return () => observer.disconnect()
})

function handleScroll(e: Event) {
	scrollLeft = (e.target as HTMLDivElement).scrollLeft
}

// Calculate base measurements based on viewport
let currentScale = $derived(
	ZOOM_SCALES.find((scale) => scale.level === $zoomLevel) ?? ZOOM_SCALES[4],
)
// Calculate how many years are represented by one pixel
let yearsPerPixel = $derived(currentScale.viewportYearSpan / viewportWidth)
// Calculate years per major tick (always factor of 10)
let yearsPerMajorTick = $derived(
	10 ** Math.ceil(Math.log10(currentScale.viewportYearSpan / 10)),
)
// Calculate how many pixels between major ticks
let pixelsBetweenMajorTicks = $derived(yearsPerMajorTick / yearsPerPixel)
// Calculate total number of major ticks needed
let totalYears = $derived(TIME_CONSTANTS.END_YEAR - TIME_CONSTANTS.START_YEAR)
let numberOfMajorTicks = $derived(Math.ceil(totalYears / yearsPerMajorTick) + 1)
// Generate major ticks array
let majorTicks = $derived(
	Array.from({ length: numberOfMajorTicks }, (_, i) => {
		const year = Math.min(
			TIME_CONSTANTS.START_YEAR + i * yearsPerMajorTick,
			TIME_CONSTANTS.END_YEAR,
		)
		return {
			year,
			position: (year - TIME_CONSTANTS.START_YEAR) / yearsPerPixel,
		}
	}),
)
// Calculate visible range
let visibleStartIndex = $derived(
	Math.max(0, Math.floor(scrollLeft / pixelsBetweenMajorTicks) - 2),
)
let visibleEndIndex = $derived(
	Math.min(
		numberOfMajorTicks,
		Math.ceil((scrollLeft + viewportWidth) / pixelsBetweenMajorTicks) + 2,
	),
)
// Generate only visible ticks
let visibleMajorTicks = $derived(
	majorTicks.slice(visibleStartIndex, visibleEndIndex),
)
// Calculate visible years from indices
let visibleStartYear = $derived(majorTicks[visibleStartIndex]?.year)
let visibleEndYear = $derived(majorTicks[visibleEndIndex - 1]?.year)
</script>

<main class="min-h-screen pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
	{#if env.PUBLIC_DEBUG === "true"}
		<DebugInfo
			viewportYearSpan={currentScale.viewportYearSpan}
			{yearsPerPixel}
			{yearsPerMajorTick}
			{viewportWidth}
			{scrollLeft}
			{visibleStartIndex}
			{visibleEndIndex}
			{visibleStartYear}
			{visibleEndYear}
		/>
	{/if}

	<div 
		bind:this={containerElement}
		onscroll={handleScroll}
		class="fixed bottom-12 left-0 right-0 h-24 bg-white border-t border-gray-200 overflow-x-auto"
	>

	<div 
		class="h-full relative"
		style="width: {Math.ceil(totalYears / yearsPerPixel)}px"
	>
		{#each visibleMajorTicks as tick}
			<div 
			class="absolute top-0 h-full flex flex-col items-center"
			style="left: {tick.position}px"
			>
			<!-- Major tick -->
			<div class="h-1/3 w-0.5 bg-gray-400"></div>
			
			<!-- Year label -->
			<span class="text-xs text-gray-600 mt-1">{formatYear(tick.year, "fr")}</span>
			</div>
		{/each}
	</div>
  </div>
</main>
