<script lang="ts">
import { ZOOM_SCALES } from "$lib/constants"
import { zoomLevel } from "$lib/stores/zoomStore"

const MAX_ZOOM_LEVEL = ZOOM_SCALES.length

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

function setZoomLevel(level: number) {
	const newLevel = level + 1 // level is 0-based index, zoom levels are 1-based
	dispatchZoomRequest(newLevel)
}
</script>

<div class="flex items-center gap-3">
    <button 
        onclick={decreaseZoom}
        class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={$zoomLevel <= 1}
    >
        <span class="text-xl">-</span>
    </button>

    <div class="flex items-center gap-1">
        {#each Array(MAX_ZOOM_LEVEL) as _, i}
            <!-- svelte-ignore a11y_consider_explicit_label -->
            <button 
                onclick={() => setZoomLevel(i)}
                class="w-3 h-3 rounded-full border border-gray-300 transition-colors hover:border-blue-300"
                class:bg-blue-500={i < $zoomLevel}
                class:border-blue-500={i < $zoomLevel}
            ></button>
        {/each}
    </div>

    <button 
        onclick={increaseZoom}
        class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={$zoomLevel >= MAX_ZOOM_LEVEL}
    >
        <span class="text-xl">+</span>
    </button>
</div>
