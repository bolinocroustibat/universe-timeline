<script lang="ts">
	import LocaleSwitch from './header/LocaleSwitch.svelte'
	import { currentLocale } from '$lib/stores/localeStore'

	const titles = {
		en: 'The Timeline of the Universe',
		fr: 'La Chronologie de l\'Univers'
	}
</script>

<header class="h-20 bg-gray-950 border-b border-gray-800 flex-shrink-0">
	<nav class="h-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
		<h1 class="text-xl font-bold text-zinc-400">{titles[$currentLocale]}</h1>
		<LocaleSwitch />
	</nav>
</header>
