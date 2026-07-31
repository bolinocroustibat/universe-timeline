<script lang="ts">
import { currentLocale } from "$lib/stores/localeStore"
import type { Event } from "$lib/types"
import { formatDate } from "$lib/utils/formatters"
import { bindPointerClick } from "$lib/utils/pointerClickOrDrag"

interface Props {
	event: Event
	variant: "period" | "interactive"
	layer: "background" | "foreground"
	isSelected: boolean
	cardX: number
	cardBottom: number
	cardWidth: number
	zIndex: number
	cardStyle: string
	onCardClick?: (eventId: number) => void
	onPointerEnter?: () => void
	onPointerLeave?: () => void
}

let {
	event,
	variant,
	layer,
	isSelected,
	cardX,
	cardBottom,
	cardWidth,
	zIndex,
	cardStyle,
	onCardClick,
	onPointerEnter,
	onPointerLeave,
}: Props = $props()

const label = $derived(event.name[$currentLocale])
const description = $derived(event.description[$currentLocale])
</script>

{#if variant === "period"}
	<div
		data-event-card
		data-event-layer={layer}
		data-selected={isSelected || undefined}
		class="absolute rounded-xl p-4 border-2 bg-surface-raised overflow-hidden"
		style="left: {cardX}px; bottom: {cardBottom}px; z-index: {zIndex}; width: {cardWidth}px; {cardStyle}"
	>
		<div class="font-semibold text-foreground mb-2 text-sm">
			{label}
		</div>
		<div class="text-muted font-medium mb-2 text-xs">
			{formatDate(event.date, $currentLocale)}
		</div>
		<div class="text-foreground/90 leading-relaxed text-xs">
			{description}
		</div>
	</div>
{:else}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_tabindex, a11y_no_static_element_interactions -->
	<div
		data-event-card
		data-event-layer={layer}
		data-selected={isSelected || undefined}
		class="absolute rounded-xl p-4 border-2 cursor-pointer transition-colors duration-300 transition-shadow duration-300 overflow-hidden bg-surface-raised"
		style="left: {cardX}px; bottom: {cardBottom}px; z-index: {zIndex}; width: {cardWidth}px; {cardStyle}"
		use:bindPointerClick={() => onCardClick?.(event.id)}
		onpointerenter={onPointerEnter}
		onpointerleave={onPointerLeave}
		tabindex="0"
	>
		<div class="font-semibold text-foreground mb-2 transition-all duration-200 text-sm line-clamp-2">
			{label}
		</div>
		<div class="text-muted font-medium mb-2 transition-all duration-200 text-xs">
			{formatDate(event.date, $currentLocale)}
		</div>
		{#if isSelected && description}
			<div class="text-foreground/90 leading-relaxed transition-all duration-200 text-xs">
				{description}
			</div>
		{/if}
	</div>
{/if}
