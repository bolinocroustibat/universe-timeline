<script lang="ts">
import Zoom from "$lib/components/footer/Zoom.svelte"
</script>

<footer class="h-12 bg-black border-t border-gray-800 flex-shrink-0">
	<div class="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
		<div class="flex items-center space-x-4 text-sm text-gray-600">
			<span>
				By <a href="https://adriencarpentier.com" target="_blank" rel="noopener noreferrer" class="hover:text-gray-400 transition-colors">bolino</a>
			</span>
			<span>•</span>
			<span class="text-gray-500">v{__APP_VERSION__}</span>
			<span>•</span>
			<a href="https://github.com/bolinocroustibat/universe-timeline" target="_blank" rel="noopener noreferrer" class="hover:text-gray-400 transition-colors">
				Source code
			</a>
			<span>•</span>
			<a href="https://github.com/bolinocroustibat/universe-timeline/issues" target="_blank" rel="noopener noreferrer" class="hover:text-gray-400 transition-colors">
				Report an issue
			</a>
		</div>
		<Zoom />
	</div>
</footer>
