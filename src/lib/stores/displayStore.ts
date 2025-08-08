import { writable } from "svelte/store"

// Get initial display settings from localStorage or default to showing both
const getInitialDisplaySettings = () => {
	if (typeof window !== "undefined") {
		const saved = localStorage.getItem("displaySettings")
		if (saved) {
			try {
				const parsed = JSON.parse(saved)
				return {
					showEvents: parsed.showEvents ?? true,
					showPeriods: parsed.showPeriods ?? true,
				}
			} catch (e) {
				console.warn("Failed to parse display settings from localStorage:", e)
			}
		}
	}
	return {
		showEvents: true,
		showPeriods: true,
	}
}

// Create the display settings store
export const displaySettings = writable(getInitialDisplaySettings())

// Subscribe to changes and save to localStorage
if (typeof window !== "undefined") {
	displaySettings.subscribe((settings) => {
		localStorage.setItem("displaySettings", JSON.stringify(settings))
	})
}
