<script lang="ts">
import { env } from "$env/dynamic/public"
import DebugInfo from "$lib/components/main/DebugInfo.svelte"
import EventsZone from "$lib/components/main/EventsZone.svelte"
import TimelineZone from "$lib/components/main/TimelineZone.svelte"
import { TIME_CONSTANTS, ZOOM_SCALES } from "$lib/constants"
import { zoomLevel } from "$lib/stores/zoomStore"
import { onMount } from "svelte"

let containerElement: HTMLDivElement | undefined = $state()
let viewportWidth = $state(0)
let isDragging = $state(false)
let startX = $state(0)
// Current position (left edge of viewport)
let leftEdgeYearOffset = $state(0)

// Event debug data
let totalEvents = $state(0)
let visibleEvents = $state(0)
let isLoadingEvents = $state(true)

// Track scroll position and viewport width
onMount(() => {
	const observer = new ResizeObserver((entries) => {
		viewportWidth = entries[0].contentRect.width
	})

	if (containerElement) {
		observer.observe(containerElement)
	}

	// Listen for zoom requests from Zoom component
	const handleZoomRequest = (event: CustomEvent) => {
		const newZoomLevel = event.detail.zoomLevel
		performCenteredZoom(newZoomLevel)
	}

	window.addEventListener("zoom-request", handleZoomRequest as EventListener)

	return () => {
		observer.disconnect()
		window.removeEventListener(
			"zoom-request",
			handleZoomRequest as EventListener,
		)
	}
})

// Calculate base measurements based on viewport
let currentScale = $derived(
	ZOOM_SCALES.find((scale) => scale.level === $zoomLevel) ?? ZOOM_SCALES[4],
)
let viewportYearSpan = $derived(currentScale.viewportYearSpan)
let yearsPerPixel: number = $derived(viewportYearSpan / viewportWidth)

// Calculate the year at the center of the viewport
let centerYear = $derived(
	TIME_CONSTANTS.START_YEAR +
		leftEdgeYearOffset +
		(viewportWidth * yearsPerPixel) / 2,
)

// Calculate years per major tick based on zoom level (for debug info)
let majorTickInterval: number = $derived(currentScale.majorTickInterval)
let minorTickInterval: number = $derived(currentScale.minorTickInterval)

// Calculate viewport boundaries
let leftEdgeYear = $derived(TIME_CONSTANTS.START_YEAR + leftEdgeYearOffset)
let rightEdgeYear = $derived(
	TIME_CONSTANTS.START_YEAR +
		leftEdgeYearOffset +
		viewportWidth * yearsPerPixel,
)

function handleMouseDown(e: MouseEvent) {
	if (!containerElement) return
	isDragging = true
	startX = e.pageX
	containerElement.style.cursor = "grabbing"
}

function handleMouseMove(e: MouseEvent) {
	if (!isDragging) return
	e.preventDefault()

	const deltaX = e.pageX - startX
	const newLeftEdgeYearOffset = leftEdgeYearOffset - deltaX * yearsPerPixel
	const newLeftEdgeYear = TIME_CONSTANTS.START_YEAR + newLeftEdgeYearOffset
	const newRightEdgeYear = newLeftEdgeYear + viewportWidth * yearsPerPixel

	// Apply boundary constraints - check both left and right edges
	if (
		newRightEdgeYear <= TIME_CONSTANTS.END_YEAR &&
		newLeftEdgeYear >= TIME_CONSTANTS.START_YEAR
	) {
		leftEdgeYearOffset = newLeftEdgeYearOffset
		startX = e.pageX
	}
}

function handleMouseUp() {
	if (!containerElement) return
	isDragging = false
	containerElement.style.cursor = "grab"
}

function handleMouseLeave() {
	if (isDragging && containerElement) {
		isDragging = false
		containerElement.style.cursor = "grab"
	}
}

function handleWheel(e: WheelEvent) {
	e.preventDefault()
	if (!containerElement) return

	// Get mouse cursor position relative to the container
	const rect = containerElement.getBoundingClientRect()
	const mouseX = e.clientX - rect.left

	// Calculate the year at the mouse cursor position
	const leftEdgeYear = TIME_CONSTANTS.START_YEAR + leftEdgeYearOffset
	const mouseCursorYear = leftEdgeYear + mouseX * yearsPerPixel

	// Handle mousewheel up/down for zooming
	if (e.deltaY !== 0) {
		const zoomDirection = e.deltaY > 0 ? -1 : 1 // Positive deltaY = mouseWheelDown = zoom out
		const newZoomLevel = Math.max(1, Math.min(15, $zoomLevel + zoomDirection))

		if (newZoomLevel !== $zoomLevel) {
			performCenteredZoom(newZoomLevel, mouseCursorYear)
		}
	}

	// Handle pinch-to-zoom on trackpad
	if (e.deltaZ !== 0) {
		const pinchDirection = e.deltaZ > 0 ? 1 : -1 // Positive deltaZ = pinch out = zoom in
		const newZoomLevel = Math.max(1, Math.min(15, $zoomLevel + pinchDirection))

		if (newZoomLevel !== $zoomLevel) {
			performCenteredZoom(newZoomLevel, mouseCursorYear)
		}
	}

	// Handle horizontal scrolling (existing functionality)
	const newLeftEdgeYearOffset = leftEdgeYearOffset + e.deltaX * yearsPerPixel
	const newLeftEdgeYear = TIME_CONSTANTS.START_YEAR + newLeftEdgeYearOffset
	const newRightEdgeYear = newLeftEdgeYear + viewportWidth * yearsPerPixel

	// Apply boundary constraints - check both left and right edges
	if (
		newRightEdgeYear <= TIME_CONSTANTS.END_YEAR &&
		newLeftEdgeYear >= TIME_CONSTANTS.START_YEAR
	) {
		leftEdgeYearOffset = newLeftEdgeYearOffset
	}
}

// Function to perform centered zooming
function performCenteredZoom(newZoomLevel: number, targetCenterYear?: number) {
	const oldCenterYear = targetCenterYear ?? centerYear

	// Update zoom level
	$zoomLevel = newZoomLevel

	// Calculate new viewport span and years per pixel
	const newScale =
		ZOOM_SCALES.find((scale) => scale.level === newZoomLevel) ?? ZOOM_SCALES[4]
	const newViewportYearSpan = newScale.viewportYearSpan
	const newYearsPerPixel = newViewportYearSpan / viewportWidth

	// Calculate new left edge offset to maintain target center year
	const newLeftEdgeYearOffset =
		oldCenterYear -
		TIME_CONSTANTS.START_YEAR -
		(viewportWidth * newYearsPerPixel) / 2

	// Apply boundary constraints
	const newLeftEdgeYear = TIME_CONSTANTS.START_YEAR + newLeftEdgeYearOffset
	const newRightEdgeYear = newLeftEdgeYear + viewportWidth * newYearsPerPixel

	if (
		newRightEdgeYear <= TIME_CONSTANTS.END_YEAR &&
		newLeftEdgeYear >= TIME_CONSTANTS.START_YEAR
	) {
		leftEdgeYearOffset = newLeftEdgeYearOffset
	} else {
		// If boundary constraints would be violated, adjust to fit within bounds
		if (newRightEdgeYear > TIME_CONSTANTS.END_YEAR) {
			// Adjust to keep right edge at END_YEAR
			leftEdgeYearOffset =
				TIME_CONSTANTS.END_YEAR -
				TIME_CONSTANTS.START_YEAR -
				viewportWidth * newYearsPerPixel
		} else if (newLeftEdgeYear < TIME_CONSTANTS.START_YEAR) {
			// Adjust to keep left edge at START_YEAR
			leftEdgeYearOffset = 0
		}
	}
}
</script>

<main 
	class="flex-1 w-full overflow-hidden flex flex-col"
	onwheel={handleWheel}
>

	
	{#if env.PUBLIC_DEBUG === "true"}
		<DebugInfo
			zoomLevel={$zoomLevel}
			{viewportYearSpan}
			{yearsPerPixel}
			majorTickInterval={majorTickInterval}
			minorTickInterval={minorTickInterval}
			{viewportWidth}
			{leftEdgeYear}
			{rightEdgeYear}
			leftEdgeYearOffset={leftEdgeYearOffset}
			{centerYear}
			isPastPresent={rightEdgeYear > TIME_CONSTANTS.END_YEAR}
			isBeforeStart={leftEdgeYear < TIME_CONSTANTS.START_YEAR}
			totalEvents={0}
			visibleEvents={0}
			isLoadingEvents={false}
		/>
	{/if}

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div 
		bind:this={containerElement}
		onmousedown={handleMouseDown}
		onmousemove={handleMouseMove}
		onmouseup={handleMouseUp}
		onmouseleave={handleMouseLeave}
		class="flex-1 w-full flex flex-col overflow-hidden cursor-grab select-none"
	>
		<EventsZone 
			zoomLevel={$zoomLevel}
			{viewportWidth}
			{viewportYearSpan}
			{yearsPerPixel}
			{leftEdgeYear}
			{rightEdgeYear}
		/>
		<TimelineZone 
			zoomLevel={$zoomLevel}
			{viewportWidth}
			{viewportYearSpan}
			{yearsPerPixel}
			{leftEdgeYear}
			{rightEdgeYear}
		/>
	</div>
</main>
