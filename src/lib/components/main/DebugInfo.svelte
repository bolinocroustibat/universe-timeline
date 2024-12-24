<script lang="ts">
import { formatYear } from "$lib/utils/formatters"

interface Props {
	zoomLevel: number
	viewportYearSpan: number
	yearsPerPixel: number
	yearsPerMajorTick: number
	viewportWidth: number
	scrollLeft: number
	visibleStartIndex: number
	visibleEndIndex: number
	visibleStartYear: number
	visibleEndYear: number
}
const {
	zoomLevel,
	viewportYearSpan,
	yearsPerPixel,
	yearsPerMajorTick,
	viewportWidth,
	scrollLeft,
	visibleStartIndex,
	visibleEndIndex,
	visibleStartYear,
	visibleEndYear,
}: Props = $props()
</script>

<div class="fixed top-24 right-4 bg-black/80 text-white p-4 rounded-lg space-y-2 font-mono text-sm">
	<div>Zoom level: {zoomLevel}</div>
	<div>Viewport span: {formatYear(viewportYearSpan)} years</div>
	<div>Years/px: {yearsPerPixel.toFixed(2)}</div>
	<div>Years/tick: {formatYear(yearsPerMajorTick)}</div>
	<div>Viewport: {viewportWidth}px</div>
	<div>Scroll position: {scrollLeft.toFixed(0)}px</div>
	<div>Visible indices: {visibleStartIndex} → {visibleEndIndex}</div>
	<div>Visible years: {formatYear(visibleStartYear)} → {formatYear(visibleEndYear)}</div>
</div>