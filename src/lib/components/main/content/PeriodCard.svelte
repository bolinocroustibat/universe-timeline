<script lang="ts">
import { currentLocale } from "$lib/stores/localeStore"
import { blendColors } from "$lib/utils/colors"
import {
	getPeriodCardGeometry,
	getPeriodSelectionTransform,
	type PeriodWithLayout,
} from "$lib/utils/periodLayout"
import { bindPointerClick } from "$lib/utils/pointerClickOrDrag"

interface Props {
	layout: PeriodWithLayout
	zoneHeight: number
	leftEdgeYear: number
	rightEdgeYear: number
	yearsPerPixel: number
	isTopCard: boolean
	onCardClick: (periodId: number) => void
}

let {
	layout,
	zoneHeight,
	leftEdgeYear,
	rightEdgeYear,
	yearsPerPixel,
	isTopCard,
	onCardClick,
}: Props = $props()

const periodPosition = $derived(() => {
	const startX = (layout.start - leftEdgeYear) / yearsPerPixel
	const endX = (layout.end - leftEdgeYear) / yearsPerPixel
	const rightEdgeX = (rightEdgeYear - leftEdgeYear) / yearsPerPixel

	const clampedStartX = Math.max(0, startX)
	const clampedEndX = Math.min(endX, rightEdgeX)
	const width = clampedEndX - clampedStartX

	return {
		x: clampedStartX,
		width: width,
	}
})

const gradientBackground = $derived(() => {
	const currentColor = layout.color || "#3d4558"
	const leftColor = layout.leftPeriod?.color || currentColor
	const rightColor = layout.rightPeriod?.color || currentColor

	const leftBlend = layout.leftPeriod
		? blendColors(leftColor, currentColor)
		: currentColor
	const rightBlend = layout.rightPeriod
		? blendColors(currentColor, rightColor)
		: currentColor

	if (!layout.leftPeriod && !layout.rightPeriod) {
		return `background-color: ${currentColor};`
	}

	if (layout.leftPeriod && !layout.rightPeriod) {
		return `background: linear-gradient(to right, ${leftBlend} 0%, ${currentColor} 10%, ${currentColor} 100%);`
	}

	if (!layout.leftPeriod && layout.rightPeriod) {
		return `background: linear-gradient(to right, ${currentColor} 0%, ${currentColor} 90%, ${rightBlend} 100%);`
	}

	return `background: linear-gradient(to right, ${leftBlend} 0%, ${currentColor} 10%, ${currentColor} 90%,${rightBlend} 100%);`
})

const isVisible = $derived(
	layout.end >= leftEdgeYear && layout.start <= rightEdgeYear,
)

const cardGeometry = $derived(
	getPeriodCardGeometry({
		depth: layout.depth,
		zoneHeight,
		isSelected: isTopCard,
		hasVisibleDescendants: layout.hasVisibleDescendants,
	}),
)

const isSelected = $derived(isTopCard)

const selectionTransform = $derived(
	getPeriodSelectionTransform({
		zoneHeight,
		cardHeight: cardGeometry.height,
		bottom: cardGeometry.bottom,
		isSelected,
	}),
)

const HORIZONTAL_PADDING = 32
const CHAR_WIDTH = 7.5
const MIN_HEIGHT_TITLE = 28
const MIN_HEIGHT_DESCRIPTION = 72
const MIN_WIDTH_DESCRIPTION = 120

const cardWidth = $derived(periodPosition().width)
const cardHeight = $derived(cardGeometry.height)
const label = $derived(layout.name[$currentLocale])

const titleFits = $derived(
	cardWidth >= label.length * CHAR_WIDTH + HORIZONTAL_PADDING &&
		cardHeight >= MIN_HEIGHT_TITLE,
)

const showDescription = $derived(
	titleFits &&
		isSelected &&
		!!layout.description[$currentLocale] &&
		cardHeight >= MIN_HEIGHT_DESCRIPTION &&
		cardWidth >= MIN_WIDTH_DESCRIPTION,
)
</script>

{#if isVisible && cardHeight > 0}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_tabindex, a11y_no_static_element_interactions -->
	<div
		data-period-card
		class="absolute overflow-visible cursor-pointer"
		style="left: {periodPosition().x}px; width: {periodPosition().width}px; bottom: {cardGeometry.bottom}px; height: {cardHeight}px; z-index: {cardGeometry.zIndex};"
		title="{layout.name[$currentLocale]}"
		use:bindPointerClick={() => onCardClick(layout.id)}
		tabindex="0"
	>
		<div
			class="h-full w-full origin-center transition-transform duration-200 ease-out motion-reduce:transition-none backdrop-blur-sm flex items-center justify-center px-2 font-medium shadow-sm overflow-hidden"
			class:shadow-lg={isSelected}
			class:shadow-md={!isSelected}
			class:rounded-[5px]={isSelected}
			class:border-2={isSelected}
			class:border-selection-outline={isSelected}
			style="transform: translateY({selectionTransform.translateY}px) scale({selectionTransform.scaleX}, {selectionTransform.scaleY}); {gradientBackground()}; color: var(--theme-on-media);"
		>
			{#if titleFits}
				<div class="flex flex-col items-center justify-center w-full h-full p-2 min-w-0 min-h-0 overflow-hidden">
					<span class="w-full min-w-0 text-sm font-semibold mb-1 shrink-0 text-center whitespace-nowrap">
						{label}
					</span>
					{#if showDescription}
						<div class="w-full min-w-0 text-[13px] leading-relaxed text-center opacity-90 overflow-hidden line-clamp-3">
							{layout.description[$currentLocale]}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}
