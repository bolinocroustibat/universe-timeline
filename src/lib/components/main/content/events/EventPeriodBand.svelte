<script lang="ts">
import SpanBand from "$lib/components/main/content/SpanBand.svelte"
import { getEventPanelBorderStyle } from "$lib/utils/eventColors"
import { bindPointerClick } from "$lib/utils/pointerClickOrDrag"
import {
	getEventPeriodBandCornerFlags,
	getSpanBandCornerRadiusStyle,
} from "$lib/utils/spanBandCorners"

const HORIZONTAL_PADDING = 32
const CHAR_WIDTH = 7.5
const MIN_HEIGHT_TITLE = 28

interface Props {
	eventId: number
	layer: "background" | "foreground"
	isSelected: boolean
	isHovered: boolean
	eventColor: string
	label: string
	lane: number
	maxLaneInGroup: number
	anchorX: number
	anchorWidth: number
	spanBottom: number
	spanHeight: number
	zIndex: number
	spanBackground: string
	onCardClick: (eventId: number) => void
	onPointerEnter: () => void
	onPointerLeave: () => void
}

let {
	eventId,
	layer,
	isSelected,
	isHovered,
	eventColor,
	label,
	lane,
	maxLaneInGroup,
	anchorX,
	anchorWidth,
	spanBottom,
	spanHeight,
	zIndex,
	spanBackground,
	onCardClick,
	onPointerEnter,
	onPointerLeave,
}: Props = $props()

const titleFitsInSpan = $derived(
	anchorWidth >= label.length * CHAR_WIDTH + HORIZONTAL_PADDING &&
		spanHeight >= MIN_HEIGHT_TITLE,
)

const borderStyle = $derived(
	getEventPanelBorderStyle(eventColor, isSelected, isHovered),
)

const cornerRadiusStyle = $derived(
	getSpanBandCornerRadiusStyle(
		getEventPeriodBandCornerFlags(lane, maxLaneInGroup),
	),
)
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
	data-event-card
	data-event-layer={layer}
	data-selected={isSelected || undefined}
	class="absolute cursor-pointer overflow-hidden box-border outline-none"
	style="left: {anchorX}px; width: {anchorWidth}px; bottom: {spanBottom}px; height: {spanHeight}px; z-index: {zIndex}; {cornerRadiusStyle} {borderStyle}"
	title="{label}"
	use:bindPointerClick={() => onCardClick(eventId)}
	onpointerenter={onPointerEnter}
	onpointerleave={onPointerLeave}
>
	<SpanBand
		backgroundStyle={spanBackground}
		class="flex h-full w-full items-center justify-center px-2 font-medium text-on-media"
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
