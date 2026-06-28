<script lang="ts">
import type { Snippet } from "svelte"

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
