<script lang="ts">
import { tick } from "svelte"
import DetailPanel from "#lib/components/main/content/DetailPanel.svelte"
import { currentLocale } from "#lib/stores/localeStore.js"
import type { Event } from "#lib/types/index.js"
import type { DetailContentParts } from "#lib/utils/detailContentFit.js"
import {
	getEventConnectorStroke,
	getEventMarkerGradientStops,
	getEventPigmentHorizontalStops,
} from "#lib/utils/eventColors.js"
import {
	buildEventConnectorPath,
	buildEventDateMarkerPath,
	getEventConnectorBBox,
	getEventDateMarkerBBox,
} from "#lib/utils/eventDateMarkerPath.js"
import type { EventDisplayTier } from "#lib/utils/eventLayout.js"
import { EVENT_CARD_HEIGHT, EVENT_CARD_WIDTH } from "#lib/utils/eventLayout.js"
import { formatDate } from "#lib/utils/formatters.js"
import { bindPointerClick } from "#lib/utils/pointerClickOrDrag.js"
import { getEventCardTopCornerRadiusStyle } from "#lib/utils/spanBandCorners.js"

function measureCardHeight(element: HTMLDivElement): number {
	return Math.ceil(element.getBoundingClientRect().height)
}

interface Props {
	event: Event
	tier: EventDisplayTier
	connectorOnly: boolean
	cardX: number
	cardWidth: number
	anchorX: number
	anchorWidth: number
	markerHeight: number
	bottom: number
	zIndex: number
	eventColor: string
	shapeId: string
	isSelected: boolean
	isHovered: boolean
	inlineDetail: boolean
	onCardClick?: (eventId: number) => void
	onPointerEnter?: () => void
	onPointerLeave?: () => void
}

let {
	event,
	tier,
	connectorOnly,
	cardX,
	cardWidth,
	anchorX,
	anchorWidth,
	markerHeight,
	bottom,
	zIndex,
	eventColor,
	shapeId,
	isSelected,
	isHovered,
	inlineDetail,
	onCardClick,
	onPointerEnter,
	onPointerLeave,
}: Props = $props()

let contentEl = $state<HTMLDivElement | undefined>(undefined)
let measuredCardHeight = $state(EVENT_CARD_HEIGHT)

const topLeft = $derived(cardX)
const topRight = $derived(cardX + cardWidth)
const bottomLeft = $derived(anchorX)
const bottomRight = $derived(tier === "point" ? anchorX : anchorX + anchorWidth)

const label = $derived(event.name[$currentLocale])
const description = $derived(event.description[$currentLocale])

const detailParts = $derived.by((): DetailContentParts | null => {
	if (!description) {
		return null
	}

	return {
		title: label,
		subtitle: formatDate(event.date, $currentLocale),
		description,
	}
})

const collapsedCardHeight = $derived(EVENT_CARD_HEIGHT)

const cardHeight = $derived(
	connectorOnly ? 0 : inlineDetail ? measuredCardHeight : collapsedCardHeight,
)

const bbox = $derived(
	connectorOnly
		? getEventDateMarkerBBox({
				topLeft,
				topRight,
				bottomLeft,
				bottomRight,
				height: markerHeight,
			})
		: getEventConnectorBBox({
				topLeft,
				topRight,
				bottomLeft,
				bottomRight,
				height: markerHeight,
				cardHeight,
			}),
)

const pathD = $derived(
	connectorOnly
		? buildEventDateMarkerPath(
				{
					topLeft,
					topRight,
					bottomLeft,
					bottomRight,
					height: markerHeight,
				},
				bbox.left,
			)
		: buildEventConnectorPath(
				{
					topLeft,
					topRight,
					bottomLeft,
					bottomRight,
					height: markerHeight,
					cardHeight,
				},
				bbox.left,
			),
)

const gradientStops = $derived(
	getEventMarkerGradientStops(eventColor, "foreground"),
)
const gradientId = $derived(`event-connector-gradient-${shapeId}`)
const pigmentGradientId = $derived(`event-connector-pigment-${shapeId}`)
const pigmentStops = $derived(getEventPigmentHorizontalStops(eventColor))
const stroke = $derived(
	getEventConnectorStroke(eventColor, isSelected, isHovered),
)

const contentLeft = $derived(cardX - bbox.left)
const contentClipCornerRadiusStyle = getEventCardTopCornerRadiusStyle()

function handleCardClick(): void {
	if (!connectorOnly) {
		onCardClick?.(event.id)
	}
}

$effect(() => {
	if (connectorOnly || !contentEl || !inlineDetail) {
		return
	}

	void isSelected
	void label
	void description

	const updateHeight = (): void => {
		if (!contentEl) {
			return
		}

		const nextHeight = measureCardHeight(contentEl)
		if (nextHeight > 0) {
			measuredCardHeight = nextHeight
		}
	}

	updateHeight()
	void tick().then(updateHeight)

	const observer = new ResizeObserver(() => {
		updateHeight()
	})

	observer.observe(contentEl)
	return () => observer.disconnect()
})

$effect(() => {
	if (!inlineDetail) {
		measuredCardHeight = collapsedCardHeight
	}
})
</script>

<div
	class="absolute pointer-events-none"
	data-event-connector={!connectorOnly || undefined}
	data-event-card={!connectorOnly || undefined}
	data-selected={!connectorOnly && isSelected ? true : undefined}
	style="left: {bbox.left}px; bottom: {bottom}px; width: {bbox.width}px; height: {bbox.height}px; z-index: {zIndex};"
>
	<svg
		class="absolute inset-0 overflow-visible"
		viewBox="0 0 {bbox.width} {bbox.height}"
		aria-hidden={connectorOnly}
	>
		<defs>
			<linearGradient
				id={gradientId}
				gradientUnits="userSpaceOnUse"
				x1="0"
				y1={bbox.height}
				x2="0"
				y2="0"
			>
				{#each gradientStops as stop (stop.offset)}
					<stop offset={stop.offset} stop-color={stop.color} />
				{/each}
			</linearGradient>
			<linearGradient
				id={pigmentGradientId}
				gradientUnits="objectBoundingBox"
				x1="0"
				y1="0"
				x2="1"
				y2="0"
			>
				{#each pigmentStops as stop (stop.offset)}
					<stop offset={stop.offset} stop-color={stop.color} />
				{/each}
			</linearGradient>
		</defs>
		<path
			d={pathD}
			fill="url(#{gradientId})"
			stroke={stroke.stroke}
			stroke-width={stroke.strokeWidth}
			class="pointer-events-none"
		/>
		<path
			d={pathD}
			fill="url(#{pigmentGradientId})"
			class="pointer-events-none"
		/>
		{#if !connectorOnly}
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
			<path
				d={pathD}
				fill="white"
				fill-opacity="0.001"
				stroke="none"
				style="pointer-events: all;"
				class="cursor-pointer outline-none"
				use:bindPointerClick={handleCardClick}
				onpointerenter={onPointerEnter}
				onpointerleave={onPointerLeave}
			/>
		{/if}
	</svg>

	{#if !connectorOnly}
		<div
			class="absolute top-0 overflow-hidden pointer-events-none"
			style="left: {contentLeft}px; width: {cardWidth}px; height: {cardHeight}px; {contentClipCornerRadiusStyle}"
		>
			<div
				bind:this={contentEl}
				class="p-4 text-on-media bg-transparent box-border {cardWidth > EVENT_CARD_WIDTH
					? 'text-center'
					: ''}"
			>
				{#if inlineDetail && detailParts}
					<DetailPanel parts={detailParts} variant="on-media" class="p-0" />
				{:else}
					<div class="font-semibold mb-2 transition-all duration-200 text-sm line-clamp-2">
						{label}
					</div>
					<div class="text-on-media/80 font-medium mb-2 transition-all duration-200 text-xs">
						{formatDate(event.date, $currentLocale)}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
