<script lang="ts">
import DetailPanel from "#lib/components/main/content/DetailPanel.svelte"
import SpanBand from "#lib/components/main/content/SpanBand.svelte"
import type { DetailContentParts } from "#lib/utils/detailContentFit.js"
import { detailTitleFitsInContainer } from "#lib/utils/detailContentFit.js"
import { getEventPanelBorderStyle } from "#lib/utils/eventColors.js"
import { bindPointerClick } from "#lib/utils/pointerClickOrDrag.js"
import {
	getEventPeriodBandCornerFlags,
	getSpanBandCornerRadiusStyle,
} from "#lib/utils/spanBandCorners.js"

interface Props {
	eventId: number
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
	detailParts?: DetailContentParts | null
	onCardClick: (eventId: number) => void
	onPointerEnter: () => void
	onPointerLeave: () => void
}

let {
	eventId,
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
	detailParts = null,
	onCardClick,
	onPointerEnter,
	onPointerLeave,
}: Props = $props()

const showInlineDetail = $derived(isSelected && detailParts != null)

const titleFitsInSpan = $derived(
	detailTitleFitsInContainer(label, anchorWidth, spanHeight),
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
		{#if showInlineDetail && detailParts}
			<DetailPanel parts={detailParts} variant="on-media" class="h-full w-full overflow-y-auto" />
		{:else if titleFitsInSpan}
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
