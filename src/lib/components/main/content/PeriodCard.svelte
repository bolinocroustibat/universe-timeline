<script lang="ts">
import { currentLocale } from "$lib/stores/localeStore"
import type { Period } from "$lib/types"
import { blendColors } from "$lib/utils/colors"
import { bindPointerClick } from "$lib/utils/pointerClickOrDrag"

const SELECTED_SCALE = 1.07

interface Props {
	period: Period
	depth: number
	bandHeight: number
	leftEdgeYear: number
	rightEdgeYear: number
	yearsPerPixel: number
	isTopCard: boolean
	leftPeriod: Period | null
	rightPeriod: Period | null
	onCardClick: (periodId: number) => void
}

let {
	period,
	depth,
	bandHeight,
	leftEdgeYear,
	rightEdgeYear,
	yearsPerPixel,
	isTopCard,
	leftPeriod,
	rightPeriod,
	onCardClick,
}: Props = $props()

const periodPosition = $derived(() => {
	const startX = (period.start - leftEdgeYear) / yearsPerPixel
	const endX = (period.end - leftEdgeYear) / yearsPerPixel
	const rightEdgeX = (rightEdgeYear - leftEdgeYear) / yearsPerPixel

	const clampedStartX = Math.max(0, startX)
	const clampedEndX = Math.min(endX, rightEdgeX)
	const width = clampedEndX - clampedStartX

	return {
		x: clampedStartX,
		width: width,
	}
})

const periodColor = $derived(period.color || "#3d4558")

const gradientBackground = $derived(() => {
	const currentColor = period.color || "#3d4558"
	const leftColor = leftPeriod?.color || currentColor
	const rightColor = rightPeriod?.color || currentColor

	const leftBlend = leftPeriod
		? blendColors(leftColor, currentColor)
		: currentColor
	const rightBlend = rightPeriod
		? blendColors(currentColor, rightColor)
		: currentColor

	if (!leftPeriod && !rightPeriod) {
		return `background-color: ${currentColor};`
	}

	if (leftPeriod && !rightPeriod) {
		return `background: linear-gradient(to right, ${leftBlend} 0%, ${currentColor} 10%, ${currentColor} 100%);`
	}

	if (!leftPeriod && rightPeriod) {
		return `background: linear-gradient(to right, ${currentColor} 0%, ${currentColor} 90%, ${rightBlend} 100%);`
	}

	return `background: linear-gradient(to right, ${leftBlend} 0%, ${currentColor} 10%, ${currentColor} 90%,${rightBlend} 100%);`
})

const isVisible = $derived(
	period.end >= leftEdgeYear && period.start <= rightEdgeYear,
)

const zIndex = $derived(isTopCard ? 1000 : 100 + depth)
const isSelected = $derived(isTopCard)
const bottomOffset = $derived(depth * bandHeight)

const HORIZONTAL_PADDING = 32
const CHAR_WIDTH = 7.5
const MIN_HEIGHT_TITLE = 28
const MIN_HEIGHT_DESCRIPTION = 72
const MIN_WIDTH_DESCRIPTION = 120

const cardWidth = $derived(periodPosition().width)
const label = $derived(period.name[$currentLocale])

const titleFits = $derived(
	cardWidth >= label.length * CHAR_WIDTH + HORIZONTAL_PADDING &&
		bandHeight >= MIN_HEIGHT_TITLE,
)

const showDescription = $derived(
	titleFits &&
		isSelected &&
		!!period.description[$currentLocale] &&
		bandHeight >= MIN_HEIGHT_DESCRIPTION &&
		cardWidth >= MIN_WIDTH_DESCRIPTION,
)
</script>

{#if isVisible && bandHeight > 0}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_tabindex, a11y_no_static_element_interactions -->
	<div
		data-period-card
		class="absolute overflow-visible cursor-pointer"
		style="left: {periodPosition().x}px; width: {periodPosition().width}px; bottom: {bottomOffset}px; height: {bandHeight}px; z-index: {zIndex};"
		title="{period.name[$currentLocale]}"
		use:bindPointerClick={() => onCardClick(period.id)}
		tabindex="0"
	>
		<div
			class="h-full w-full origin-center transition-transform duration-200 ease-out motion-reduce:transition-none backdrop-blur-sm flex items-center justify-center px-2 font-medium shadow-sm overflow-hidden"
			class:shadow-lg={isSelected}
			class:shadow-md={!isSelected}
			class:rounded-[4px]={isSelected}
			class:border-2={isSelected}
			class:border-selection-outline={isSelected}
			style="transform: scale({isSelected ? SELECTED_SCALE : 1}); {gradientBackground()}; color: var(--theme-on-media);"
		>
			{#if titleFits}
				<div class="flex flex-col items-center justify-center w-full h-full p-2 min-w-0 min-h-0 overflow-hidden">
					<span class="w-full min-w-0 text-sm font-semibold mb-1 shrink-0 text-center whitespace-nowrap">
						{label}
					</span>
					{#if showDescription}
						<div class="w-full min-w-0 text-[13px] leading-relaxed text-center opacity-90 overflow-hidden line-clamp-3">
							{period.description[$currentLocale]}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}
