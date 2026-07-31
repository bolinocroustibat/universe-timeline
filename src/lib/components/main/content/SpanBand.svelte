<script lang="ts">
import type { Snippet } from "svelte"

/**
 * Shared span fill wrapper (backdrop blur + gradient background + grain overlay).
 *
 * Corner radius belongs on the outer container (see `getSpanBandBorderRadius()` in
 * [`spanBandCorners.ts`]($lib/utils/spanBandCorners.ts)).
 */

interface Props {
	backgroundStyle: string
	class?: string
	children?: Snippet
}

let { backgroundStyle, class: className = "", children }: Props = $props()
</script>

<div
	class="span-band h-full w-full backdrop-blur-sm overflow-hidden {className}"
	style={backgroundStyle}
>
	{#if children}
		{@render children()}
	{/if}
</div>
