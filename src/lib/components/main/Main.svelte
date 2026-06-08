<script lang="ts">
import { onMount } from "svelte"
import { env } from "$env/dynamic/public"
import LeftArrow from "$lib/components/main/ArrowLeft.svelte"
import RightArrow from "$lib/components/main/ArrowRight.svelte"
import Content from "$lib/components/main/content/Content.svelte"
import DebugInfo from "$lib/components/main/DebugInfo.svelte"
import TimelineZone from "$lib/components/main/TimelineZone.svelte"
import { MAX_ZOOM_LEVEL, TIME_CONSTANTS, ZOOM_SCALES } from "$lib/constants"
import { zoomLevel } from "$lib/stores/zoomStore"
import { POINTER_DRAG_THRESHOLD_PX } from "$lib/utils/pointerClickOrDrag"
import {
	screenToTimelinePanDelta,
	screenToTimelineX,
	wheelDeltaToTimelinePanDelta,
	wheelDeltaToZoomDelta,
} from "$lib/utils/timelineCoordinates"

let containerElement: HTMLDivElement | undefined = $state()
let contentInstance: { deselectCards: () => void } | undefined = $state()
let viewportWidth = $state(0)
let isDragging = $state(false)
let startClientX = $state(0)
let startClientY = $state(0)
let pointerDownTarget: Element | null = null
let panStartLeftEdgeYearOffset = $state(0)
// Current position (left edge of viewport)
let leftEdgeYearOffset = $state(0)

function updateViewportWidth() {
	if (containerElement) {
		// Layout width along the timeline axis (stable under CSS rotation)
		viewportWidth = containerElement.clientWidth
	}
}

function applyPanFromScreenDelta(deltaX: number) {
	const newLeftEdgeYearOffset =
		panStartLeftEdgeYearOffset - deltaX * yearsPerPixel
	const newLeftEdgeYear = TIME_CONSTANTS.START_YEAR + newLeftEdgeYearOffset
	const newRightEdgeYear = newLeftEdgeYear + viewportWidth * yearsPerPixel

	if (
		newRightEdgeYear <= TIME_CONSTANTS.END_YEAR &&
		newLeftEdgeYear >= TIME_CONSTANTS.START_YEAR
	) {
		leftEdgeYearOffset = newLeftEdgeYearOffset
	}
}

function handleDragMove(e: PointerEvent) {
	if (!isDragging || !containerElement) return
	e.preventDefault()

	const deltaX = screenToTimelinePanDelta(
		containerElement,
		startClientX,
		startClientY,
		e.clientX,
		e.clientY,
	)
	applyPanFromScreenDelta(deltaX)
}

function isCardTarget(target: Element | null): boolean {
	return (
		!!target?.closest("[data-event-card]") ||
		!!target?.closest("[data-period-card]") ||
		!!target?.closest("[data-period-popover]")
	)
}

function stopDragging(e: PointerEvent) {
	if (!isDragging || !containerElement) return

	const moved = Math.hypot(e.clientX - startClientX, e.clientY - startClientY)
	const tapTarget = pointerDownTarget
	pointerDownTarget = null

	isDragging = false
	window.removeEventListener("pointermove", handleDragMove)
	window.removeEventListener("pointerup", stopDragging)
	window.removeEventListener("pointercancel", stopDragging)

	if (containerElement.hasPointerCapture(e.pointerId)) {
		containerElement.releasePointerCapture(e.pointerId)
	}
	containerElement.style.cursor = "grab"

	if (moved <= POINTER_DRAG_THRESHOLD_PX && !isCardTarget(tapTarget)) {
		contentInstance?.deselectCards()
	}
}

// Track scroll position and viewport width
$effect(() => {
	if (!containerElement) return

	const observer = new ResizeObserver(() => {
		updateViewportWidth()
	})
	observer.observe(containerElement)
	updateViewportWidth()

	return () => observer.disconnect()
})

onMount(() => {
	const handleOrientationChange = () => {
		updateViewportWidth()
	}

	window.addEventListener("orientationchange", handleOrientationChange)
	window.visualViewport?.addEventListener("resize", handleOrientationChange)

	// Listen for zoom requests from Zoom component
	const handleZoomRequest = (event: CustomEvent) => {
		const newZoomLevel = event.detail.zoomLevel
		performCenteredZoom(newZoomLevel)
	}

	window.addEventListener("zoom-request", handleZoomRequest as EventListener)

	return () => {
		window.removeEventListener("pointermove", handleDragMove)
		window.removeEventListener("pointerup", stopDragging)
		window.removeEventListener("pointercancel", stopDragging)
		window.removeEventListener("orientationchange", handleOrientationChange)
		window.visualViewport?.removeEventListener(
			"resize",
			handleOrientationChange,
		)
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
let yearsPerPixel: number = $derived(
	viewportWidth > 0 ? viewportYearSpan / viewportWidth : 0,
)

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

function handlePointerDown(e: PointerEvent) {
	if (!containerElement || e.button !== 0) return

	pointerDownTarget = e.target as Element
	isDragging = true
	startClientX = e.clientX
	startClientY = e.clientY
	panStartLeftEdgeYearOffset = leftEdgeYearOffset
	containerElement.setPointerCapture(e.pointerId)
	containerElement.style.cursor = "grabbing"

	window.addEventListener("pointermove", handleDragMove, { passive: false })
	window.addEventListener("pointerup", stopDragging)
	window.addEventListener("pointercancel", stopDragging)
}

function handlePointerUp(e: PointerEvent) {
	stopDragging(e)
}

function handlePointerCancel(e: PointerEvent) {
	stopDragging(e)
}

// WheelEvent: mouse wheel, trackpad swipe, and pinch
function handleWheel(e: WheelEvent) {
	e.preventDefault()
	if (!containerElement) return

	// Map pointer position to layout coordinates (handles CSS rotation)
	const pointerLocalX = screenToTimelineX(
		containerElement,
		e.clientX,
		e.clientY,
	)

	// Calculate the year at the pointer position
	const leftEdgeYear = TIME_CONSTANTS.START_YEAR + leftEdgeYearOffset
	const mouseCursorYear = leftEdgeYear + pointerLocalX * yearsPerPixel

	// Handle pinch-to-zoom on trackpad
	if (e.deltaZ !== 0) {
		const pinchDirection = e.deltaZ > 0 ? 1 : -1 // Positive deltaZ = pinch out = zoom in
		const newZoomLevel = Math.max(
			1,
			Math.min(MAX_ZOOM_LEVEL, $zoomLevel + pinchDirection),
		)

		if (newZoomLevel !== $zoomLevel) {
			performCenteredZoom(newZoomLevel, mouseCursorYear)
		}
	}

	const panLayoutDelta = wheelDeltaToTimelinePanDelta(
		containerElement,
		e.deltaX,
		e.deltaY,
	)
	const zoomScreenDelta = wheelDeltaToZoomDelta(e.deltaX, e.deltaY)

	if (Math.abs(panLayoutDelta) > Math.abs(zoomScreenDelta)) {
		const newLeftEdgeYearOffset =
			leftEdgeYearOffset + panLayoutDelta * yearsPerPixel
		const newLeftEdgeYear = TIME_CONSTANTS.START_YEAR + newLeftEdgeYearOffset
		const newRightEdgeYear = newLeftEdgeYear + viewportWidth * yearsPerPixel

		if (
			newRightEdgeYear <= TIME_CONSTANTS.END_YEAR &&
			newLeftEdgeYear >= TIME_CONSTANTS.START_YEAR
		) {
			leftEdgeYearOffset = newLeftEdgeYearOffset
		}
	} else if (zoomScreenDelta !== 0) {
		const zoomDirection = zoomScreenDelta > 0 ? -1 : 1 // Positive = zoom out
		const newZoomLevel = Math.max(
			1,
			Math.min(MAX_ZOOM_LEVEL, $zoomLevel + zoomDirection),
		)

		if (newZoomLevel !== $zoomLevel) {
			performCenteredZoom(newZoomLevel, mouseCursorYear)
		}
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

// Arrow panning functions
let isPanning = $state(false)
let panInterval: ReturnType<typeof setInterval> | undefined = $state()

function panLeft() {
	const panDistance = viewportWidth * 0.01 // Pan 1% of viewport width per step
	const newLeftEdgeYearOffset = leftEdgeYearOffset + panDistance * yearsPerPixel
	const newLeftEdgeYear = TIME_CONSTANTS.START_YEAR + newLeftEdgeYearOffset
	const newRightEdgeYear = newLeftEdgeYear + viewportWidth * yearsPerPixel

	// Apply boundary constraints
	if (newRightEdgeYear <= TIME_CONSTANTS.END_YEAR) {
		leftEdgeYearOffset = newLeftEdgeYearOffset
	}
}

function panRight() {
	const panDistance = viewportWidth * 0.01 // Pan 1% of viewport width per step
	const newLeftEdgeYearOffset = leftEdgeYearOffset - panDistance * yearsPerPixel
	const newLeftEdgeYear = TIME_CONSTANTS.START_YEAR + newLeftEdgeYearOffset
	const newRightEdgeYear = newLeftEdgeYear + viewportWidth * yearsPerPixel

	// Apply boundary constraints
	if (newLeftEdgeYear >= TIME_CONSTANTS.START_YEAR) {
		leftEdgeYearOffset = newLeftEdgeYearOffset
	}
}

function startPanLeft() {
	isPanning = true
	panInterval = setInterval(panLeft, 16) // ~60fps for smooth movement
}

function startPanRight() {
	isPanning = true
	panInterval = setInterval(panRight, 16) // ~60fps for smooth movement
}

function stopPanning() {
	isPanning = false
	if (panInterval) {
		clearInterval(panInterval)
		panInterval = undefined
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
		/>
	{/if}

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div 
		bind:this={containerElement}
		onpointerdown={handlePointerDown}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerCancel}
		class="pan-container flex-1 w-full flex flex-col overflow-hidden cursor-grab select-none relative"
	>
		<Content
			bind:this={contentInstance}
			{viewportWidth}
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
		
		<!-- Navigation arrows -->
		<LeftArrow 
			onMouseDown={startPanRight} 
			onMouseUp={stopPanning} 
			onMouseLeave={stopPanning} 
		/>
		<RightArrow 
			onMouseDown={startPanLeft} 
			onMouseUp={stopPanning} 
			onMouseLeave={stopPanning} 
		/>
	</div>
</main>
