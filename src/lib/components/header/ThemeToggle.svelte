<script lang="ts">
import { currentLocale } from "$lib/stores/localeStore"
import { colorScheme, toggleColorScheme } from "$lib/stores/themeStore"

const labels = {
	switchToDark: {
		en: "Switch to dark mode",
		fr: "Passer en mode sombre",
	},
	switchToLight: {
		en: "Switch to light mode",
		fr: "Passer en mode clair",
	},
}

const isDark = $derived($colorScheme === "dark")
const ariaLabel = $derived(
	isDark
		? labels.switchToLight[$currentLocale]
		: labels.switchToDark[$currentLocale],
)
</script>

<button
	onclick={toggleColorScheme}
	class="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface-raised text-base leading-none cursor-pointer transition-colors duration-200 hover:bg-border focus:outline-none focus:ring-1 focus:ring-accent focus:ring-offset-1 focus:ring-offset-surface"
	aria-label={ariaLabel}
>
	{isDark ? "🌙" : "☀️"}
</button>
