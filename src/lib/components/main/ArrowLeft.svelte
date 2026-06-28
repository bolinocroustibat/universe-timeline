<script lang="ts">
interface Props {
	disabled?: boolean
	onPointerDown: () => void
}

let { disabled = false, onPointerDown }: Props = $props()
</script>

<button
	data-pan-arrow
	{disabled}
	onpointerdown={onPointerDown}
	class="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-surface/90 border border-border rounded-full shadow-lg flex items-center justify-center z-[1001] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100 hover:bg-border hover:shadow-xl hover:scale-110 hover:cursor-pointer"
	aria-label="Pan timeline left"
>
	<svg 
		class="w-6 h-6 text-foreground" 
		fill="none" 
		stroke="currentColor" 
		viewBox="0 0 24 24"
	>
		<path 
			stroke-linecap="round" 
			stroke-linejoin="round" 
			stroke-width="2" 
			d="M15 19l-7-7 7-7"
		/>
	</svg>
</button>
