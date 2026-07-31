<script lang="ts">
import { tick } from "svelte"
import { EVENT_CARD_MIN_BOTTOM_OFFSET_PX } from "$lib/constants"
import { currentLocale } from "$lib/stores/localeStore"
import type { Event } from "$lib/types"
import {
	getEventConnectorStroke,
	getEventMarkerGradientStops,
	getEventPigmentHorizontalStops,
} from "$lib/utils/eventColors"
import {
	buildEventConnectorPath,
	buildEventDateMarkerPath,
	getEventConnectorBBox,
	getEventDateMarkerBBox,
} from "$lib/utils/eventDateMarkerPath"
import type { EventDisplayTier } from "$lib/utils/eventLayout"
import { EVENT_CARD_HEIGHT } from "$lib/utils/eventLayout"
import { formatDate } from "$lib/utils/formatters"
import { bindPointerClick } from "$lib/utils/pointerClickOrDrag"
import { getEventCardTopCornerRadiusStyle } from "$lib/utils/spanBandCorners"

function measureCardHeight(element: HTMLDivElement): number {
	return Math.ceil(element.getBoundingClientRect().height)
}

interface Props {
	event: Event
	tier: Extract<EventDisplayTier, "range" | "point">
	layer: "background" | "foreground"
	connectorOnly: boolean
	cardX: number
	cardWidth: number
	anchorX: number
	anchorWidth: number
	markerHeight: number
	zIndex: number
	eventColor: string
	variant: "background" | "foreground"
	shapeId: string
	isSelected: boolean
	isHovered: boolean
	onCardClick?: (eventId: number) => void
	onPointerEnter?: () => void
	onPointerLeave?: () => void
}

let {
	event,
	tier,
	layer,
	connectorOnly,
	cardX,
	cardWidth,
	anchorX,
	anchorWidth,
	markerHeight,
	zIndex,
	eventColor,
	variant,
	shapeId,
	isSelected,
	isHovered,
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

const cardHeight = $derived(connectorOnly ? 0 : measuredCardHeight)

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

const gradientStops = $derived(getEventMarkerGradientStops(eventColor, variant))
const gradientId = $derived(`event-connector-gradient-${shapeId}`)
const pigmentGradientId = $derived(`event-connector-pigment-${shapeId}`)
const pigmentStops = $derived(getEventPigmentHorizontalStops(eventColor))
const stroke = $derived(
	getEventConnectorStroke(eventColor, isSelected, isHovered),
)

const label = $derived(event.name[$currentLocale])
const description = $derived(event.description[$currentLocale])

const contentLeft = $derived(cardX - bbox.left)
const contentClipCornerRadiusStyle = getEventCardTopCornerRadiusStyle()

$effect(() => {
	if (connectorOnly || !contentEl) {
		return
	}

	// Re-measure when content that affects layout changes.
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
</script>

<div
	class="absolute pointer-events-none"
	data-event-connector={!connectorOnly || undefined}
	data-event-card={!connectorOnly || undefined}
	data-event-layer={layer}
	data-selected={!connectorOnly && isSelected ? true : undefined}
	style="left: {bbox.left}px; bottom: {EVENT_CARD_MIN_BOTTOM_OFFSET_PX}px; width: {bbox.width}px; height: {bbox.height}px; z-index: {zIndex};"
>
	<svg
		class="absolute inset-0 overflow-visible"
		viewBox="0 0 {bbox.width} {bbox.height}"
		aria-hidden="true"
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
		/>
		<path
			d={pathD}
			fill="url(#{pigmentGradientId})"
			class="pointer-events-none"
		/>
	</svg>

	{#if !connectorOnly}
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_tabindex, a11y_no_static_element_interactions -->
		<div
			class="absolute top-0 overflow-hidden pointer-events-auto"
			style="left: {contentLeft}px; width: {cardWidth}px; height: {measuredCardHeight}px; {contentClipCornerRadiusStyle}"
			use:bindPointerClick={() => onCardClick?.(event.id)}
			onpointerenter={onPointerEnter}
			onpointerleave={onPointerLeave}
		>
			<div
				bind:this={contentEl}
				class="p-4 cursor-pointer text-on-media bg-transparent box-border"
				tabindex="0"
			>
				<div class="font-semibold mb-2 transition-all duration-200 text-sm line-clamp-2">
					{label}
				</div>
				<div class="text-on-media/80 font-medium mb-2 transition-all duration-200 text-xs">
					{formatDate(event.date, $currentLocale)}
				</div>
				{#if isSelected && description}
					<div class="text-on-media/90 leading-relaxed transition-all duration-200 text-xs">
						{description}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
