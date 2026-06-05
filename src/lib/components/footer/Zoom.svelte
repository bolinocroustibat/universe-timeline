<script lang="ts">
import { MAX_ZOOM_LEVEL } from "$lib/constants"
import { zoomLevel } from "$lib/stores/zoomStore"

const SLIDER_TICK_STEP = 2

const sliderTickLevels = Array.from(
	{ length: Math.floor((MAX_ZOOM_LEVEL - 1) / SLIDER_TICK_STEP) + 1 },
	(_, i) => i * SLIDER_TICK_STEP + 1,
)

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

function sliderTickPosition(level: number): string {
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
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
			/>
		</svg>
	</button>

	<div class="relative w-36 sm:w-44 h-5 flex items-center">
		<div class="absolute inset-x-0 h-px bg-border pointer-events-none" aria-hidden="true"></div>
		{#each sliderTickLevels as tickLevel}
			<div
				class="absolute w-px h-2 bg-tick pointer-events-none -translate-x-1/2"
				style="left: {sliderTickPosition(tickLevel)}"
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
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
			/>
		</svg>
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
