<script lang="ts">
import { zoomLevel } from "$lib/stores/zoomStore"
import { get } from "svelte/store"

function decreaseZoom() {
	zoomLevel.update((level) => Math.max(1, level - 1))
}

function increaseZoom() {
	zoomLevel.update((level) => Math.min(10, level + 1))
}
</script>

<footer class="fixed bottom-0 left-0 right-0 h-12 bg-white shadow-[0_-2px_4px_rgba(0,0,0,0.1)]">
  <div class="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
    <p class="text-sm text-gray-600">© 2024 Your Site Name. All rights reserved.</p>
    
    <div class="flex items-center gap-3">
      <button 
        on:click={decreaseZoom}
        class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={$zoomLevel <= 1}
      >
        <span class="text-xl">-</span>
      </button>

      <div class="flex items-center gap-1">
        {#each Array(10) as _, i}
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
        disabled={$zoomLevel >= 10}
      >
        <span class="text-xl">+</span>
      </button>
    </div>
  </div>
</footer> 