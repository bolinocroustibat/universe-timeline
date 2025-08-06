<script lang="ts">
	import { currentLocale, getLocaleFlag, getLocaleName } from '$lib/stores/localeStore'
	import type { SupportedLocales } from '$lib/types'

	let isOpen = $state(false)
	let dropdownRef: HTMLDivElement | undefined

	const locales: SupportedLocales[] = ['en', 'fr']

	function toggleDropdown() {
		isOpen = !isOpen
	}

	function selectLocale(locale: SupportedLocales) {
		$currentLocale = locale
		isOpen = false
	}

	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
			isOpen = false
		}
	}

	// Add event listener when component mounts
	import { onMount } from 'svelte'
	onMount(() => {
		document.addEventListener('click', handleClickOutside)
		return () => {
			document.removeEventListener('click', handleClickOutside)
		}
	})
</script>

<div class="relative" bind:this={dropdownRef}>
	<!-- Locale Button -->
	<button
		onclick={toggleDropdown}
		class="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors duration-200"
		aria-label="Select locale"
	>
		<span class="text-lg">{getLocaleFlag($currentLocale)}</span>
		<svg
			class="w-4 h-4 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	<!-- Dropdown Menu -->
	{#if isOpen}
		<div
			class="absolute right-0 mt-2 w-16 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-50"
		>
			<div class="py-1">
				{#each locales as locale}
					<button
						onclick={() => selectLocale(locale)}
						class="w-full flex items-center justify-center px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-gray-800 transition-colors duration-200 {locale === $currentLocale ? 'bg-gray-800 text-white' : ''}"
						aria-label="Switch to {getLocaleName(locale)}"
					>
						<span class="text-lg">{getLocaleFlag(locale)}</span>
						{#if locale === $currentLocale}
							<svg class="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
								<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
							</svg>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div> 