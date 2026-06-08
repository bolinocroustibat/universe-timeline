<script lang="ts">
import {
	MIN_MINOR_LABEL_SPACING_PX,
	TIME_CONSTANTS,
	TIMELINE_MINOR_TICK_BOTTOM_GAP_PX,
	TIMELINE_MINOR_TICK_HEIGHT_PX,
	ZOOM_SCALES,
} from "$lib/constants"
import { currentLocale } from "$lib/stores/localeStore"
import type { TimelineTick } from "$lib/types"
import { formatDate } from "$lib/utils/formatters"

interface Props {
	zoomLevel: number
	viewportWidth: number
	viewportYearSpan: number
	yearsPerPixel: number
	leftEdgeYear: number
	rightEdgeYear: number
}

let {
	zoomLevel,
	viewportWidth,
	viewportYearSpan,
	yearsPerPixel,
	leftEdgeYear,
	rightEdgeYear,
}: Props = $props()

// Calculate years per major tick based on zoom level
const currentScale = $derived(
	ZOOM_SCALES.find((scale) => scale.level === zoomLevel) ?? ZOOM_SCALES[4],
)
const majorTickInterval: number = $derived(currentScale.majorTickInterval)
const minorTickInterval: number = $derived(currentScale.minorTickInterval)
const minorLabelSpacingPx = $derived(
	yearsPerPixel > 0 ? minorTickInterval / yearsPerPixel : 0,
)
const showMinorLabels = $derived(
	minorLabelSpacingPx >= MIN_MINOR_LABEL_SPACING_PX,
)

// Generate visible major ticks based on current year position
const visibleMajorTicks: TimelineTick[] = $derived(
	(() => {
		const visibleYearSpan = viewportYearSpan + majorTickInterval * 2 // Add buffer

		const startMajorTick = Math.floor(leftEdgeYear / majorTickInterval)
		const endMajorTick = Math.ceil(
			(leftEdgeYear + visibleYearSpan) / majorTickInterval,
		)

		const ticks = Array.from(
			{ length: endMajorTick - startMajorTick },
			(_, i) => {
				const majorTickYear = (startMajorTick + i) * majorTickInterval
				const position = (majorTickYear - leftEdgeYear) / yearsPerPixel

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

		return ticks
	})(),
)

// Generate visible minor ticks based on current year position
const visibleMinorTicks: TimelineTick[] = $derived(
	(() => {
		const visibleYearSpan = viewportYearSpan + minorTickInterval * 2 // Add buffer

		const startMinorTick = Math.floor(leftEdgeYear / minorTickInterval)
		const endMinorTick = Math.ceil(
			(leftEdgeYear + visibleYearSpan) / minorTickInterval,
		)

		return Array.from({ length: endMinorTick - startMinorTick }, (_, i) => {
			const minorTickYear = (startMinorTick + i) * minorTickInterval
			const position = (minorTickYear - leftEdgeYear) / yearsPerPixel

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
</script>

<div
	class="absolute inset-0 pointer-events-none overflow-hidden z-0 text-xs"
	style="--label-band-height: calc(1em + 4px)"
>
	<!-- Minor ticks (rendered first, behind major ticks) -->
	{#each visibleMinorTicks as tick}
		<div
			class="absolute w-px bg-tick/70"
			style="transform: translateX({tick.position}px); bottom: calc(var(--label-band-height) + {TIMELINE_MINOR_TICK_BOTTOM_GAP_PX}px); height: {TIMELINE_MINOR_TICK_HEIGHT_PX}px;"
		></div>
		{#if showMinorLabels}
			<div
				class="absolute -translate-x-1/2 text-[10px] leading-none text-muted/50 text-center whitespace-nowrap"
				style="left: {tick.position}px; bottom: 0;"
			>
				{formatDate(tick.year, $currentLocale, false)}
			</div>
		{/if}
	{/each}
	<!-- Major ticks (rendered second, on top) -->
	{#each visibleMajorTicks as tick}
		<div
			class="absolute top-0 w-px bg-tick"
			style="transform: translateX({tick.position}px); bottom: var(--label-band-height);"
		></div>
		<div
			class="absolute -translate-x-1/2 text-xs leading-none text-muted text-center whitespace-nowrap"
			style="left: {tick.position}px; bottom: 0;"
		>
			{formatDate(tick.year, $currentLocale, false)}
		</div>
	{/each}
</div>
