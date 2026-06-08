import { writable } from "svelte/store"
import type { SupportedLocales } from "$lib/types"

// Get initial locale from localStorage or default to English
const getInitialLocale = (): SupportedLocales => {
	if (typeof window !== "undefined") {
		const savedLocale = localStorage.getItem("locale")
		if (savedLocale === "fr" || savedLocale === "en") {
			return savedLocale
		}
	}
	return "en"
}

// Create the locale store
export const currentLocale = writable<SupportedLocales>(getInitialLocale())

// Subscribe to changes and save to localStorage
if (typeof window !== "undefined") {
	currentLocale.subscribe((selectedLocale) => {
		localStorage.setItem("locale", selectedLocale)
	})
}

// Helper function to get locale name
export function getLocaleName(locale: SupportedLocales): string {
	switch (locale) {
		case "en":
			return "English"
		case "fr":
			return "Français"
		default:
			return "English"
	}
}
