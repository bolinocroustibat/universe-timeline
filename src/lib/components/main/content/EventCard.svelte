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

interface Props {
	layout: EventLayout
	zoneHeight: number
	isTopCard: boolean
	isHovered: boolean
	onCardClick: (eventId: number) => void
	onCardHover: (eventId: number | null) => void
}

let {
	layout,
	zoneHeight,
	isTopCard,
	isHovered,
	onCardClick,
	onCardHover,
}: Props = $props()

const zIndex = $derived(
	isTopCard
		? Z_INDEX_SELECTED
		: isHovered
			? Z_INDEX_HOVERED
			: layout.zIndexBase,
)

const isSelected = $derived(isTopCard)
const isPeriodTier = $derived(layout.tier === "period")
const spanBand = $derived(layout.spanBand)

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

{#if isPeriodTier && spanBand}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_tabindex, a11y_no_static_element_interactions -->
	<div
		data-event-card
		data-selected={isSelected || undefined}
		class="absolute cursor-pointer overflow-hidden shadow-sm"
		class:shadow-lg={isSelected}
		class:shadow-md={!isSelected}
		class:rounded-[5px]={isSelected}
		class:border-2={isSelected}
		class:border-selection-outline={isSelected}
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

	{#if isSelected && layout.event.description[$currentLocale]}
		<div
			data-event-card
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
{:else}
	{#if layout.tier === "range"}
		<div
			class="absolute pointer-events-none bg-gradient-to-t from-accent/60 to-accent-secondary/40"
			class:from-accent={isSelected}
			class:to-accent-secondary={isSelected}
			style="left: {layout.anchor.x}px; width: {layout.anchor.width}px; bottom: 0; height: {layout.markerHeight}px; z-index: {zIndex - 1};"
		></div>
	{/if}

	{#if layout.tier === "point"}
		<div
			class="absolute w-px bg-gradient-to-t from-accent/60 to-accent-secondary/40 pointer-events-none"
			class:from-accent={isSelected}
			class:to-accent-secondary={isSelected}
			style="transform: translateX({layout.anchor.x}px); bottom: 0; height: {layout.markerHeight}px; z-index: {zIndex - 1}; clip-path: polygon(0 0, 100% 0, 50% 100%);"
		></div>
	{/if}

	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_tabindex, a11y_no_static_element_interactions -->
	<div
		data-event-card
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
