<script lang="ts">
import { MAX_ZOOM_LEVEL, ZOOM_ANCHOR_LEVELS } from "$lib/constants"
import { zoomLevel } from "$lib/stores/zoomStore"

function dispatchZoomRequest(newZoomLevel: number) {
	window.dispatchEvent(
		new CustomEvent("zoom-request", {
			detail: { zoomLevel: newZoomLevel },
		}),
	)
}

function decreaseZoom() {
	const newLevel = Math.max(1, $zoomLevel - 1)
	dispatchZoomRequest(newLevel)
}

function increaseZoom() {
	const newLevel = Math.min(MAX_ZOOM_LEVEL, $zoomLevel + 1)
	dispatchZoomRequest(newLevel)
}

function handleSliderInput(e: Event) {
	const value = Number((e.currentTarget as HTMLInputElement).value)
	dispatchZoomRequest(value)
}

function anchorPosition(level: number): string {
	return `${((level - 1) / (MAX_ZOOM_LEVEL - 1)) * 100}%`
}
</script>

<div class="flex items-center gap-3">
	<button
		onclick={decreaseZoom}
		class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-border text-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
		disabled={$zoomLevel <= 1}
		aria-label="Zoom out"
	>
		<span class="text-xl">-</span>
	</button>

	<div class="relative w-36 sm:w-44 h-5 flex items-center">
		<div class="absolute inset-x-0 h-px bg-border pointer-events-none" aria-hidden="true"></div>
		{#each ZOOM_ANCHOR_LEVELS as anchorLevel}
			<div
				class="absolute w-px h-2 bg-tick pointer-events-none -translate-x-1/2"
				style="left: {anchorPosition(anchorLevel)}"
				aria-hidden="true"
			></div>
		{/each}
		<input
			type="range"
			min={1}
			max={MAX_ZOOM_LEVEL}
			step={1}
			value={$zoomLevel}
			oninput={handleSliderInput}
			aria-label="Zoom level"
			class="zoom-slider relative z-10 w-full appearance-none bg-transparent cursor-pointer"
		/>
	</div>

	<button
		onclick={increaseZoom}
		class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-border text-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
		disabled={$zoomLevel >= MAX_ZOOM_LEVEL}
		aria-label="Zoom in"
	>
		<span class="text-xl">+</span>
	</button>
</div>

<style>
	.zoom-slider::-webkit-slider-runnable-track {
		height: 4px;
		border-radius: 2px;
		background: transparent;
	}

	.zoom-slider::-webkit-slider-thumb {
		appearance: none;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--theme-accent);
		border: 2px solid var(--theme-background);
		margin-top: -5px;
		cursor: pointer;
	}

	.zoom-slider::-moz-range-track {
		height: 4px;
		border-radius: 2px;
		background: transparent;
	}

	.zoom-slider::-moz-range-thumb {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--theme-accent);
		border: 2px solid var(--theme-background);
		cursor: pointer;
	}
</style>
