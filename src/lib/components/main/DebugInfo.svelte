<script lang="ts">
import { formatYear, formatLargeNumber } from "$lib/utils/formatters"
import { currentLanguage } from "$lib/stores/languageStore"

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

// State to control visibility
let isVisible = $state(true)

function closeDebugInfo() {
	isVisible = false
}
</script>

{#if isVisible}
	<div class="absolute top-20 left-4 bg-black/90 text-white p-4 rounded-lg space-y-3 font-mono text-xs max-w-xs z-[9999]">
		<!-- Close button -->
		<button
			onclick={closeDebugInfo}
			class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
			aria-label="Close debug info"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>

		<!-- Zoom & Scale Information -->
		<div class="space-y-1">
			<div class="text-blue-400 font-semibold border-b border-gray-600 pb-1">Zoom & Scale</div>
			<div>Level: {zoomLevel}</div>
			<div>Viewport span: {formatLargeNumber(viewportYearSpan, $currentLanguage)} years</div>
			<div>Years/px: {yearsPerPixel.toFixed(2)}</div>
		</div>

		<!-- Viewport Information -->
		<div class="space-y-1">
			<div class="text-green-400 font-semibold border-b border-gray-600 pb-1">Viewport</div>
			<div>Width: {viewportWidth}px</div>
			<div>Center: {formatYear(centerYear, $currentLanguage)}</div>
			<div>Left edge: {formatYear(leftEdgeYear, $currentLanguage)}</div>
			<div>Right edge: {formatYear(rightEdgeYear, $currentLanguage)}</div>
		</div>

		<!-- Tick Information -->
		<div class="space-y-1">
			<div class="text-yellow-400 font-semibold border-b border-gray-600 pb-1">Tick Intervals</div>
			<div>Major: {formatLargeNumber(majorTickInterval, $currentLanguage)} years</div>
			<div>Minor: {formatLargeNumber(minorTickInterval, $currentLanguage)} years</div>
		</div>

		<!-- Technical Details -->
		<div class="space-y-1">
			<div class="text-purple-400 font-semibold border-b border-gray-600 pb-1">Technical</div>
			<div>Left offset: {formatLargeNumber(leftEdgeYearOffset, $currentLanguage)} years</div>
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
{/if}
