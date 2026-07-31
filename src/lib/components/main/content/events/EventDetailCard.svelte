<script lang="ts">
import { currentLocale } from "$lib/stores/localeStore"
import type { Event } from "$lib/types"
import {
	getEventPanelBackgroundStyle,
	getEventPanelBorderStyle,
} from "$lib/utils/eventColors"
import { formatDate } from "$lib/utils/formatters"
import { getEventCardCornerRadiusStyle } from "$lib/utils/spanBandCorners"

interface Props {
	event: Event
	eventColor: string
	cardX: number
	cardBottom: number
	cardWidth: number
	zIndex: number
}

let {
	event,
	eventColor,
	cardX,
	cardBottom,
	cardWidth,
	zIndex,
}: Props = $props()

const label = $derived(event.name[$currentLocale])
const description = $derived(event.description[$currentLocale])

const panelBackgroundStyle = $derived(getEventPanelBackgroundStyle(eventColor))
const panelBorderStyle = $derived(
	getEventPanelBorderStyle(eventColor, true, false),
)
const cornerRadiusStyle = getEventCardCornerRadiusStyle()
</script>

<div
	data-event-card
	class="absolute p-4 overflow-hidden text-on-media"
	style="left: {cardX}px; bottom: {cardBottom}px; z-index: {zIndex}; width: {cardWidth}px; {cornerRadiusStyle} {panelBackgroundStyle} {panelBorderStyle}"
>
	<div class="font-semibold mb-2 text-sm">
		{label}
	</div>
	<div class="text-on-media/80 font-medium mb-2 text-xs">
		{formatDate(event.date, $currentLocale)}
	</div>
	<div class="text-on-media/90 leading-relaxed text-xs">
		{description}
	</div>
</div>
