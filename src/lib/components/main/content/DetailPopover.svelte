<script lang="ts">
import DetailPanel from "#lib/components/main/content/DetailPanel.svelte"
import type { DetailContentParts } from "#lib/utils/detailContentFit.js"
import type { DetailPopoverLayout } from "#lib/utils/detailPopoverLayout.js"
import { bindPointerClick } from "#lib/utils/pointerClickOrDrag.js"

interface Props {
	parts: DetailContentParts
	layout: DetailPopoverLayout
	zIndex: number
	ariaLabel: string
	dataEventCard?: boolean
	dataGeologicalPeriodPopover?: boolean
	descriptionMaxHeight?: number
	onCardClick?: () => void
	onPointerEnter?: () => void
	onPointerLeave?: () => void
}

let {
	parts,
	layout,
	zIndex,
	ariaLabel,
	dataEventCard = false,
	dataGeologicalPeriodPopover = false,
	descriptionMaxHeight,
	onCardClick,
	onPointerEnter,
	onPointerLeave,
}: Props = $props()
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
	data-event-card={dataEventCard || undefined}
	data-geological-period-popover={dataGeologicalPeriodPopover || undefined}
	role="dialog"
	aria-label={ariaLabel}
	class="popover-surface absolute pointer-events-auto outline-none"
	class:popover-above={layout.placement === "above"}
	class:popover-below={layout.placement === "below"}
	style="left: {layout.popoverLeft}px; top: {layout.popoverTop}px; width: {layout.popoverWidth}px; z-index: {zIndex}; --arrow-offset: {layout.arrowOffsetX}px;"
	use:bindPointerClick={() => onCardClick?.()}
	onpointerenter={onPointerEnter}
	onpointerleave={onPointerLeave}
>
	<div
		class="detail-popover-panel overflow-hidden rounded-xl border-2 border-accent/35 bg-surface-raised shadow-lg ring-1 ring-accent/30"
	>
		<DetailPanel
			{parts}
			variant="surface"
			{descriptionMaxHeight}
		/>
	</div>
</div>

<style>
	.popover-above {
		transform: translate(-50%, -100%);
	}

	.popover-below {
		transform: translateX(-50%);
	}

	.popover-surface.popover-above > .detail-popover-panel,
	.popover-surface.popover-below > .detail-popover-panel {
		position: relative;
	}

	.popover-surface.popover-above > .detail-popover-panel::after,
	.popover-surface.popover-below > .detail-popover-panel::after {
		content: "";
		position: absolute;
		left: calc(50% + var(--arrow-offset));
		transform: translateX(-50%);
		border: 8px solid transparent;
	}

	.popover-surface.popover-above > .detail-popover-panel::after {
		top: 100%;
		border-top-color: var(--theme-surface-raised);
		filter: drop-shadow(
			0 1px 0 color-mix(in srgb, var(--theme-accent) 35%, transparent)
		);
	}

	.popover-surface.popover-below > .detail-popover-panel::after {
		bottom: 100%;
		border-bottom-color: var(--theme-surface-raised);
		filter: drop-shadow(
			0 -1px 0 color-mix(in srgb, var(--theme-accent) 35%, transparent)
		);
	}
</style>
