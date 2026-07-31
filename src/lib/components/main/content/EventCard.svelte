<script lang="ts">
import SpanBand from "$lib/components/main/content/SpanBand.svelte"
import { currentLocale } from "$lib/stores/localeStore"
import type { EventLayout } from "$lib/utils/eventLayout"
import { formatDate } from "$lib/utils/formatters"
import { bindPointerClick } from "$lib/utils/pointerClickOrDrag"
import { getSpanBandBackgroundStyle } from "$lib/utils/spanBandStyle"

const Z_INDEX_SELECTED = 1000
const Z_INDEX_HOVERED = 999

const HORIZONTAL_PADDING = 32
const CHAR_WIDTH = 7.5
const MIN_HEIGHT_TITLE = 28
const EVENT_SPAN_COLOR =
	"color-mix(in srgb, var(--theme-accent) 55%, var(--theme-accent-secondary) 45%)"

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
		? Z_INDEX_SELECTED
		: isHovered
			? Z_INDEX_HOVERED
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

const spanBackground = $derived(
	getSpanBandBackgroundStyle({
		color: EVENT_SPAN_COLOR,
		fadeEdges: true,
	}),
)

const label = $derived(layout.event.name[$currentLocale])

const spanBandHeight = $derived(spanBand?.height ?? 0)

const titleFitsInSpan = $derived(
	isPeriodTier &&
		spanBand != null &&
		layout.anchor.width >= label.length * CHAR_WIDTH + HORIZONTAL_PADDING &&
		spanBandHeight >= MIN_HEIGHT_TITLE,
)

function handlePointerEnter() {
	onCardHover(layout.event.id)
}

function handlePointerLeave() {
	onCardHover(null)
}
</script>

{#if layer === "background"}
	{#if isPeriodTier && spanBand && !isSelected}
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_tabindex, a11y_no_static_element_interactions -->
		<div
			data-event-card
			data-event-layer="background"
			class="absolute cursor-pointer overflow-hidden shadow-sm shadow-md"
			style="left: {layout.anchor.x}px; width: {layout.anchor.width}px; bottom: {spanBand.bottom}px; height: {spanBand.height}px; z-index: {backgroundZIndex};"
			title="{label}"
			use:bindPointerClick={() => onCardClick(layout.event.id)}
			onpointerenter={handlePointerEnter}
			onpointerleave={handlePointerLeave}
			tabindex="0"
		>
			<SpanBand
				backgroundStyle={spanBackground}
				class="flex items-center justify-center px-2 font-medium text-on-media"
			>
				{#if titleFitsInSpan}
					<span class="w-full min-w-0 text-sm font-semibold shrink-0 text-center whitespace-nowrap">
						{label}
					</span>
				{:else}
					<span class="w-full min-w-0 text-sm font-semibold shrink-0 text-center truncate px-2">
						{label}
					</span>
				{/if}
			</SpanBand>
		</div>
	{:else if layout.tier === "range" && !isSelected}
		<div
			data-event-layer="background"
			class="absolute pointer-events-none bg-gradient-to-t from-accent/60 to-accent-secondary/40"
			style="left: {layout.anchor.x}px; width: {layout.anchor.width}px; bottom: 0; height: {layout.markerHeight}px; z-index: {backgroundZIndex};"
		></div>
	{:else if layout.tier === "point" && !isSelected}
		<div
			data-event-layer="background"
			class="absolute w-px bg-gradient-to-t from-accent/60 to-accent-secondary/40 pointer-events-none"
			style="transform: translateX({layout.anchor.x}px); bottom: 0; height: {layout.markerHeight}px; z-index: {backgroundZIndex}; clip-path: polygon(0 0, 100% 0, 50% 100%);"
		></div>
	{/if}
{/if}

{#if layer === "foreground"}
	{#if isPeriodTier && spanBand && isSelected}
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_tabindex, a11y_no_static_element_interactions -->
		<div
			data-event-card
			data-event-layer="foreground"
			data-selected={isSelected || undefined}
			class="absolute cursor-pointer overflow-hidden shadow-sm shadow-lg rounded-[5px] border-2 border-selection-outline"
			style="left: {layout.anchor.x}px; width: {layout.anchor.width}px; bottom: {spanBand.bottom}px; height: {spanBand.height}px; z-index: {zIndex};"
			title="{label}"
			use:bindPointerClick={() => onCardClick(layout.event.id)}
			onpointerenter={handlePointerEnter}
			onpointerleave={handlePointerLeave}
			tabindex="0"
		>
			<SpanBand
				backgroundStyle={spanBackground}
				class="flex items-center justify-center px-2 font-medium text-on-media"
			>
				{#if titleFitsInSpan}
					<span class="w-full min-w-0 text-sm font-semibold shrink-0 text-center whitespace-nowrap">
						{label}
					</span>
				{:else}
					<span class="w-full min-w-0 text-sm font-semibold shrink-0 text-center truncate px-2">
						{label}
					</span>
				{/if}
			</SpanBand>
		</div>

		{#if layout.event.description[$currentLocale]}
			<div
				data-event-card
				data-event-layer="foreground"
				data-selected={isSelected || undefined}
				class="absolute rounded-xl p-4 border-2 border-accent bg-surface-raised ring-1 ring-accent/30 overflow-hidden"
				style="left: {layout.card.x}px; bottom: {spanBand.bottom + spanBand.height + 8}px; z-index: {zIndex}; width: {layout.card.width}px;"
			>
				<div class="font-semibold text-foreground mb-2 text-sm">
					{label}
				</div>
				<div class="text-muted font-medium mb-2 text-xs">
					{formatDate(layout.event.date, $currentLocale)}
				</div>
				<div class="text-foreground/90 leading-relaxed text-xs">
					{layout.event.description[$currentLocale]}
				</div>
			</div>
		{/if}
	{:else if !isPeriodTier}
		{#if layout.tier === "range" && isSelected}
			<div
				data-event-layer="foreground"
				class="absolute pointer-events-none bg-gradient-to-t from-accent to-accent-secondary"
				style="left: {layout.anchor.x}px; width: {layout.anchor.width}px; bottom: 0; height: {layout.markerHeight}px; z-index: {zIndex - 1};"
			></div>
		{/if}

		{#if layout.tier === "point" && isSelected}
			<div
				data-event-layer="foreground"
				class="absolute w-px bg-gradient-to-t from-accent to-accent-secondary pointer-events-none"
				style="transform: translateX({layout.anchor.x}px); bottom: 0; height: {layout.markerHeight}px; z-index: {zIndex - 1}; clip-path: polygon(0 0, 100% 0, 50% 100%);"
			></div>
		{/if}

		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_tabindex, a11y_no_static_element_interactions -->
		<div
			data-event-card
			data-event-layer="foreground"
			data-selected={isSelected || undefined}
			class="absolute rounded-xl p-4 border-2 border-accent/35 cursor-pointer transition-colors duration-300 transition-shadow duration-300 overflow-hidden bg-surface-raised {isSelected ? 'border-accent ring-1 ring-accent/30' : 'hover:border-accent/55'}"
			style="left: {layout.card.x}px; bottom: {layout.bottom}px; z-index: {zIndex}; width: {layout.card.width}px;"
			use:bindPointerClick={() => onCardClick(layout.event.id)}
			onpointerenter={handlePointerEnter}
			onpointerleave={handlePointerLeave}
			tabindex="0"
		>
			<div class="font-semibold text-foreground mb-2 transition-all duration-200 text-sm">
				{layout.event.name[$currentLocale]}
			</div>
			<div class="text-muted font-medium mb-2 transition-all duration-200 text-xs">
				{formatDate(layout.event.date, $currentLocale)}
			</div>
			{#if isSelected && layout.event.description[$currentLocale]}
				<div class="text-foreground/90 leading-relaxed transition-all duration-200 text-xs">
					{layout.event.description[$currentLocale]}
				</div>
			{/if}
		</div>
	{/if}
{/if}
