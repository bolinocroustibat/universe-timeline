<script lang="ts">
import EventConnectorCard from "$lib/components/main/content/events/EventConnectorCard.svelte"
import EventDetailCard from "$lib/components/main/content/events/EventDetailCard.svelte"
import EventPeriodBand from "$lib/components/main/content/events/EventPeriodBand.svelte"
import { currentLocale } from "$lib/stores/localeStore"
import { getEventColor } from "$lib/utils/eventColors"
import type { EventLayout } from "$lib/utils/eventLayout"
import {
	EVENT_Z_INDEX_HOVERED,
	EVENT_Z_INDEX_SELECTED,
} from "$lib/utils/eventLayout"
import { getSpanBandBackgroundStyle } from "$lib/utils/spanBandStyle"
import { bindPointerClick } from "$lib/utils/pointerClickOrDrag"

/**
 * Paint layer for event visuals.
 *
 * - background: inactive period span bands that must stay behind every card.
 * - foreground: interactive cards (range/point connectors) and the active
 *   event's own period uncertainty visuals.
 */
export type EventCardLayer = "background" | "foreground"

interface Props {
	layout: EventLayout
	zoneHeight: number
	layer?: EventCardLayer
	isTopCard: boolean
	isHovered: boolean
	onCardClick: (eventId: number) => void
	onCardHover: (eventId: number | null) => void
}

let {
	layout,
	zoneHeight,
	layer = "foreground",
	isTopCard,
	isHovered,
	onCardClick,
	onCardHover,
}: Props = $props()

const isSelected = $derived(isTopCard)
const isPeriodTier = $derived(layout.tier === "period")
const spanBand = $derived(layout.spanBand)

const zIndex = $derived(
	isTopCard
		? EVENT_Z_INDEX_SELECTED
		: isHovered
			? EVENT_Z_INDEX_HOVERED
			: layout.zIndexBase,
)

const PERIOD_BACKGROUND_Z_BASE = 100

/** Stacking order among background visuals only (that layer sits below all cards). */
const backgroundZIndex = $derived(PERIOD_BACKGROUND_Z_BASE + layout.lane)

const eventColor = $derived(getEventColor(layout.event))

const spanBackground = $derived(
	getSpanBandBackgroundStyle({
		color: eventColor,
		fadeEdges: true,
	}),
)

const label = $derived(layout.event.name[$currentLocale])

const PERIOD_DETAIL_GAP_PX = 8

const periodHitWidth = $derived.by(() => {
	if (!isPeriodTier || !spanBand) {
		return null
	}

	const left = Math.min(layout.card.x, layout.anchor.x)
	const width =
		Math.max(
			layout.card.x + layout.card.width,
			layout.anchor.x + layout.anchor.width,
		) - left

	return { left, width }
})

function handlePointerEnter() {
	onCardHover(layout.event.id)
}

function handlePointerLeave() {
	onCardHover(null)
}
</script>

{#if layer === "background"}
	{#if isPeriodTier && spanBand && !isSelected}
		<EventPeriodBand
			eventId={layout.event.id}
			layer="background"
			{isSelected}
			isHovered={isHovered && !isSelected}
			{eventColor}
			{label}
			lane={layout.lane}
			maxLaneInGroup={layout.maxLaneInGroup}
			anchorX={layout.anchor.x}
			anchorWidth={layout.anchor.width}
			spanBottom={spanBand.bottom}
			spanHeight={spanBand.height}
			zIndex={backgroundZIndex}
			{spanBackground}
			onCardClick={onCardClick}
			onPointerEnter={handlePointerEnter}
			onPointerLeave={handlePointerLeave}
		/>
	{/if}
{/if}

{#if layer === "foreground"}
	{#if isPeriodTier && spanBand && isSelected}
		<EventPeriodBand
			eventId={layout.event.id}
			layer="foreground"
			{isSelected}
			isHovered={isHovered && !isSelected}
			{eventColor}
			{label}
			lane={layout.lane}
			maxLaneInGroup={layout.maxLaneInGroup}
			anchorX={layout.anchor.x}
			anchorWidth={layout.anchor.width}
			spanBottom={spanBand.bottom}
			spanHeight={spanBand.height}
			{zIndex}
			{spanBackground}
			onCardClick={onCardClick}
			onPointerEnter={handlePointerEnter}
			onPointerLeave={handlePointerLeave}
		/>

		{#if layout.event.description[$currentLocale] && periodHitWidth}
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
			<div
				data-event-card
				class="absolute cursor-pointer outline-none"
				style="left: {periodHitWidth.left}px; width: {periodHitWidth.width}px; bottom: {spanBand.bottom + spanBand.height}px; height: {PERIOD_DETAIL_GAP_PX}px; z-index: {zIndex};"
				use:bindPointerClick={() => onCardClick(layout.event.id)}
				onpointerenter={handlePointerEnter}
				onpointerleave={handlePointerLeave}
				aria-hidden="true"
			></div>

			<EventDetailCard
				event={layout.event}
				{eventColor}
				cardX={layout.card.x}
				cardBottom={spanBand.bottom + spanBand.height + PERIOD_DETAIL_GAP_PX}
				cardWidth={layout.card.width}
				{zIndex}
				isHovered={isHovered && !isSelected}
				onCardClick={onCardClick}
				onPointerEnter={handlePointerEnter}
				onPointerLeave={handlePointerLeave}
			/>
		{/if}
	{:else if layout.tier === "range" || layout.tier === "point"}
		<EventConnectorCard
			event={layout.event}
			tier={layout.tier}
			layer="foreground"
			connectorOnly={false}
			cardX={layout.card.x}
			cardWidth={layout.card.width}
			anchorX={layout.anchor.x}
			anchorWidth={layout.anchor.width}
			markerHeight={layout.markerHeight}
			{zIndex}
			eventColor={eventColor}
			variant="foreground"
			shapeId="{layout.event.id}-foreground"
			{isSelected}
			isHovered={isHovered && !isSelected}
			onCardClick={onCardClick}
			onPointerEnter={handlePointerEnter}
			onPointerLeave={handlePointerLeave}
		/>
	{/if}
{/if}
