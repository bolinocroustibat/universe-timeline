<script lang="ts">
import { env } from "$env/dynamic/public"
import { TIME_CONSTANTS, ZOOM_SCALES } from "$lib/constants"
import { zoomLevel } from "$lib/stores/zoomStore"
import type { TimelineTick } from "$lib/types"
import { formatYear } from "$lib/utils/formatters"
import { onMount } from "svelte"
import DebugInfo from "./main/DebugInfo.svelte"

let containerElement: HTMLDivElement | undefined = $state()
let viewportWidth = $state(0)
let isDragging = $state(false)
let startX = $state(0)
// Track position in years instead of pixels
let currentYearOffset = $state(0)

// Track scroll position and viewport width
onMount(() => {
	const observer = new ResizeObserver((entries) => {
		viewportWidth = entries[0].contentRect.width
	})

	observer.observe(containerElement)

	return () => observer.disconnect()
})

// Calculate base measurements based on viewport
let currentScale = $derived(
	ZOOM_SCALES.find((scale) => scale.level === $zoomLevel) ?? ZOOM_SCALES[4],
)
let viewportYearSpan = $derived(currentScale.viewportYearSpan)
let yearsPerPixel: number = $derived(viewportYearSpan / viewportWidth)

// Calculate years per major tick based on zoom level
let yearsPerMajorTick: number = $derived(currentScale.tickInterval)

// Generate visible ticks based on current year position
let visibleMajorTicks: TimelineTick[] = $derived(
	(() => {
		const startYear = TIME_CONSTANTS.START_YEAR + currentYearOffset
		const visibleYearSpan = viewportYearSpan + yearsPerMajorTick * 2 // Add buffer

		const startTick = Math.floor(startYear / yearsPerMajorTick)
		const endTick = Math.ceil((startYear + visibleYearSpan) / yearsPerMajorTick)

		return Array.from({ length: endTick - startTick }, (_, i) => {
			const tickYear = (startTick + i) * yearsPerMajorTick
			const position = (tickYear - startYear) / yearsPerPixel
			
			// Only include ticks that are within the timeline boundaries
			if (tickYear >= TIME_CONSTANTS.START_YEAR && tickYear <= TIME_CONSTANTS.END_YEAR) {
				return {
					year: tickYear,
					position,
				} satisfies TimelineTick
			}
			return null
		}).filter((tick): tick is TimelineTick => tick !== null)
	})(),
)

let visibleStartYear = $derived(visibleMajorTicks[0]?.year)
let visibleEndYear = $derived(
	visibleMajorTicks[visibleMajorTicks.length - 1]?.year,
)

function handleMouseDown(e: MouseEvent) {
	isDragging = true
	startX = e.pageX
	containerElement.style.cursor = "grabbing"
	console.log("🖱️ Mouse down - starting drag")
}

function handleMouseMove(e: MouseEvent) {
	if (!isDragging) return
	e.preventDefault()

	const deltaX = e.pageX - startX
	const newYearOffset = currentYearOffset - deltaX * yearsPerPixel
	const newCurrentYear = TIME_CONSTANTS.START_YEAR + newYearOffset
	
	console.log("🖱️ Mouse move:", {
		deltaX,
		currentYearOffset,
		newYearOffset,
		currentYear: TIME_CONSTANTS.START_YEAR + currentYearOffset,
		newCurrentYear,
		END_YEAR: TIME_CONSTANTS.END_YEAR,
		isPastPresent: newCurrentYear > TIME_CONSTANTS.END_YEAR
	})
	
	// Special debug for dragging past present time
	if (newCurrentYear > TIME_CONSTANTS.END_YEAR) {
		console.log("🚨 DRAGGING PAST PRESENT TIME! Current year would be:", newCurrentYear)
	}
	
	// Apply boundary constraints
	if (newCurrentYear <= TIME_CONSTANTS.END_YEAR && newCurrentYear >= TIME_CONSTANTS.START_YEAR) {
		currentYearOffset = newYearOffset
		startX = e.pageX
	}
}

function handleMouseUp() {
	isDragging = false
	containerElement.style.cursor = "grab"
	console.log("🖱️ Mouse up - ending drag")
}

function handleMouseLeave() {
	if (isDragging) {
		isDragging = false
		containerElement.style.cursor = "grab"
		console.log("🖱️ Mouse leave - ending drag")
	}
}

function handleWheel(e: WheelEvent) {
	e.preventDefault()
	const newYearOffset = currentYearOffset + e.deltaX * yearsPerPixel
	const newCurrentYear = TIME_CONSTANTS.START_YEAR + newYearOffset
	
	console.log("🖱️ Wheel:", {
		deltaX: e.deltaX,
		currentYearOffset,
		newYearOffset,
		currentYear: TIME_CONSTANTS.START_YEAR + currentYearOffset,
		newCurrentYear,
		END_YEAR: TIME_CONSTANTS.END_YEAR,
		isPastPresent: newCurrentYear > TIME_CONSTANTS.END_YEAR
	})
	
	// Special debug for wheeling past present time
	if (newCurrentYear > TIME_CONSTANTS.END_YEAR) {
		console.log("🚨 WHEELING PAST PRESENT TIME! Current year would be:", newCurrentYear)
	}
	
	// Apply boundary constraints
	if (newCurrentYear <= TIME_CONSTANTS.END_YEAR && newCurrentYear >= TIME_CONSTANTS.START_YEAR) {
		currentYearOffset = newYearOffset
	}
}
</script>

<main class="min-h-screen pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
	{#if env.PUBLIC_DEBUG === "true"}
		<DebugInfo
			zoomLevel={$zoomLevel}
			{viewportYearSpan}
			{yearsPerPixel}
			{yearsPerMajorTick}
			{viewportWidth}
			currentYear={TIME_CONSTANTS.START_YEAR + currentYearOffset}
			{visibleStartYear}
			{visibleEndYear}
		/>
	{/if}

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div 
		bind:this={containerElement}
		onmousedown={handleMouseDown}
		onmousemove={handleMouseMove}
		onmouseup={handleMouseUp}
		onmouseleave={handleMouseLeave}
		onwheel={handleWheel}
		class="fixed bottom-12 left-0 right-0 h-24 bg-white border-t border-gray-200 overflow-hidden cursor-grab select-none"
	>
		<div class="h-full relative">
			{#each visibleMajorTicks as tick}
				<div 
					class="absolute top-0 h-full flex flex-col items-center"
					style="transform: translateX({tick.position}px)"
				>
					<div class="h-1/3 w-0.5 bg-gray-400"></div>
					<span class="text-xs text-gray-600 mt-1">
						{formatYear(tick.year, "fr", yearsPerMajorTick)}
					</span>
				</div>
			{/each}
		</div>
	</div>
</main>
