<script lang="ts">
import { currentLocale } from "$lib/stores/localeStore"
import {
	type GeologicalPeriodWithLayout,
	getGeologicalPeriodCardGeometry,
	getGeologicalPeriodSelectionTransform,
} from "$lib/utils/geologicalPeriodLayout"
import { bindPointerClick } from "$lib/utils/pointerClickOrDrag"
import { getSpanBandBackgroundStyle } from "$lib/utils/spanBandStyle"
import { getClampedSpanPosition } from "$lib/utils/spanPosition"

interface Props {
	layout: GeologicalPeriodWithLayout
	zoneHeight: number
	leftEdgeYear: number
	rightEdgeYear: number
	yearsPerPixel: number
	isTopCard: boolean
	onCardClick: (geologicalPeriodId: number) => void
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

const spanPosition = $derived(() =>
	getClampedSpanPosition({
		start: layout.start,
		end: layout.end,
		leftEdgeYear,
		rightEdgeYear,
		yearsPerPixel,
	}),
)

const gradientBackground = $derived(() => {
	const currentColor = layout.color || "#3d4558"

	return getSpanBandBackgroundStyle({
		color: currentColor,
		leftNeighborColor: layout.leftGeologicalPeriod?.color ?? null,
		rightNeighborColor: layout.rightGeologicalPeriod?.color ?? null,
	})
})

const isVisible = $derived(
	layout.end >= leftEdgeYear && layout.start <= rightEdgeYear,
)

const cardGeometry = $derived(
	getGeologicalPeriodCardGeometry({
		depth: layout.depth,
		zoneHeight,
		isSelected: isTopCard,
		hasVisibleDescendants: layout.hasVisibleDescendants,
	}),
)

const isSelected = $derived(isTopCard)

const selectionTransform = $derived(
	getGeologicalPeriodSelectionTransform({
		zoneHeight,
		cardHeight: cardGeometry.height,
		bottom: cardGeometry.bottom,
		isSelected,
	}),
)

const HORIZONTAL_PADDING = 32
const CHAR_WIDTH = 7.5
const MIN_HEIGHT_TITLE = 28

const cardWidth = $derived(spanPosition().width)
const cardHeight = $derived(cardGeometry.height)
const label = $derived(layout.name[$currentLocale])

const titleFits = $derived(
	cardWidth >= label.length * CHAR_WIDTH + HORIZONTAL_PADDING &&
		cardHeight >= MIN_HEIGHT_TITLE,
)
</script>

{#if isVisible && cardHeight > 0}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_tabindex, a11y_no_static_element_interactions -->
	<div
		data-geological-period-card
		class="absolute overflow-visible cursor-pointer"
		style="left: {spanPosition().x}px; width: {spanPosition().width}px; bottom: {cardGeometry.bottom}px; height: {cardHeight}px; z-index: {cardGeometry.zIndex};"
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
					<span class="w-full min-w-0 text-sm font-semibold shrink-0 text-center whitespace-nowrap">
						{label}
					</span>
				</div>
			{/if}
		</div>
	</div>
{/if}
