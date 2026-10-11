<script lang="ts">
import ThemeToggle from "#lib/components/header/ThemeToggle.svelte"
import ToggleSwitch from "#lib/components/header/ToggleSwitch.svelte"
import { debugEnabled, toggleDebugEnabled } from "#lib/stores/debugStore.js"
import { displaySettings } from "#lib/stores/displayStore.js"
import { currentLocale } from "#lib/stores/localeStore.js"

const labels = {
	geologicalPeriods: {
		en: "Geological periods",
		fr: "Périodes géologiques",
	},
	debug: {
		en: "Debug",
		fr: "Debug",
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
	<ThemeToggle />
</div>
