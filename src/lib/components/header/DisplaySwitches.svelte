<script lang="ts">
	import { currentLocale } from '$lib/stores/localeStore'

	let showEvents = $state(true)
	let showPeriods = $state(true)

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
		showEvents = !showEvents
		// TODO: Emit event to parent component
	}

	function togglePeriods() {
		showPeriods = !showPeriods
		// TODO: Emit event to parent component
	}
</script>

<div class="flex flex-col space-y-2">
	<!-- Events Switch -->
	<div class="flex items-center space-x-3">
		<label class="text-sm text-zinc-400 whitespace-nowrap">
			{labels.events[$currentLocale]}
		</label>
		<button
			onclick={toggleEvents}
			class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 {showEvents ? 'bg-blue-600' : 'bg-gray-600'}"
			role="switch"
			aria-checked={showEvents}
			aria-label="Toggle events display"
		>
			<span
				class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 {showEvents ? 'translate-x-6' : 'translate-x-1'}"
			/>
		</button>
	</div>

	<!-- Periods Switch -->
	<div class="flex items-center space-x-3">
		<label class="text-sm text-zinc-400 whitespace-nowrap">
			{labels.periods[$currentLocale]}
		</label>
		<button
			onclick={togglePeriods}
			class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 {showPeriods ? 'bg-blue-600' : 'bg-gray-600'}"
			role="switch"
			aria-checked={showPeriods}
			aria-label="Toggle periods display"
		>
			<span
				class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 {showPeriods ? 'translate-x-6' : 'translate-x-1'}"
			/>
		</button>
	</div>
</div> 