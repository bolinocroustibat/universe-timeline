<script lang="ts">
import DetailPopover from "#lib/components/main/content/DetailPopover.svelte"
import EventConnectorCard from "#lib/components/main/content/events/EventConnectorCard.svelte"
import { EVENT_CARD_MIN_BOTTOM_OFFSET_PX } from "#lib/constants/index.js"
import { currentLocale } from "#lib/stores/localeStore.js"
import type { DetailContentParts } from "#lib/utils/detailContentFit.js"
import { detailContentFitsInContainer } from "#lib/utils/detailContentFit.js"
import {
	estimateDetailPopoverHeight,
	getBottomAnchoredDetailPopoverLayout,
	getDetailPopoverScrollMaxHeight,
	getDetailPopoverWidth,
} from "#lib/utils/detailPopoverLayout.js"
import { getEventColor } from "#lib/utils/eventColors.js"
import type { EventLayout } from "#lib/utils/eventLayout.js"
import {
	EVENT_CARD_HEIGHT,
	EVENT_Z_INDEX_HOVERED,
	EVENT_Z_INDEX_SELECTED,
} from "#lib/utils/eventLayout.js"
import { formatDate } from "#lib/utils/formatters.js"

interface Props {
	layout: EventLayout
	zoneHeight: number
	viewportWidth: number
	isTopCard: boolean
	isHovered: boolean
	onCardClick: (eventId: number) => void
	onCardHover: (eventId: number | null) => void
}

let {
	layout,
	zoneHeight,
	viewportWidth,
	isTopCard,
	isHovered,
	onCardClick,
	onCardHover,
}: Props = $props()

const isSelected = $derived(isTopCard)

const zIndex = $derived(
	isTopCard
		? EVENT_Z_INDEX_SELECTED
		: isHovered
			? EVENT_Z_INDEX_HOVERED
			: layout.zIndexBase,
)

const eventColor = $derived(getEventColor(layout.event))

const label = $derived(layout.event.name[$currentLocale])
const description = $derived(layout.event.description[$currentLocale])

const detailParts = $derived.by((): DetailContentParts | null => {
	if (!description) {
		return null
	}

	return {
		title: label,
		subtitle: formatDate(layout.event.date, $currentLocale),
		description,
	}
})

const connectorMaxInlineHeight = $derived(
	Math.max(
		0,
		zoneHeight - EVENT_CARD_MIN_BOTTOM_OFFSET_PX - layout.markerHeight - 8,
	),
)

const connectorInlineDetail = $derived.by(() => {
	if (!isSelected || !detailParts) {
		return false
	}

	return detailContentFitsInContainer(
		detailParts,
		layout.card.width,
		connectorMaxInlineHeight,
	)
})

const detailPopoverLayout = $derived.by(() => {
	if (!isSelected || !detailParts || zoneHeight <= 0 || connectorInlineDetail) {
		return null
	}

	const popoverWidth = getDetailPopoverWidth(viewportWidth)
	const estimatedHeight = estimateDetailPopoverHeight(
		detailParts.title,
		detailParts.subtitle,
		detailParts.description,
		popoverWidth,
	)

	const anchorTopFromBottom =
		EVENT_CARD_MIN_BOTTOM_OFFSET_PX + layout.markerHeight + EVENT_CARD_HEIGHT

	return getBottomAnchoredDetailPopoverLayout({
		anchorX: layout.card.x + layout.card.width / 2,
		anchorTopFromBottom,
		anchorBottomFromBottom:
			EVENT_CARD_MIN_BOTTOM_OFFSET_PX + layout.markerHeight,
		zoneHeight,
		popoverWidth,
		viewportWidth,
		estimatedPopoverHeight: estimatedHeight,
	})
})

const descriptionMaxHeight = $derived(
	detailPopoverLayout && detailParts
		? getDetailPopoverScrollMaxHeight(
				detailParts.title,
				detailParts.subtitle,
				detailParts.description,
				getDetailPopoverWidth(viewportWidth),
			)
		: undefined,
)

function handlePointerEnter() {
	onCardHover(layout.event.id)
}

function handlePointerLeave() {
	onCardHover(null)
}
</script>

<EventConnectorCard
	event={layout.event}
	tier={layout.tier}
	connectorOnly={false}
	cardX={layout.card.x}
	cardWidth={layout.card.width}
	anchorX={layout.anchor.x}
	anchorWidth={layout.anchor.width}
	markerHeight={layout.markerHeight}
	bottom={layout.bottom - layout.markerHeight}
	{zIndex}
	eventColor={eventColor}
	shapeId="{layout.event.id}-foreground"
	{isSelected}
	isHovered={isHovered && !isSelected}
	inlineDetail={connectorInlineDetail}
	onCardClick={onCardClick}
	onPointerEnter={handlePointerEnter}
	onPointerLeave={handlePointerLeave}
/>

{#if detailPopoverLayout && detailParts}
	<DetailPopover
		parts={detailParts}
		layout={detailPopoverLayout}
		{zIndex}
		ariaLabel={label}
		dataEventCard
		onCardClick={() => onCardClick(layout.event.id)}
		onPointerEnter={handlePointerEnter}
		onPointerLeave={handlePointerLeave}
		{descriptionMaxHeight}
	/>
{/if}
