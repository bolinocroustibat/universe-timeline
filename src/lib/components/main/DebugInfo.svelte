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
	visibleStartYear: number
	visibleEndYear: number
	isPastPresent: boolean
	isBeforeStart: boolean
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
	visibleStartYear,
	visibleEndYear,
	isPastPresent,
	isBeforeStart,
}: Props = $props()
</script>

<div class="fixed top-24 right-4 bg-black/80 text-white p-4 rounded-lg space-y-2 font-mono text-sm">
	<div>Zoom level: {zoomLevel}</div>
	<div>Viewport span: {formatYear(viewportYearSpan)} years</div>
	<div>Years/px: {yearsPerPixel.toFixed(2)}</div>
	<div>Major tick interval: {formatYear(majorTickInterval)}</div>
	<div>Minor tick interval: {formatYear(minorTickInterval)}</div>
	<div>Viewport: {viewportWidth}px</div>
	<div>Left edge: {formatYear(leftEdgeYear)}</div>
	<div>Right edge: {formatYear(rightEdgeYear)}</div>
	<div>Left edge offset: {formatYear(leftEdgeYearOffset)}</div>
	<div>Visible years: {formatYear(visibleStartYear)} → {formatYear(visibleEndYear)}</div>
	<div class="pt-2 border-t border-gray-600">
		<div class="text-yellow-400">Boundary Status:</div>
		<div class={isPastPresent ? "text-red-400" : "text-green-400"}>
			Past present: {isPastPresent ? "YES" : "NO"}
		</div>
		<div class={isBeforeStart ? "text-red-400" : "text-green-400"}>
			Before start: {isBeforeStart ? "YES" : "NO"}
		</div>
	</div>
</div>