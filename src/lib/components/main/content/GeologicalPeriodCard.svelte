<script lang="ts">
import DetailPanel from "#lib/components/main/content/DetailPanel.svelte"
import SpanBand from "#lib/components/main/content/SpanBand.svelte"
import { currentLocale } from "#lib/stores/localeStore.js"
import { detailTitleFitsInContainer } from "#lib/utils/detailContentFit.js"
import {
	type GeologicalPeriodWithLayout,
	geologicalPeriodDetailFitsInline,
	getGeologicalPeriodCardGeometry,
	getGeologicalPeriodSelectionTransform,
} from "#lib/utils/geologicalPeriodLayout.js"
import { bindPointerClick } from "#lib/utils/pointerClickOrDrag.js"
import { getSpanBandBackgroundStyle } from "#lib/utils/spanBandStyle.js"
import { getClampedSpanPosition } from "#lib/utils/spanPosition.js"

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

const cardWidth = $derived(spanPosition().width)
const cardHeight = $derived(cardGeometry.height)
const label = $derived(layout.name[$currentLocale])
const description = $derived(layout.description[$currentLocale])

const detailParts = $derived(
	description
		? {
				title: label,
				description,
			}
		: null,
)

const inlineDetail = $derived(
	isSelected &&
		detailParts != null &&
		geologicalPeriodDetailFitsInline(detailParts, cardWidth, cardHeight),
)

const titleFits = $derived(
	detailTitleFitsInContainer(label, cardWidth, cardHeight),
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
			class="h-full w-full origin-center transition-transform duration-200 ease-out motion-reduce:transition-none shadow-sm overflow-hidden"
			class:shadow-lg={isSelected}
			class:shadow-md={!isSelected}
			class:rounded-[5px]={isSelected}
			class:border-2={isSelected}
			class:border-selection-outline={isSelected}
			style="transform: translateY({selectionTransform.translateY}px) scale({selectionTransform.scaleX}, {selectionTransform.scaleY}); color: var(--theme-on-media);"
		>
			<SpanBand
				backgroundStyle={gradientBackground()}
				class="flex h-full w-full items-center justify-center px-2 font-medium"
			>
				{#if inlineDetail && detailParts}
					<DetailPanel
						parts={detailParts}
						variant="on-media"
						class="h-full w-full overflow-y-auto"
					/>
				{:else if titleFits}
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
