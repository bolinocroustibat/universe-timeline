<script lang="ts">
import type { TimelineTick } from "$lib/types"
import { formatYear } from "$lib/utils/formatters"

export let visibleMajorTicks: TimelineTick[]
export let visibleMinorTicks: TimelineTick[]
export let majorTickInterval: number
</script>

<div class="w-full flex-[1] bg-white border-t border-slate-200 overflow-hidden relative">
	<!-- Minor ticks (rendered first, behind major ticks) -->
	{#each visibleMinorTicks as tick}
		<div 
			class="absolute top-0 h-full flex flex-col justify-start"
			style="transform: translateX({tick.position}px)"
		>
			<div class="h-1/2 w-0.5 bg-gray-300"></div>
		</div>
	{/each}
	<!-- Major ticks (rendered second, on top) -->
	{#each visibleMajorTicks as tick}
		<div 
			class="absolute top-0 h-full flex flex-col justify-start"
			style="transform: translateX({tick.position}px)"
		>
			<div class="h-2/3 w-0.5 bg-gray-400"></div>
			<span class="text-xs text-gray-600 mt-1 text-center whitespace-nowrap -ml-1/2">
				{formatYear(tick.year, "fr", majorTickInterval)}
			</span>
		</div>
	{/each}
</div>
