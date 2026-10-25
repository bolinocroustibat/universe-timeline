<script lang="ts">
import DetailPopover from "#lib/components/main/content/DetailPopover.svelte"
import { currentLocale } from "#lib/stores/localeStore.js"
import {
	getDetailPopoverScrollMaxHeight,
	getDetailPopoverWidth,
} from "#lib/utils/detailPopoverLayout.js"
import {
	type GeologicalPeriodWithLayout,
	getGeologicalPeriodPopoverLayout,
} from "#lib/utils/geologicalPeriodLayout.js"

const Z_INDEX_POPOVER = 1100

interface Props {
	layout: GeologicalPeriodWithLayout
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

const label = $derived(layout.name[$currentLocale])
const description = $derived(layout.description[$currentLocale])

const detailParts = $derived(
	description
		? {
				title: label,
				description,
			}
		: null,
)

const popoverLayout = $derived(
	getGeologicalPeriodPopoverLayout({
		layout,
		zoneHeight,
		leftEdgeYear,
		rightEdgeYear,
		yearsPerPixel,
		viewportWidth,
		contentHeight,
		isSelected: true,
		detailParts,
	}),
)

const descriptionMaxHeight = $derived(
	popoverLayout && detailParts
		? getDetailPopoverScrollMaxHeight(
				detailParts.title,
				undefined,
				detailParts.description,
				getDetailPopoverWidth(viewportWidth),
			)
		: undefined,
)
</script>

{#if popoverLayout && detailParts}
	<DetailPopover
		parts={detailParts}
		layout={popoverLayout}
		zIndex={Z_INDEX_POPOVER}
		ariaLabel={label}
		dataGeologicalPeriodPopover
		{descriptionMaxHeight}
	/>
{/if}
