<script lang="ts">
import { formatYear } from "$lib/utils/formatters"

interface Props {
	zoomLevel: number
	viewportYearSpan: number
	yearsPerPixel: number
	majorTickInterval: number
	viewportWidth: number
	leftEdgeYear: number
	visibleStartYear: number
	visibleEndYear: number
}

let {
	zoomLevel,
	viewportYearSpan,
	yearsPerPixel,
	majorTickInterval,
	viewportWidth,
	leftEdgeYear,
	visibleStartYear,
	visibleEndYear,
}: Props = $props()
</script>

<div class="fixed top-24 right-4 bg-black/80 text-white p-4 rounded-lg space-y-2 font-mono text-sm">
	<div>Zoom level: {zoomLevel}</div>
	<div>Viewport span: {formatYear(viewportYearSpan)} years</div>
	<div>Years/px: {yearsPerPixel.toFixed(2)}</div>
	<div>Major tick interval: {formatYear(majorTickInterval)}</div>
	<div>Viewport: {viewportWidth}px</div>
	<div>Left edge year: {formatYear(leftEdgeYear)}</div>
	<div>Visible years: {formatYear(visibleStartYear)} → {formatYear(visibleEndYear)}</div>
</div>