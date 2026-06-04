import { writable } from "svelte/store"

export type ColorScheme = "dark" | "light"

const STORAGE_KEY = "colorScheme"

function applyColorScheme(scheme: ColorScheme) {
	if (typeof document === "undefined") return
	document.documentElement.setAttribute("data-theme", scheme)
}

const getInitialColorScheme = (): ColorScheme => {
	if (typeof window !== "undefined") {
		const saved = localStorage.getItem(STORAGE_KEY)
		if (saved === "light" || saved === "dark") {
			return saved
		}
	}
	return "dark"
}

export const colorScheme = writable<ColorScheme>(getInitialColorScheme())

export function toggleColorScheme() {
	colorScheme.update((scheme) => (scheme === "dark" ? "light" : "dark"))
}

if (typeof window !== "undefined") {
	applyColorScheme(getInitialColorScheme())

	colorScheme.subscribe((scheme) => {
		localStorage.setItem(STORAGE_KEY, scheme)
		applyColorScheme(scheme)
	})
}
