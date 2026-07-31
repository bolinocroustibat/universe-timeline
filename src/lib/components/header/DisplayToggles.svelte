<script lang="ts">
import ToggleSwitch from "$lib/components/header/ToggleSwitch.svelte"
import { debugEnabled, toggleDebugEnabled } from "$lib/stores/debugStore"
import { displaySettings } from "$lib/stores/displayStore"
import { currentLocale } from "$lib/stores/localeStore"
import { colorScheme, toggleColorScheme } from "$lib/stores/themeStore"

const labels = {
	geologicalPeriods: {
		en: "Geological periods",
		fr: "Périodes géologiques",
	},
	debug: {
		en: "Debug",
		fr: "Debug",
	},
	darkMode: {
		en: "Dark mode",
		fr: "Mode sombre",
	},
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
		label={labels.debug[$currentLocale]}
		checked={$debugEnabled}
		onToggle={toggleDebugEnabled}
		ariaLabel="Toggle debug mode"
	/>
	<ToggleSwitch
		label={labels.darkMode[$currentLocale]}
		checked={$colorScheme === "dark"}
		onToggle={toggleColorScheme}
		ariaLabel={labels.darkMode[$currentLocale]}
	/>
</div>
