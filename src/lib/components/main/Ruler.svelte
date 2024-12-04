<script lang="ts">
import { TIME_CONSTANTS, ZOOM_SCALES } from "$lib/constants"
import { zoomLevel } from "$lib/stores/zoomStore"
import { formatYear } from "$lib/utils/formatters"
import { onMount } from 'svelte'

// Calculate base spacing between major ticks based on zoom level
$: baseSpacing = 100 + $zoomLevel * 20 // From 120px to 300px

// Get current scale based on zoom level
$: currentScale =
	ZOOM_SCALES.find((scale) => scale.level === $zoomLevel) ?? ZOOM_SCALES[4] // Default to middle zoom if not found

// Calculate total years and number of major ticks needed
$: totalYears = TIME_CONSTANTS.END_YEAR - TIME_CONSTANTS.START_YEAR
$: numberOfMajorTicks = Math.ceil(totalYears / currentScale.yearsPerMajorTick)

// Generate major ticks array
$: majorTicks = Array.from({ length: numberOfMajorTicks }, (_, i) => {
	const year = TIME_CONSTANTS.START_YEAR + i * currentScale.yearsPerMajorTick
	return {
		year,
		position: i * baseSpacing,
	}
})

// New: Viewport tracking
let containerElement: HTMLDivElement
let scrollLeft = 0
let viewportWidth = 0

// Track scroll position and viewport width
onMount(() => {
  const observer = new ResizeObserver(entries => {
    viewportWidth = entries[0].contentRect.width
  })
  
  observer.observe(containerElement)
  
  return () => observer.disconnect()
})

function handleScroll(e: Event) {
  scrollLeft = (e.target as HTMLDivElement).scrollLeft
}

// Calculate visible range
$: visibleStartIndex = Math.max(0, Math.floor(scrollLeft / baseSpacing) - 2)
$: visibleEndIndex = Math.min(
  numberOfMajorTicks,
  Math.ceil((scrollLeft + viewportWidth) / baseSpacing) + 2
)

// Generate only visible ticks
$: visibleMajorTicks = majorTicks.slice(visibleStartIndex, visibleEndIndex)
</script>

<div 
  bind:this={containerElement}
  on:scroll={handleScroll}
  class="fixed bottom-12 left-0 right-0 h-12 bg-white border-t border-gray-200 overflow-x-auto"
>
  <div 
    class="h-full relative"
    style="width: {numberOfMajorTicks * baseSpacing}px"
  >
    {#each visibleMajorTicks as tick}
      <div 
        class="absolute bottom-0 flex flex-col items-center"
        style="left: {tick.position}px"
      >
        <!-- Major tick -->
        <div class="h-6 w-0.5 bg-gray-400" />
        
        <!-- Year label -->
        <span class="text-xs text-gray-600 mt-1">{formatYear(tick.year, "fr")}</span>

        <!-- Minor ticks -->
        {#each Array(TIME_CONSTANTS.TICKS_PER_MAJOR - 1) as _, i}
          <div 
            class="absolute bottom-6 h-2 w-0.5 bg-gray-300"
            style="left: {((i + 1) * baseSpacing/TIME_CONSTANTS.TICKS_PER_MAJOR)}px"
          />
        {/each}
      </div>
    {/each}
  </div>
</div> 