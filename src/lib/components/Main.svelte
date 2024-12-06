<script lang="ts">
import Ruler from "./main/Ruler.svelte"
interface Props {
	children?: import("svelte").Snippet
}

let { children }: Props = $props()
</script>

<main class="min-h-screen pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
  {@render children?.()}
  <Ruler />
</main> 