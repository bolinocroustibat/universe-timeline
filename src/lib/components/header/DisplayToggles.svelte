<script lang="ts">
	import { currentLocale } from '$lib/stores/localeStore'
	import { displaySettings } from '$lib/stores/displayStore'

	const labels = {
		events: {
			en: 'Events',
			fr: 'Événements'
		},
		periods: {
			en: 'Periods',
			fr: 'Périodes'
		}
	}

	function toggleEvents() {
		$displaySettings.showEvents = !$displaySettings.showEvents
	}

	function togglePeriods() {
		$displaySettings.showPeriods = !$displaySettings.showPeriods
	}
</script>

<div class="flex flex-col space-y-1">
	<!-- Events Toggle -->
	<div class="flex items-center justify-between space-x-2">
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="text-xs text-zinc-400 whitespace-nowrap">
			{labels.events[$currentLocale]}
		</label>
		<button
			onclick={toggleEvents}
			class="relative inline-flex h-3 w-6 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-gray-950 {$displaySettings.showEvents ? 'bg-blue-600' : 'bg-gray-600'}"
			role="switch"
			aria-checked={$displaySettings.showEvents}
			aria-label="Toggle events display"
		>
			<span
				class="inline-block h-2 w-2 transform rounded-full bg-white transition-transform duration-200 {$displaySettings.showEvents ? 'translate-x-3' : 'translate-x-0.5'}"
			/>
		</button>
	</div>

	<!-- Periods Toggle -->
	<div class="flex items-center justify-between space-x-2">
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="text-xs text-zinc-400 whitespace-nowrap">
			{labels.periods[$currentLocale]}
		</label>
		<button
			onclick={togglePeriods}
			class="relative inline-flex h-3 w-6 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-gray-950 {$displaySettings.showPeriods ? 'bg-blue-600' : 'bg-gray-600'}"
			role="switch"
			aria-checked={$displaySettings.showPeriods}
			aria-label="Toggle periods display"
		>
			<span
				class="inline-block h-2 w-2 transform rounded-full bg-white transition-transform duration-200 {$displaySettings.showPeriods ? 'translate-x-3' : 'translate-x-0.5'}"
			/>
		</button>
	</div>
</div>
