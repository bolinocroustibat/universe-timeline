<script lang="ts">
import {
	NAVIGATOR_MILESTONE_ICON_SIZE_PX,
	TIMELINE_MINOR_TICK_BOTTOM_GAP_PX,
	TIMELINE_NAVIGATOR_HEIGHT_PX,
	TIMELINE_NAVIGATOR_MAJOR_TICK_INTERVAL,
	TIMELINE_NAVIGATOR_MINOR_TICK_INTERVAL,
	TIMELINE_NAVIGATOR_THUMB_HEIGHT_RATIO,
} from "$lib/constants"
import { currentLocale } from "$lib/stores/localeStore"
import { POINTER_DRAG_THRESHOLD_PX } from "$lib/utils/pointerClickOrDrag"
import { formatDate } from "$lib/utils/formatters"
import { screenToTimelineX } from "$lib/utils/timelineCoordinates"
import {
	buildNavigatorMilestonePositions,
	buildNavigatorTickPositions,
	computeNavigatorThumb,
	trackXToYear,
} from "$lib/utils/timelineNavigator"

interface Props {
	leftEdgeYear: number
	rightEdgeYear: number
	centerYear: number
	onNavigateToLeftEdgeYear: (year: number) => void
	onNavigateToCenterYear: (year: number) => void
	onTrackWidthChange: (width: number) => void
}

let {
	leftEdgeYear,
	rightEdgeYear,
	centerYear,
	onNavigateToLeftEdgeYear,
	onNavigateToCenterYear,
	onTrackWidthChange,
}: Props = $props()

const thumbHeightPx = TIMELINE_NAVIGATOR_HEIGHT_PX * TIMELINE_NAVIGATOR_THUMB_HEIGHT_RATIO
const milestoneCenterYPx = $derived(thumbHeightPx / 2)

let trackElement: HTMLDivElement | undefined = $state()
let trackWidth = $state(0)
let isDraggingThumb = $state(false)
let grabOffsetX = $state(0)
let trackPointerStartX = $state(0)
let trackPointerStartY = $state(0)
let trackPointerMoved = $state(false)

let thumbGeometry = $derived(
	computeNavigatorThumb(leftEdgeYear, rightEdgeYear, trackWidth),
)
let navigatorTicks = $derived(
	buildNavigatorTickPositions(
		trackWidth,
		TIMELINE_NAVIGATOR_MAJOR_TICK_INTERVAL,
		TIMELINE_NAVIGATOR_MINOR_TICK_INTERVAL,
	),
)
let navigatorMilestones = $derived(buildNavigatorMilestonePositions(trackWidth))

function updateTrackWidth() {
	if (!trackElement) return

	const width = trackElement.clientWidth
	if (width !== trackWidth) {
		trackWidth = width
		onTrackWidthChange(width)
	}
}

function getPointerTrackX(clientX: number, clientY: number): number {
	if (!trackElement) return 0

	return screenToTimelineX(trackElement, clientX, clientY)
}

function clampThumbLeftX(leftX: number): number {
	const maxLeftX = Math.max(0, trackWidth - thumbGeometry.width)
	return Math.max(0, Math.min(maxLeftX, leftX))
}

function handleThumbPointerDown(e: PointerEvent) {
	if (!trackElement || e.button !== 0) return

	e.stopPropagation()
	e.preventDefault()

	isDraggingThumb = true
	grabOffsetX = getPointerTrackX(e.clientX, e.clientY) - thumbGeometry.leftX
	trackElement.setPointerCapture(e.pointerId)

	window.addEventListener("pointermove", handleThumbPointerMove, {
		passive: false,
	})
	window.addEventListener("pointerup", handleThumbPointerUp)
	window.addEventListener("pointercancel", handleThumbPointerUp)
}

function handleThumbPointerMove(e: PointerEvent) {
	if (!isDraggingThumb || !trackElement || trackWidth <= 0) return

	e.preventDefault()
	e.stopPropagation()

	const pointerTrackX = getPointerTrackX(e.clientX, e.clientY)
	const targetLeftX = clampThumbLeftX(pointerTrackX - grabOffsetX)
	const year = trackXToYear(targetLeftX, trackWidth)
	onNavigateToLeftEdgeYear(year)
}

function handleThumbPointerUp(e: PointerEvent) {
	if (!isDraggingThumb || !trackElement) return

	e.stopPropagation()
	isDraggingThumb = false

	window.removeEventListener("pointermove", handleThumbPointerMove)
	window.removeEventListener("pointerup", handleThumbPointerUp)
	window.removeEventListener("pointercancel", handleThumbPointerUp)

	if (trackElement.hasPointerCapture(e.pointerId)) {
		trackElement.releasePointerCapture(e.pointerId)
	}
}

function handleTrackPointerDown(e: PointerEvent) {
	if (!trackElement || e.button !== 0) return
	if ((e.target as Element).closest("[data-navigator-thumb]")) return

	e.stopPropagation()

	trackPointerStartX = e.clientX
	trackPointerStartY = e.clientY
	trackPointerMoved = false

	window.addEventListener("pointermove", handleTrackPointerMove)
	window.addEventListener("pointerup", handleTrackPointerUp)
	window.addEventListener("pointercancel", handleTrackPointerUp)
}

function handleTrackPointerMove(e: PointerEvent) {
	const distance = Math.hypot(
		e.clientX - trackPointerStartX,
		e.clientY - trackPointerStartY,
	)
	if (distance > POINTER_DRAG_THRESHOLD_PX) {
		trackPointerMoved = true
	}
}

function handleTrackPointerUp(e: PointerEvent) {
	window.removeEventListener("pointermove", handleTrackPointerMove)
	window.removeEventListener("pointerup", handleTrackPointerUp)
	window.removeEventListener("pointercancel", handleTrackPointerUp)

	if (trackPointerMoved || !trackElement || trackWidth <= 0) return

	e.stopPropagation()

	const pointerTrackX = getPointerTrackX(e.clientX, e.clientY)
	const year = trackXToYear(pointerTrackX, trackWidth)
	onNavigateToCenterYear(year)
}

$effect(() => {
	if (!trackElement) return

	const observer = new ResizeObserver(() => {
		updateTrackWidth()
	})
	observer.observe(trackElement)
	updateTrackWidth()

	return () => observer.disconnect()
})
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={trackElement}
	class="timeline-navigator relative flex-shrink-0 w-full overflow-hidden border-t border-border bg-surface touch-none"
	style:height="{TIMELINE_NAVIGATOR_HEIGHT_PX}px"
	onpointerdown={handleTrackPointerDown}
>
	<div
		class="pointer-events-none absolute inset-0 overflow-hidden text-xs"
		style="--label-band-height: calc(1em + 4px)"
	>
		{#each navigatorTicks.minor as tick (tick.year)}
			<div
				class="absolute top-0 w-px bg-tick/70"
				style="transform: translateX({tick.position}px); height: calc(100% - var(--label-band-height) - {TIMELINE_MINOR_TICK_BOTTOM_GAP_PX}px);"
			></div>
		{/each}

		{#each navigatorTicks.major as tick (tick.year)}
			<div
				class="absolute top-0 w-px bg-tick"
				style="transform: translateX({tick.position}px); bottom: var(--label-band-height);"
			></div>
			<div
				class="absolute -translate-x-1/2 text-xs leading-none text-muted text-center whitespace-nowrap"
				style:left="{tick.position}px"
				style:bottom="0"
			>
				{formatDate(tick.year, $currentLocale, false)}
			</div>
		{/each}
	</div>

	<div
		data-navigator-thumb
		class="absolute top-0 z-10 rounded border border-accent bg-black/25 {isDraggingThumb
			? 'cursor-grabbing'
			: 'cursor-grab'}"
		style:left="{thumbGeometry.leftX}px"
		style:width="{thumbGeometry.width}px"
		style:height="{thumbHeightPx}px"
		role="slider"
		tabindex="0"
		aria-label="Timeline position"
		aria-valuenow={centerYear}
		onpointerdown={handleThumbPointerDown}
	></div>

	<div class="pointer-events-none absolute inset-0 z-20 overflow-hidden">
		{#each navigatorMilestones as { milestone, centerX } (milestone.id)}
			<img
				src={milestone.icon}
				alt={milestone.label[$currentLocale]}
				class="absolute object-contain"
				style:left="{centerX}px"
				style:top="{milestoneCenterYPx}px"
				style:width="{NAVIGATOR_MILESTONE_ICON_SIZE_PX}px"
				style:height="{NAVIGATOR_MILESTONE_ICON_SIZE_PX}px"
				style:transform="translate(-50%, -50%)"
			/>
		{/each}
	</div>
</div>
