<script lang="ts">
import DisplayToggles from "$lib/components/header/DisplayToggles.svelte"
import LocaleSelector from "$lib/components/header/LocaleSelector.svelte"
import { SITE_TITLE } from "$lib/constants/site"
import { currentLocale } from "$lib/stores/localeStore"
</script>

<header class="h-14 bg-surface border-b border-border flex-shrink-0">
	<nav class="h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
		<h1 class="text-xl font-bold text-foreground">{SITE_TITLE[$currentLocale]}</h1>
		<div class="flex items-center space-x-6">
			<DisplayToggles />
			<LocaleSelector />
		</div>
	</nav>
</header>
