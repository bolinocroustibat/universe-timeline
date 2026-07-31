<script lang="ts">
import type { EventDisplayTier } from "$lib/utils/eventLayout"

interface Props {
	tier: Extract<EventDisplayTier, "range" | "point">
	layer: "background" | "foreground"
	anchorX: number
	anchorWidth: number
	markerHeight: number
	zIndex: number
	markerStyle: string
}

let {
	tier,
	layer,
	anchorX,
	anchorWidth,
	markerHeight,
	zIndex,
	markerStyle,
}: Props = $props()
</script>

{#if tier === "range"}
	<div
		data-event-layer={layer}
		class="absolute pointer-events-none"
		style="left: {anchorX}px; width: {anchorWidth}px; bottom: 0; height: {markerHeight}px; z-index: {zIndex}; {markerStyle}"
	></div>
{:else}
	<div
		data-event-layer={layer}
		class="absolute w-px pointer-events-none"
		style="transform: translateX({anchorX}px); bottom: 0; height: {markerHeight}px; z-index: {zIndex}; clip-path: polygon(0 0, 100% 0, 50% 100%); {markerStyle}"
	></div>
{/if}
