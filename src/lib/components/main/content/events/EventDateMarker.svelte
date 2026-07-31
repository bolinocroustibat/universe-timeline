<script lang="ts">
import { getEventMarkerGradientStops } from "$lib/utils/eventColors"
import {
	buildEventDateMarkerPath,
	getEventDateMarkerBBox,
} from "$lib/utils/eventDateMarkerPath"
import type { EventDisplayTier } from "$lib/utils/eventLayout"

interface Props {
	tier: Extract<EventDisplayTier, "range" | "point">
	layer: "background" | "foreground"
	cardX: number
	cardWidth: number
	anchorX: number
	anchorWidth: number
	markerHeight: number
	zIndex: number
	eventColor: string
	variant: "background" | "foreground"
	markerId: string
}

let {
	tier,
	layer,
	cardX,
	cardWidth,
	anchorX,
	anchorWidth,
	markerHeight,
	zIndex,
	eventColor,
	variant,
	markerId,
}: Props = $props()

const topLeft = $derived(cardX)
const topRight = $derived(cardX + cardWidth)
const bottomLeft = $derived(anchorX)
const bottomRight = $derived(
	tier === "point" ? anchorX : anchorX + anchorWidth,
)

const bbox = $derived(
	getEventDateMarkerBBox({
		topLeft,
		topRight,
		bottomLeft,
		bottomRight,
		height: markerHeight,
	}),
)

const pathD = $derived(
	buildEventDateMarkerPath(
		{
			topLeft,
			topRight,
			bottomLeft,
			bottomRight,
			height: markerHeight,
		},
		bbox.left,
	),
)

const gradientStops = $derived(getEventMarkerGradientStops(eventColor, variant))
const gradientId = $derived(`event-marker-gradient-${markerId}`)
</script>

<svg
	data-event-layer={layer}
	class="absolute pointer-events-none overflow-visible"
	style="left: {bbox.left}px; bottom: 0; width: {bbox.width}px; height: {markerHeight}px; z-index: {zIndex};"
	viewBox="0 0 {bbox.width} {markerHeight}"
	aria-hidden="true"
>
	<defs>
		<linearGradient
			id={gradientId}
			gradientUnits="userSpaceOnUse"
			x1="0"
			y1={markerHeight}
			x2="0"
			y2="0"
		>
			{#each gradientStops as stop (stop.offset)}
				<stop offset={stop.offset} stop-color={stop.color} />
			{/each}
		</linearGradient>
	</defs>
	<path d={pathD} fill="url(#{gradientId})" />
</svg>
