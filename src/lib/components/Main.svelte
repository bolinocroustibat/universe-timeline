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
// Current position (left edge of viewport)
let leftEdgeYearOffset = $state(0)

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

// Calculate years per major tick based on zoom level
let majorTickInterval: number = $derived(currentScale.majorTickInterval)
let minorTickInterval: number = $derived(currentScale.minorTickInterval)

// Generate visible major ticks based on current year position
let visibleMajorTicks: TimelineTick[] = $derived(
	(() => {
		const startYear = TIME_CONSTANTS.START_YEAR + leftEdgeYearOffset
		const visibleYearSpan = viewportYearSpan + majorTickInterval * 2 // Add buffer

		const startMajorTick = Math.floor(startYear / majorTickInterval)
		const endMajorTick = Math.ceil(
			(startYear + visibleYearSpan) / majorTickInterval,
		)

		// console.log("🔍 Tick generation debug:", {
		// 	startYear,
		// 	visibleYearSpan,
		// 	startMajorTick,
		// 	endMajorTick,
		// 	majorTickInterval,
		// 	generatedTicks: endMajorTick - startMajorTick
		// })

		const ticks = Array.from(
			{ length: endMajorTick - startMajorTick },
			(_, i) => {
				const majorTickYear = (startMajorTick + i) * majorTickInterval
				const position = (majorTickYear - startYear) / yearsPerPixel

				// console.log(`🔍 Tick ${i}: year=${majorTickYear}, position=${position}, inBounds=${majorTickYear >= TIME_CONSTANTS.START_YEAR && majorTickYear <= TIME_CONSTANTS.END_YEAR}`)

				// Only include ticks that are within the timeline boundaries
				if (
					majorTickYear >= TIME_CONSTANTS.START_YEAR &&
					majorTickYear <= TIME_CONSTANTS.END_YEAR
				) {
					return {
						year: majorTickYear,
						position,
					} satisfies TimelineTick
				}
				return null
			},
		).filter((tick): tick is TimelineTick => tick !== null)

		// console.log("🔍 Generated ticks:", ticks.map(t => ({ year: t.year, position: t.position })))
		return ticks
	})(),
)

// Generate visible minor ticks based on current year position
let visibleMinorTicks: TimelineTick[] = $derived(
	(() => {
		const startYear = TIME_CONSTANTS.START_YEAR + leftEdgeYearOffset
		const visibleYearSpan = viewportYearSpan + minorTickInterval * 2 // Add buffer

		const startMinorTick = Math.floor(startYear / minorTickInterval)
		const endMinorTick = Math.ceil(
			(startYear + visibleYearSpan) / minorTickInterval,
		)

		return Array.from({ length: endMinorTick - startMinorTick }, (_, i) => {
			const minorTickYear = (startMinorTick + i) * minorTickInterval
			const position = (minorTickYear - startYear) / yearsPerPixel

			// Only include ticks that are within the timeline boundaries
			// AND are not major ticks (to avoid duplicates)
			if (
				minorTickYear >= TIME_CONSTANTS.START_YEAR &&
				minorTickYear <= TIME_CONSTANTS.END_YEAR &&
				minorTickYear % majorTickInterval !== 0
			) {
				return {
					year: minorTickYear,
					position,
				} satisfies TimelineTick
			}
			return null
		}).filter((tick): tick is TimelineTick => tick !== null)
	})(),
)

let firstRenderedMajorTickYear = $derived(visibleMajorTicks[0]?.year)
let lastRenderedMajorTickYear = $derived(
	visibleMajorTicks[visibleMajorTicks.length - 1]?.year,
)

function handleMouseDown(e: MouseEvent) {
	if (!containerElement) return
	isDragging = true
	startX = e.pageX
	containerElement.style.cursor = "grabbing"
	console.log("🖱️ Mouse down - starting drag")
}

function handleMouseMove(e: MouseEvent) {
	if (!isDragging) return
	e.preventDefault()

	const deltaX = e.pageX - startX
	const newLeftEdgeYearOffset = leftEdgeYearOffset - deltaX * yearsPerPixel
	const newLeftEdgeYear = TIME_CONSTANTS.START_YEAR + newLeftEdgeYearOffset
	const newRightEdgeYear = newLeftEdgeYear + viewportWidth * yearsPerPixel

	// Special debug for boundary violations
	if (newRightEdgeYear > TIME_CONSTANTS.END_YEAR) {
		console.log(
			"🚨 RIGHT EDGE PAST PRESENT TIME! Right edge would be:",
			newRightEdgeYear,
		)
	}
	if (newLeftEdgeYear < TIME_CONSTANTS.START_YEAR) {
		console.log(
			"🚨 LEFT EDGE BEFORE START TIME! Left edge would be:",
			newLeftEdgeYear,
		)
	}

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
	console.log("🖱️ Mouse up - ending drag")
}

function handleMouseLeave() {
	if (isDragging && containerElement) {
		isDragging = false
		containerElement.style.cursor = "grab"
		console.log("🖱️ Mouse leave - ending drag")
	}
}

function handleWheel(e: WheelEvent) {
	e.preventDefault()
	if (!containerElement) return

	// Get mouse cursor position relative to the container
	const rect = containerElement.getBoundingClientRect()
	const mouseX = e.clientX - rect.left
	const mouseY = e.clientY - rect.top

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

	// Special debug for boundary violations
	if (newRightEdgeYear > TIME_CONSTANTS.END_YEAR) {
		console.log(
			"🚨 RIGHT EDGE PAST PRESENT TIME! Right edge would be:",
			newRightEdgeYear,
		)
	}
	if (newLeftEdgeYear < TIME_CONSTANTS.START_YEAR) {
		console.log(
			"🚨 LEFT EDGE BEFORE START TIME! Left edge would be:",
			newLeftEdgeYear,
		)
	}

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
			leftEdgeYear={TIME_CONSTANTS.START_YEAR + leftEdgeYearOffset}
			rightEdgeYear={TIME_CONSTANTS.START_YEAR + leftEdgeYearOffset + (viewportWidth * yearsPerPixel)}
			leftEdgeYearOffset={leftEdgeYearOffset}
			{firstRenderedMajorTickYear}
			{lastRenderedMajorTickYear}
			{centerYear}
			isPastPresent={TIME_CONSTANTS.START_YEAR + leftEdgeYearOffset + (viewportWidth * yearsPerPixel) > TIME_CONSTANTS.END_YEAR}
			isBeforeStart={TIME_CONSTANTS.START_YEAR + leftEdgeYearOffset < TIME_CONSTANTS.START_YEAR}
		/>
	{/if}

	<!-- Main Timeline Container -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div 
		bind:this={containerElement}
		onmousedown={handleMouseDown}
		onmousemove={handleMouseMove}
		onmouseup={handleMouseUp}
		onmouseleave={handleMouseLeave}
		class="flex-1 w-full flex flex-col overflow-hidden cursor-grab select-none"
	>
		<!-- Events and Periods Display Zone -->
		<div class="w-full flex-[4] bg-slate-300 border-b border-slate-200 overflow-hidden">
			<div class="h-full relative overflow-hidden">
				<!-- Events and periods will be rendered here -->
				<!-- This zone will respond to zoom/pan changes through the shared state -->
				<div class="p-4 text-gray-500 text-center">
					Events and periods display zone
					<br>
					<small>Zoom level: {$zoomLevel} | Viewport: {formatYear(viewportYearSpan)} years</small>
				</div>
			</div>
		</div>

		<!-- Timeline Zone -->
		<div class="w-full flex-[1] bg-white border-t border-slate-200 overflow-hidden relative">
			<!-- Minor ticks (rendered first, behind major ticks) -->
			{#each visibleMinorTicks as tick}
				<div 
					class="absolute top-0 h-full flex flex-col justify-start"
					style="transform: translateX({tick.position}px)"
				>
					<div class="h-1/2 w-0.5 bg-gray-300"></div>
				</div>
			{/each}
			<!-- Major ticks (rendered second, on top) -->
			{#each visibleMajorTicks as tick}
				<div 
					class="absolute top-0 h-full flex flex-col justify-start"
					style="transform: translateX({tick.position}px)"
				>
					<div class="h-2/3 w-0.5 bg-gray-400"></div>
					<span class="text-xs text-gray-600 mt-1 text-center whitespace-nowrap -ml-1/2">
						{formatYear(tick.year, "fr", majorTickInterval)}
					</span>
				</div>
			{/each}
		</div>
	</div>
</main>
