<script lang="ts">
import { env } from "$env/dynamic/public"
import { TIME_CONSTANTS, ZOOM_SCALES } from "$lib/constants"
import { zoomLevel } from "$lib/stores/zoomStore"
import type { TimelineTick } from "$lib/types"
import { formatYear } from "$lib/utils/formatters"
import { onMount } from "svelte"
import DebugInfo from "./main/DebugInfo.svelte"

let containerElement: HTMLDivElement = $state()
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
let yearsPerMajorTick: number = $derived(
	10 ** Math.ceil(Math.log10(viewportYearSpan / 10)),
)

// Generate visible ticks based on current year position
let visibleMajorTicks: TimelineTick[] = $derived((() => {
	const startYear = TIME_CONSTANTS.START_YEAR + currentYearOffset
	const visibleYearSpan = viewportYearSpan + yearsPerMajorTick * 2 // Add buffer

	const startTick = Math.floor(startYear / yearsPerMajorTick)
	const endTick = Math.ceil((startYear + visibleYearSpan) / yearsPerMajorTick)
	
	return Array.from({ length: endTick - startTick }, (_, i) => {
		const tickYear = (startTick + i) * yearsPerMajorTick
		return {
			year: Math.max(TIME_CONSTANTS.START_YEAR, Math.min(tickYear, TIME_CONSTANTS.END_YEAR)),
			position: (tickYear - startYear) / yearsPerPixel
		} satisfies TimelineTick
	})
})())

let visibleStartYear = $derived(visibleMajorTicks[0]?.year)
let visibleEndYear = $derived(visibleMajorTicks[visibleMajorTicks.length - 1]?.year)

function handleMouseDown(e: MouseEvent) {
	isDragging = true
	startX = e.pageX
	containerElement.style.cursor = "grabbing"
}

function handleMouseMove(e: MouseEvent) {
	if (!isDragging) return
	e.preventDefault()
	
	const deltaX = e.pageX - startX
	currentYearOffset -= deltaX * yearsPerPixel
	startX = e.pageX
}

function handleMouseUp() {
	isDragging = false
	containerElement.style.cursor = "grab"
}

function handleMouseLeave() {
	if (isDragging) {
		isDragging = false
		containerElement.style.cursor = "grab"
	}
}

function handleWheel(e: WheelEvent) {
	e.preventDefault()
	currentYearOffset += e.deltaX * yearsPerPixel
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
						{formatYear(tick.year, "fr")}
					</span>
				</div>
			{/each}
		</div>
	</div>
</main>
