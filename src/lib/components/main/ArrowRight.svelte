<script lang="ts">
	interface Props {
		onMouseDown: () => void
		onMouseUp: () => void
		onMouseLeave: () => void
	}

	let { onMouseDown, onMouseUp, onMouseLeave }: Props = $props()
</script>

<button
	onmousedown={onMouseDown}
	onmouseup={onMouseUp}
	onmouseleave={onMouseLeave}
	class="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 hover:cursor-pointer flex items-center justify-center z-[1001]"
	aria-label="Pan timeline right"
>
	<svg 
		class="w-6 h-6 text-gray-700" 
		fill="none" 
		stroke="currentColor" 
		viewBox="0 0 24 24"
	>
		<path 
			stroke-linecap="round" 
			stroke-linejoin="round" 
			stroke-width="2" 
			d="M9 5l7 7-7 7"
		/>
	</svg>
</button>
