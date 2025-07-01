<script lang="ts">
import { TIME_CONSTANTS, ZOOM_SCALES } from "$lib/constants"
import { zoomLevel } from "$lib/stores/zoomStore"
import type { TimelineTick } from "$lib/types"
import { formatYear } from "$lib/utils/formatters"

interface Props {
	viewportWidth: number
	leftEdgeYearOffset: number
	viewportYearSpan: number
	yearsPerPixel: number
}

let {
	viewportWidth,
	leftEdgeYearOffset,
	viewportYearSpan,
	yearsPerPixel,
}: Props = $props()

// Calculate years per major tick based on zoom level
const currentScale = $derived(
	ZOOM_SCALES.find((scale) => scale.level === $zoomLevel) ?? ZOOM_SCALES[4],
)
const majorTickInterval: number = $derived(currentScale.majorTickInterval)
const minorTickInterval: number = $derived(currentScale.minorTickInterval)

// Generate visible major ticks based on current year position
const visibleMajorTicks: TimelineTick[] = $derived(
	(() => {
		const startYear = TIME_CONSTANTS.START_YEAR + leftEdgeYearOffset
		const visibleYearSpan = viewportYearSpan + majorTickInterval * 2 // Add buffer

		const startMajorTick = Math.floor(startYear / majorTickInterval)
		const endMajorTick = Math.ceil(
			(startYear + visibleYearSpan) / majorTickInterval,
		)

		const ticks = Array.from(
			{ length: endMajorTick - startMajorTick },
			(_, i) => {
				const majorTickYear = (startMajorTick + i) * majorTickInterval
				const position = (majorTickYear - startYear) / yearsPerPixel

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
</script>

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
