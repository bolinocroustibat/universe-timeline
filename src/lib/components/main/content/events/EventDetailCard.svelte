<script lang="ts">
import SpanBand from "$lib/components/main/content/SpanBand.svelte"
import { currentLocale } from "$lib/stores/localeStore"
import type { Event } from "$lib/types"
import {
	getEventPanelBackgroundStyle,
	getEventPanelBorderStyle,
} from "$lib/utils/eventColors"
import { formatDate } from "$lib/utils/formatters"
import { bindPointerClick } from "$lib/utils/pointerClickOrDrag"
import { getEventCardCornerRadiusStyle } from "$lib/utils/spanBandCorners"

interface Props {
	event: Event
	eventColor: string
	cardX: number
	cardBottom: number
	cardWidth: number
	zIndex: number
	isHovered?: boolean
	onCardClick?: (eventId: number) => void
	onPointerEnter?: () => void
	onPointerLeave?: () => void
}

let {
	event,
	eventColor,
	cardX,
	cardBottom,
	cardWidth,
	zIndex,
	isHovered = false,
	onCardClick,
	onPointerEnter,
	onPointerLeave,
}: Props = $props()

const label = $derived(event.name[$currentLocale])
const description = $derived(event.description[$currentLocale])

const panelBackgroundStyle = $derived(getEventPanelBackgroundStyle(eventColor))
const panelBorderStyle = $derived(
	getEventPanelBorderStyle(eventColor, true, isHovered),
)
const cornerRadiusStyle = getEventCardCornerRadiusStyle()

function handleCardClick(): void {
	onCardClick?.(event.id)
}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
	data-event-card
	class="absolute overflow-hidden text-on-media cursor-pointer outline-none"
	style="left: {cardX}px; bottom: {cardBottom}px; z-index: {zIndex}; width: {cardWidth}px; {cornerRadiusStyle} {panelBorderStyle}"
	use:bindPointerClick={handleCardClick}
	onpointerenter={onPointerEnter}
	onpointerleave={onPointerLeave}
>
	<SpanBand backgroundStyle={panelBackgroundStyle} class="absolute inset-0 pointer-events-none" />
	<div class="relative z-[1] p-4">
		<div class="font-semibold mb-2 text-sm">
			{label}
		</div>
		<div class="text-on-media/80 font-medium mb-2 text-xs">
			{formatDate(event.date, $currentLocale)}
		</div>
		<div class="pointer-events-auto text-on-media/90 leading-relaxed text-xs">
			{description}
		</div>
	</div>
</div>
