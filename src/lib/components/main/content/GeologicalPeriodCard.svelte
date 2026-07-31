<script lang="ts">
import SpanBand from "$lib/components/main/content/SpanBand.svelte"
import {
	GEOLOGICAL_PERIOD_BACKGROUND_OPACITY,
	GEOLOGICAL_PERIOD_HOVER_OPACITY,
	GEOLOGICAL_PERIOD_SELECTED_OPACITY,
} from "$lib/constants"
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
	isHovered?: boolean
	layer?: "background" | "foreground"
	onCardClick: (geologicalPeriodId: number) => void
	onPointerEnter?: () => void
	onPointerLeave?: () => void
}

let {
	layout,
	zoneHeight,
	leftEdgeYear,
	rightEdgeYear,
	yearsPerPixel,
	isTopCard,
	isHovered = false,
	layer = "background",
	onCardClick,
	onPointerEnter,
	onPointerLeave,
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
		fadeEdges: layer === "background",
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
		layer,
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

const showLabel = $derived(
	layer === "foreground" ? titleFits : titleFits && (isSelected || isHovered),
)

const bandOpacity = $derived(
	isSelected
		? GEOLOGICAL_PERIOD_SELECTED_OPACITY
		: isHovered
			? GEOLOGICAL_PERIOD_HOVER_OPACITY
			: GEOLOGICAL_PERIOD_BACKGROUND_OPACITY,
)
</script>

{#if isVisible && cardHeight > 0}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_tabindex, a11y_no_static_element_interactions -->
	<div
		data-geological-period-card
		data-geological-period-layer={layer}
		class="absolute overflow-visible cursor-pointer transition-opacity duration-200 ease-out motion-reduce:transition-none"
		style="left: {spanPosition().x}px; width: {spanPosition().width}px; bottom: {cardGeometry.bottom}px; height: {cardHeight}px; z-index: {cardGeometry.zIndex}; opacity: {bandOpacity};"
		title="{layout.name[$currentLocale]}"
		use:bindPointerClick={() => onCardClick(layout.id)}
		onpointerenter={onPointerEnter}
		onpointerleave={onPointerLeave}
		tabindex="0"
	>
		<div
			class="h-full w-full origin-center transition-transform duration-200 ease-out motion-reduce:transition-none overflow-hidden"
			class:shadow-lg={isSelected && layer === "foreground"}
			class:shadow-sm={!isSelected && layer === "foreground"}
			class:rounded-[5px]={isSelected}
			class:border-2={isSelected}
			class:border-selection-outline={isSelected}
			style="transform: translateY({selectionTransform.translateY}px) scale({selectionTransform.scaleX}, {selectionTransform.scaleY}); color: var(--theme-on-media);"
		>
			<SpanBand
				backgroundStyle={gradientBackground()}
				class="flex h-full w-full items-center justify-center px-2 font-medium"
			>
				{#if showLabel}
					<div class="flex flex-col items-center justify-center w-full h-full p-2 min-w-0 min-h-0 overflow-hidden">
						<span class="w-full min-w-0 text-sm font-semibold shrink-0 text-center whitespace-nowrap">
							{label}
						</span>
					</div>
				{/if}
			</SpanBand>
		</div>
	</div>
{/if}
