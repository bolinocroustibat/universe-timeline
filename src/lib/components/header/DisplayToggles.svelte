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
	geologicalPeriods: {
		en: "Geological periods",
		fr: "Périodes géologiques",
	},
	darkMode: {
		en: "Dark mode",
		fr: "Mode sombre",
	},
}

function toggleEvents() {
	$displaySettings.showEvents = !$displaySettings.showEvents
}

function toggleGeologicalPeriods() {
	$displaySettings.showGeologicalPeriods =
		!$displaySettings.showGeologicalPeriods
}
</script>

<div class="flex items-end gap-3 sm:gap-4">
	<ToggleSwitch
		label={labels.geologicalPeriods[$currentLocale]}
		checked={$displaySettings.showGeologicalPeriods}
		onToggle={toggleGeologicalPeriods}
		ariaLabel="Toggle geological periods display"
	/>
	<ToggleSwitch
		label={labels.events[$currentLocale]}
		checked={$displaySettings.showEvents}
		onToggle={toggleEvents}
		ariaLabel="Toggle events display"
	/>
	<ToggleSwitch
		label={labels.darkMode[$currentLocale]}
		checked={$colorScheme === "dark"}
		onToggle={toggleColorScheme}
		ariaLabel={labels.darkMode[$currentLocale]}
	/>
</div>
