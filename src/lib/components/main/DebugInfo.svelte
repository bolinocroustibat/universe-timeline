<script lang="ts">
import { MIN_MINOR_LABEL_SPACING_PX } from "$lib/constants"
import { currentLocale } from "$lib/stores/localeStore"
import { formatDate, formatLargeNumber } from "$lib/utils/formatters"

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
}: Props = $props()

const minorLabelSpacingPx = $derived(
	yearsPerPixel > 0 ? minorTickInterval / yearsPerPixel : 0,
)
const showMinorLabels = $derived(
	minorLabelSpacingPx >= MIN_MINOR_LABEL_SPACING_PX,
)

// State to control visibility
let isVisible = $state(true)

function closeDebugInfo() {
	isVisible = false
}
</script>

{#if isVisible}
	<div class="absolute top-20 left-4 bg-surface/95 text-foreground border border-border p-4 rounded-lg space-y-3 font-mono text-xs max-w-xs z-[9999]">
		<!-- Close button -->
		<button
			onclick={closeDebugInfo}
			class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-muted hover:text-foreground hover:bg-border rounded transition-colors"
			aria-label="Close debug info"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>

		<!-- Zoom & Scale Information -->
		<div class="space-y-1">
			<div class="text-accent font-semibold border-b border-border pb-1">Zoom & Scale</div>
			<div>Level: {zoomLevel}</div>
			<div>Viewport span: {formatLargeNumber(viewportYearSpan, $currentLocale)} years</div>
			<div>Years/px: {yearsPerPixel.toFixed(2)}</div>
		</div>

		<!-- Viewport Information -->
		<div class="space-y-1">
			<div class="text-accent-warm font-semibold border-b border-border pb-1">Viewport</div>
			<div>Width: {viewportWidth}px</div>
			<div>Center: {formatDate(centerYear, $currentLocale)}</div>
			<div>Left edge: {formatDate(leftEdgeYear, $currentLocale)}</div>
			<div>Right edge: {formatDate(rightEdgeYear, $currentLocale)}</div>
		</div>

		<!-- Tick Information -->
		<div class="space-y-1">
			<div class="text-accent-secondary font-semibold border-b border-border pb-1">Tick Intervals</div>
			<div>Major: {formatLargeNumber(majorTickInterval, $currentLocale)} years</div>
			<div>Minor: {formatLargeNumber(minorTickInterval, $currentLocale)} years</div>
			<div>Minor spacing: {minorLabelSpacingPx.toFixed(1)}px</div>
			<div>Minor labels: {showMinorLabels ? "ON" : "OFF"} (min {MIN_MINOR_LABEL_SPACING_PX}px)</div>
		</div>

		<!-- Technical Details -->
		<div class="space-y-1">
			<div class="text-accent-secondary font-semibold border-b border-border pb-1">Technical</div>
			<div>Left offset: {formatLargeNumber(leftEdgeYearOffset, $currentLocale)} years</div>
		</div>

		<!-- Boundary Status -->
		<div class="pt-2 border-t border-border">
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
