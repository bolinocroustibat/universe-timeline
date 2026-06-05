<script lang="ts">
import ToggleSwitch from "$lib/components/header/ToggleSwitch.svelte"
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

<div class="flex items-end gap-3 sm:gap-4">
	<ToggleSwitch
		label={labels.events[$currentLocale]}
		checked={$displaySettings.showEvents}
		onToggle={toggleEvents}
		ariaLabel="Toggle events display"
	/>
	<ToggleSwitch
		label={labels.periods[$currentLocale]}
		checked={$displaySettings.showPeriods}
		onToggle={togglePeriods}
		ariaLabel="Toggle periods display"
	/>
	<ToggleSwitch
		label={labels.darkMode[$currentLocale]}
		checked={$colorScheme === "dark"}
		onToggle={toggleColorScheme}
		ariaLabel={labels.darkMode[$currentLocale]}
	/>
</div>
