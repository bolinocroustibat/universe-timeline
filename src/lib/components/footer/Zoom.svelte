<script lang="ts">
import { ZOOM_SCALES } from "$lib/constants"
import { zoomLevel } from "$lib/stores/zoomStore"

const MAX_ZOOM_LEVEL = ZOOM_SCALES.length

function decreaseZoom() {
	zoomLevel.update((level) => Math.max(1, level - 1))
}

function increaseZoom() {
	zoomLevel.update((level) => Math.min(MAX_ZOOM_LEVEL, level + 1))
}

function handleWheel(event: WheelEvent) {
    if (event.deltaY < 0) {
        increaseZoom()
    } else {
        decreaseZoom()
    }
}
</script>

<div 
    class="flex items-center gap-3"
    on:wheel|passive={handleWheel}
>
    <button 
        on:click={decreaseZoom}
        class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={$zoomLevel <= 1}
    >
        <span class="text-xl">-</span>
    </button>

    <div class="flex items-center gap-1">
        {#each Array(MAX_ZOOM_LEVEL) as _, i}
            <div 
                class="w-3 h-3 rounded-full border border-gray-300 transition-colors"
                class:bg-blue-500={i < $zoomLevel}
                class:border-blue-500={i < $zoomLevel}
            />
        {/each}
    </div>

    <button 
        on:click={increaseZoom}
        class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={$zoomLevel >= MAX_ZOOM_LEVEL}
    >
        <span class="text-xl">+</span>
    </button>
</div> 