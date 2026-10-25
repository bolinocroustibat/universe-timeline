<script lang="ts">
import type { DetailContentParts } from "#lib/utils/detailContentFit.js"

export type DetailPanelVariant = "on-media" | "surface"

interface Props {
	parts: DetailContentParts
	variant?: DetailPanelVariant
	/** When false, only title (and optional subtitle) render — description omitted. */
	showDescription?: boolean
	descriptionMaxHeight?: number
	class?: string
}

let {
	parts,
	variant = "on-media",
	showDescription = true,
	descriptionMaxHeight,
	class: className = "p-4",
}: Props = $props()

const isOnMedia = $derived(variant === "on-media")
</script>

<div class="box-border {className}">
	<div
		class="font-semibold mb-2 text-sm line-clamp-2 {isOnMedia
			? 'text-on-media'
			: 'text-foreground'}"
	>
		{parts.title}
	</div>
	{#if parts.subtitle}
		<div
			class="font-medium mb-2 text-xs {isOnMedia
				? 'text-on-media/80'
				: 'text-foreground/70'}"
		>
			{parts.subtitle}
		</div>
	{/if}
	{#if showDescription && parts.description}
		<div
			class="leading-relaxed text-xs overflow-y-auto {isOnMedia
				? 'text-on-media/90'
				: 'text-foreground/90'}"
			style={descriptionMaxHeight
				? `max-height: ${descriptionMaxHeight}px`
				: undefined}
		>
			{parts.description}
		</div>
	{/if}
</div>
