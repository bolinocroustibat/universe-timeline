<script lang="ts">
import { displaySettings } from "$lib/stores/displayStore"
import { currentLocale } from "$lib/stores/localeStore"
import { colorScheme, toggleColorScheme } from "$lib/stores/themeStore"

const labels = {
	events: {
		en: "Events",
		fr: "Événements",
	},
	periods: {
		en: "Periods",
		fr: "Périodes",
	},
	darkMode: {
		en: "Dark mode",
		fr: "Mode sombre",
	},
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
		<label class="text-xs text-muted whitespace-nowrap">
			{labels.events[$currentLocale]}
		</label>
		<button
			onclick={toggleEvents}
			class="relative inline-flex h-3 w-6 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-accent focus:ring-offset-1 focus:ring-offset-surface {$displaySettings.showEvents ? 'bg-accent' : 'bg-border'}"
			role="switch"
			aria-checked={$displaySettings.showEvents}
			aria-label="Toggle events display"
		>
      <span
        class="inline-block h-2 w-2 transform rounded-full bg-foreground transition-transform duration-200 {$displaySettings.showEvents ? 'translate-x-3' : 'translate-x-0.5'}"
      ></span>
		</button>
	</div>

	<!-- Periods Toggle -->
	<div class="flex items-center justify-between space-x-2">
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="text-xs text-muted whitespace-nowrap">
			{labels.periods[$currentLocale]}
		</label>
		<button
			onclick={togglePeriods}
			class="relative inline-flex h-3 w-6 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-accent focus:ring-offset-1 focus:ring-offset-surface {$displaySettings.showPeriods ? 'bg-accent' : 'bg-border'}"
			role="switch"
			aria-checked={$displaySettings.showPeriods}
			aria-label="Toggle periods display"
		>
      <span
        class="inline-block h-2 w-2 transform rounded-full bg-foreground transition-transform duration-200 {$displaySettings.showPeriods ? 'translate-x-3' : 'translate-x-0.5'}"
      ></span>
		</button>
	</div>

	<!-- Color scheme toggle -->
	<div class="flex items-center justify-between space-x-2">
		<!-- svelte-ignore a11y_label_has_associated_control -->
		<label class="text-xs text-muted whitespace-nowrap">
			{labels.darkMode[$currentLocale]}
		</label>
		<button
			onclick={toggleColorScheme}
			class="relative inline-flex h-3 w-6 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-accent focus:ring-offset-1 focus:ring-offset-surface {$colorScheme === 'dark' ? 'bg-accent' : 'bg-border'}"
			role="switch"
			aria-checked={$colorScheme === "dark"}
			aria-label={labels.darkMode[$currentLocale]}
		>
			<span
				class="inline-block h-2 w-2 transform rounded-full bg-foreground transition-transform duration-200 {$colorScheme === 'dark' ? 'translate-x-3' : 'translate-x-0.5'}"
			></span>
		</button>
	</div>
</div>
