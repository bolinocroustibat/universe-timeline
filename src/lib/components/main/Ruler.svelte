<script lang="ts">
import { TIME_CONSTANTS, ZOOM_SCALES } from "$lib/constants"
import { zoomLevel } from "$lib/stores/zoomStore"
import { formatYear } from "$lib/utils/formatters"
import { onMount } from "svelte"

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
let yearsPerPixel = $derived(currentScale.visibleYears / viewportWidth)
// Calculate years per major tick (always factor of 10)
let yearsPerMajorTick = $derived(
	10 ** Math.ceil(Math.log10(currentScale.visibleYears / 10)),
)
// Calculate how many pixels between major ticks
let pixelsBetweenMajorTicks = $derived(yearsPerMajorTick / yearsPerPixel)
// Calculate total number of major ticks needed
let totalYears = $derived(TIME_CONSTANTS.END_YEAR - TIME_CONSTANTS.START_YEAR)
let numberOfMajorTicks = $derived(Math.ceil(totalYears / yearsPerMajorTick))
// Generate major ticks array
let majorTicks = $derived(
	Array.from({ length: numberOfMajorTicks }, (_, i) => {
		const year = TIME_CONSTANTS.START_YEAR + i * yearsPerMajorTick
		return {
			year,
			position: i * pixelsBetweenMajorTicks,
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
// Calculate visible years range
let visibleStartYear = $derived(
	TIME_CONSTANTS.START_YEAR + visibleStartIndex * yearsPerMajorTick,
)
let visibleEndYear = $derived(
	TIME_CONSTANTS.START_YEAR + visibleEndIndex * yearsPerMajorTick,
)
</script>

<div 
  bind:this={containerElement}
  onscroll={handleScroll}
  class="fixed bottom-12 left-0 right-0 h-12 bg-white border-t border-gray-200 overflow-x-auto"
>
  <!-- Debug info -->
  <div class="absolute top-0 left-4 text-red-500 text-xs">
    Visible Years: {currentScale.visibleYears} | 
    Range: {visibleStartYear} - {visibleEndYear}
  </div>

  <div 
    class="h-full relative"
    style="width: {numberOfMajorTicks * pixelsBetweenMajorTicks}px"
  >
    {#each visibleMajorTicks as tick}
      <div 
        class="absolute bottom-0 flex flex-col items-center"
        style="left: {tick.position}px"
      >
        <!-- Major tick -->
        <div class="h-6 w-0.5 bg-gray-400"></div>
        
        <!-- Year label -->
        <span class="text-xs text-gray-600 mt-1">{formatYear(tick.year, "fr")}</span>

        <!-- Minor ticks -->
        {#each Array(TIME_CONSTANTS.TICKS_PER_MAJOR - 1) as _, i}
          <div 
            class="absolute bottom-6 h-2 w-0.5 bg-gray-300"
            style="left: {((i + 1) * pixelsBetweenMajorTicks/TIME_CONSTANTS.TICKS_PER_MAJOR)}px"
></div>
        {/each}
      </div>
    {/each}
  </div>
</div> 