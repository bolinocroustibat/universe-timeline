<script lang="ts">
import { formatYear } from "$lib/utils/formatters"

export let viewportYearSpan: number
export let zoomLevel: number
</script>

<div class="w-full flex-[4] bg-slate-300 border-b border-slate-200 overflow-hidden">
	<div class="h-full relative overflow-hidden">
		<!-- Events and periods will be rendered here -->
		<!-- This zone will respond to zoom/pan changes through the shared state -->
		<div class="p-4 text-gray-500 text-center">
			Events and periods display zone
			<br>
			<small>Zoom level: {zoomLevel} | Viewport: {formatYear(viewportYearSpan)} years</small>
		</div>
	</div>
</div>
