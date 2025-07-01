<script lang="ts">
import { formatYear } from "$lib/utils/formatters"

interface Props {
	zoomLevel: number
	viewportYearSpan: number
	yearsPerPixel: number
	majorTickInterval: number
	minorTickInterval: number
	viewportWidth: number
	leftEdgeYear: number
	rightEdgeYear: number
	leftEdgeYearOffset: number
	centerYear: number
	isPastPresent: boolean
	isBeforeStart: boolean
	// Event-related debug info
	totalEvents: number
	visibleEvents: number
	isLoadingEvents: boolean
}

let {
	zoomLevel,
	viewportYearSpan,
	yearsPerPixel,
	majorTickInterval,
	minorTickInterval,
	viewportWidth,
	leftEdgeYear,
	rightEdgeYear,
	leftEdgeYearOffset,
	centerYear,
	isPastPresent,
	isBeforeStart,
	totalEvents,
	visibleEvents,
	isLoadingEvents,
}: Props = $props()
</script>

<div class="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg space-y-3 font-mono text-sm max-w-xs z-[9999]">
	<!-- Zoom & Scale Information -->
	<div class="space-y-1">
		<div class="text-blue-400 font-semibold border-b border-gray-600 pb-1">Zoom & Scale</div>
		<div>Level: {zoomLevel}</div>
		<div>Viewport span: {formatYear(viewportYearSpan)} years</div>
		<div>Years/px: {yearsPerPixel.toFixed(2)}</div>
	</div>

	<!-- Viewport Information -->
	<div class="space-y-1">
		<div class="text-green-400 font-semibold border-b border-gray-600 pb-1">Viewport</div>
		<div>Width: {viewportWidth}px</div>
		<div>Center: {formatYear(centerYear)}</div>
		<div>Left edge: {formatYear(leftEdgeYear)}</div>
		<div>Right edge: {formatYear(rightEdgeYear)}</div>
	</div>

	<!-- Tick Information -->
	<div class="space-y-1">
		<div class="text-yellow-400 font-semibold border-b border-gray-600 pb-1">Tick Intervals</div>
		<div>Major: {formatYear(majorTickInterval)}</div>
		<div>Minor: {formatYear(minorTickInterval)}</div>
	</div>

	<!-- Technical Details -->
	<div class="space-y-1">
		<div class="text-purple-400 font-semibold border-b border-gray-600 pb-1">Technical</div>
		<div class="text-xs">Left offset: {formatYear(leftEdgeYearOffset)}</div>
	</div>

	<!-- Events Information -->
	<div class="space-y-1">
		<div class="text-orange-400 font-semibold border-b border-gray-600 pb-1">Events</div>
		<div>Total: {totalEvents}</div>
		<div>Visible: {visibleEvents}</div>
		<div class={isLoadingEvents ? "text-yellow-400" : "text-green-400"}>
			Loading: {isLoadingEvents ? "YES" : "NO"}
		</div>
	</div>

	<!-- Boundary Status -->
	<div class="pt-2 border-t border-gray-600">
		<div class="text-red-400 font-semibold mb-1">Boundary Status</div>
		<div class={isPastPresent ? "text-red-400" : "text-green-400"}>
			Past present: {isPastPresent ? "YES" : "NO"}
		</div>
		<div class={isBeforeStart ? "text-red-400" : "text-green-400"}>
			Before start: {isBeforeStart ? "YES" : "NO"}
		</div>
	</div>
</div>
