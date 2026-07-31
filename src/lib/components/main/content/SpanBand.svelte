<script lang="ts">
import type { Snippet } from "svelte"

/**
 * Shared span fill wrapper (backdrop blur + gradient background).
 *
 * Corner radius belongs on the outer container (see `getSpanBandBorderRadius()` in
 * [`spanBandCorners.ts`]($lib/utils/spanBandCorners.ts)).
 *
 * Follow-up — geological periods: migrate [`GeologicalPeriodCard.svelte`](./GeologicalPeriodCard.svelte)
 * to use this component instead of inlining the same markup, then apply neighbor-aware
 * border radius via `getSpanBandBorderRadius()`.
 */

interface Props {
	backgroundStyle: string
	class?: string
	children?: Snippet
}

let { backgroundStyle, class: className = "", children }: Props = $props()
</script>

<div
	class="h-full w-full backdrop-blur-sm overflow-hidden {className}"
	style={backgroundStyle}
>
	{#if children}
		{@render children()}
	{/if}
</div>
