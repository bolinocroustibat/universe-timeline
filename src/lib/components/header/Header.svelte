<script lang="ts">
import DisplayToggles from "$lib/components/header/DisplayToggles.svelte"
import LocaleSelector from "$lib/components/header/LocaleSelector.svelte"
import { currentLocale } from "$lib/stores/localeStore"

const titles = {
	en: "The Timeline of the Universe",
	fr: "La Chronologie de l'Univers",
}
</script>

<header class="h-20 bg-gray-950 border-b border-gray-800 flex-shrink-0">
	<nav class="h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
		<h1 class="text-xl font-bold text-zinc-400">{titles[$currentLocale]}</h1>
		<div class="flex items-center space-x-6">
			<DisplayToggles />
			<LocaleSelector />
		</div>
	</nav>
</header>
