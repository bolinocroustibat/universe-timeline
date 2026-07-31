<script lang="ts">
import EventDateMarker from "$lib/components/main/content/events/EventDateMarker.svelte"
import EventDetailCard from "$lib/components/main/content/events/EventDetailCard.svelte"
import EventPeriodBand from "$lib/components/main/content/events/EventPeriodBand.svelte"
import { currentLocale } from "$lib/stores/localeStore"
import {
	getEventCardBorderStyle,
	getEventColor,
	getEventDetailCardStyle,
	getEventMarkerStyle,
} from "$lib/utils/eventColors"
import type { EventLayout } from "$lib/utils/eventLayout"
import {
	EVENT_Z_INDEX_HOVERED,
	EVENT_Z_INDEX_SELECTED,
} from "$lib/utils/eventLayout"
import { getSpanBandBackgroundStyle } from "$lib/utils/spanBandStyle"

/**
 * Paint layer for event visuals.
 *
 * - background: uncertainty visuals that must stay behind every card — inactive
 *   period span bands, and range/point date markers (the bar or tick below a card).
 * - foreground: interactive cards, plus the active event's own uncertainty visuals.
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

/** Range/point markers sit below period span bands within the background layer. */
const MARKER_BACKGROUND_Z_BASE = 0
const PERIOD_BACKGROUND_Z_BASE = 100

/** Stacking order among background visuals only (that layer sits below all cards). */
const backgroundZIndex = $derived(
	isPeriodTier
		? PERIOD_BACKGROUND_Z_BASE + layout.lane
		: MARKER_BACKGROUND_Z_BASE + layout.lane,
)

const eventColor = $derived(getEventColor(layout.event))

const spanBackground = $derived(
	getSpanBandBackgroundStyle({
		color: eventColor,
		fadeEdges: true,
	}),
)

const markerBackgroundStyle = $derived(
	getEventMarkerStyle(eventColor, "background"),
)
const markerForegroundStyle = $derived(
	getEventMarkerStyle(eventColor, "foreground"),
)
const cardBorderStyle = $derived(
	getEventCardBorderStyle(eventColor, isSelected, isHovered),
)
const detailCardStyle = $derived(getEventDetailCardStyle(eventColor))
const periodSpanBorderStyle = $derived(
	isSelected ? `border-color: ${eventColor};` : "",
)

const label = $derived(layout.event.name[$currentLocale])

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
			{label}
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
	{:else if layout.tier === "range" && !isSelected}
		<EventDateMarker
			tier="range"
			layer="background"
			anchorX={layout.anchor.x}
			anchorWidth={layout.anchor.width}
			markerHeight={layout.markerHeight}
			zIndex={backgroundZIndex}
			markerStyle={markerBackgroundStyle}
		/>
	{:else if layout.tier === "point" && !isSelected}
		<EventDateMarker
			tier="point"
			layer="background"
			anchorX={layout.anchor.x}
			anchorWidth={layout.anchor.width}
			markerHeight={layout.markerHeight}
			zIndex={backgroundZIndex}
			markerStyle={markerBackgroundStyle}
		/>
	{/if}
{/if}

{#if layer === "foreground"}
	{#if isPeriodTier && spanBand && isSelected}
		<EventPeriodBand
			eventId={layout.event.id}
			layer="foreground"
			{isSelected}
			{label}
			anchorX={layout.anchor.x}
			anchorWidth={layout.anchor.width}
			spanBottom={spanBand.bottom}
			spanHeight={spanBand.height}
			{zIndex}
			{spanBackground}
			borderStyle={periodSpanBorderStyle}
			onCardClick={onCardClick}
			onPointerEnter={handlePointerEnter}
			onPointerLeave={handlePointerLeave}
		/>

		{#if layout.event.description[$currentLocale]}
			<EventDetailCard
				event={layout.event}
				variant="period"
				layer="foreground"
				{isSelected}
				cardX={layout.card.x}
				cardBottom={spanBand.bottom + spanBand.height + 8}
				cardWidth={layout.card.width}
				{zIndex}
				cardStyle={detailCardStyle}
			/>
		{/if}
	{:else if !isPeriodTier}
		{#if layout.tier === "range" && isSelected}
			<EventDateMarker
				tier="range"
				layer="foreground"
				anchorX={layout.anchor.x}
				anchorWidth={layout.anchor.width}
				markerHeight={layout.markerHeight}
				zIndex={zIndex - 1}
				markerStyle={markerForegroundStyle}
			/>
		{/if}

		{#if layout.tier === "point" && isSelected}
			<EventDateMarker
				tier="point"
				layer="foreground"
				anchorX={layout.anchor.x}
				anchorWidth={layout.anchor.width}
				markerHeight={layout.markerHeight}
				zIndex={zIndex - 1}
				markerStyle={markerForegroundStyle}
			/>
		{/if}

		<EventDetailCard
			event={layout.event}
			variant="interactive"
			layer="foreground"
			{isSelected}
			cardX={layout.card.x}
			cardBottom={layout.bottom}
			cardWidth={layout.card.width}
			{zIndex}
			cardStyle={cardBorderStyle}
			onCardClick={onCardClick}
			onPointerEnter={handlePointerEnter}
			onPointerLeave={handlePointerLeave}
		/>
	{/if}
{/if}
