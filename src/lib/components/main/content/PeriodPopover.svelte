<script lang="ts">
import { currentLocale } from "$lib/stores/localeStore"
import {
	getPeriodPopoverLayout,
	type PeriodWithLayout,
} from "$lib/utils/periodLayout"

const Z_INDEX_POPOVER = 1100

interface Props {
	layout: PeriodWithLayout
	zoneHeight: number
	contentHeight: number
	leftEdgeYear: number
	rightEdgeYear: number
	yearsPerPixel: number
	viewportWidth: number
}

let {
	layout,
	zoneHeight,
	contentHeight,
	leftEdgeYear,
	rightEdgeYear,
	yearsPerPixel,
	viewportWidth,
}: Props = $props()

const popoverLayout = $derived(
	getPeriodPopoverLayout({
		layout,
		zoneHeight,
		leftEdgeYear,
		rightEdgeYear,
		yearsPerPixel,
		viewportWidth,
		contentHeight,
		isSelected: true,
	}),
)

const label = $derived(layout.name[$currentLocale])
const description = $derived(layout.description[$currentLocale])
</script>

{#if popoverLayout && description}
	<div
		data-period-popover
		role="dialog"
		aria-label={label}
		class="absolute pointer-events-auto"
		class:popover-above={popoverLayout.placement === "above"}
		class:popover-below={popoverLayout.placement === "below"}
		style="left: {popoverLayout.popoverLeft}px; top: {popoverLayout.popoverTop}px; width: {popoverLayout.popoverWidth}px; z-index: {Z_INDEX_POPOVER}; --arrow-offset: {popoverLayout.arrowOffsetX}px;"
	>
		<div
			class="rounded-xl border-2 border-accent/35 bg-surface-raised p-4 shadow-lg ring-1 ring-accent/30"
		>
			<div class="font-semibold text-foreground mb-2 text-sm">
				{label}
			</div>
			<div class="text-foreground/90 leading-relaxed text-xs max-h-48 overflow-y-auto">
				{description}
			</div>
		</div>
	</div>
{/if}

<style>
	.popover-above {
		transform: translate(-50%, -100%);
	}

	.popover-below {
		transform: translateX(-50%);
	}

	.popover-above > div::after,
	.popover-below > div::after {
		content: "";
		position: absolute;
		left: calc(50% + var(--arrow-offset));
		transform: translateX(-50%);
		border: 8px solid transparent;
	}

	.popover-above > div {
		position: relative;
	}

	.popover-above > div::after {
		top: 100%;
		border-top-color: var(--theme-surface-raised);
		filter: drop-shadow(0 1px 0 color-mix(in srgb, var(--theme-accent) 35%, transparent));
	}

	.popover-below > div {
		position: relative;
	}

	.popover-below > div::after {
		bottom: 100%;
		border-bottom-color: var(--theme-surface-raised);
		filter: drop-shadow(0 -1px 0 color-mix(in srgb, var(--theme-accent) 35%, transparent));
	}
</style>
