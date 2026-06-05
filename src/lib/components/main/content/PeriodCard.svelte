<script lang="ts">
import { currentLocale } from "$lib/stores/localeStore"
import type { Period } from "$lib/types"
import { blendColors } from "$lib/utils/colors"

interface Props {
	period: Period
	depth: number
	bandHeight: number
	leftEdgeYear: number
	rightEdgeYear: number
	yearsPerPixel: number
	isTopCard: boolean
	leftPeriod: Period | null
	rightPeriod: Period | null
	onCardClick: (periodId: number) => void
}

let {
	period,
	depth,
	bandHeight,
	leftEdgeYear,
	rightEdgeYear,
	yearsPerPixel,
	isTopCard,
	leftPeriod,
	rightPeriod,
	onCardClick,
}: Props = $props()

const periodPosition = $derived(() => {
	const startX = (period.start - leftEdgeYear) / yearsPerPixel
	const endX = (period.end - leftEdgeYear) / yearsPerPixel
	const rightEdgeX = (rightEdgeYear - leftEdgeYear) / yearsPerPixel

	const clampedStartX = Math.max(0, startX)
	const clampedEndX = Math.min(endX, rightEdgeX)
	const width = clampedEndX - clampedStartX

	return {
		x: clampedStartX,
		width: width,
	}
})

const periodColor = $derived(period.color || "#3d4558")

const gradientBackground = $derived(() => {
	const currentColor = period.color || "#3d4558"
	const leftColor = leftPeriod?.color || currentColor
	const rightColor = rightPeriod?.color || currentColor

	const leftBlend = leftPeriod
		? blendColors(leftColor, currentColor)
		: currentColor
	const rightBlend = rightPeriod
		? blendColors(currentColor, rightColor)
		: currentColor

	if (!leftPeriod && !rightPeriod) {
		return `background-color: ${currentColor};`
	}

	if (leftPeriod && !rightPeriod) {
		return `background: linear-gradient(to right, ${leftBlend} 0%, ${currentColor} 10%, ${currentColor} 100%);`
	}

	if (!leftPeriod && rightPeriod) {
		return `background: linear-gradient(to right, ${currentColor} 0%, ${currentColor} 90%, ${rightBlend} 100%);`
	}

	return `background: linear-gradient(to right, ${leftBlend} 0%, ${currentColor} 10%, ${currentColor} 90%,${rightBlend} 100%);`
})

const isVisible = $derived(
	period.end >= leftEdgeYear && period.start <= rightEdgeYear,
)

const zIndex = $derived(isTopCard ? 1000 : 100 + depth)
const isSelected = $derived(isTopCard)
const bottomOffset = $derived(depth * bandHeight)

function handlePointerDown(e: PointerEvent) {
	e.stopPropagation()
	onCardClick(period.id)
}
</script>

{#if isVisible && bandHeight > 0}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_tabindex, a11y_no_static_element_interactions -->
	<div
		data-period-card
		class="absolute backdrop-blur-sm flex items-center justify-center px-2 text-xs font-medium shadow-sm cursor-pointer overflow-hidden"
		class:shadow-lg={isSelected}
		class:shadow-md={!isSelected}
		class:border-2={isSelected}
		class:border-accent={isSelected}
		style="left: {periodPosition().x}px; width: {periodPosition().width}px; bottom: {bottomOffset}px; height: {bandHeight}px; {gradientBackground()}; color: var(--theme-on-media); z-index: {zIndex};"
		title="{period.name[$currentLocale]}"
		onpointerdown={handlePointerDown}
		tabindex="0"
	>
		<div class="flex flex-col items-center justify-center w-full h-full p-2 min-w-0 min-h-0 overflow-hidden">
			<span class="w-full min-w-0 truncate font-semibold mb-1 shrink-0 text-center">
				{period.name[$currentLocale]}
			</span>
			{#if isSelected && period.description[$currentLocale]}
				<div class="w-full min-w-0 text-xs leading-relaxed text-center opacity-90 overflow-hidden line-clamp-3">
					{period.description[$currentLocale]}
				</div>
			{/if}
		</div>
	</div>
{/if}
