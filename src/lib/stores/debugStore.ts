import { writable } from "svelte/store"
import { PUBLIC_DEBUG } from "$app/env/public"

const STORAGE_KEY = "debugEnabled"

const getInitialDebugEnabled = (): boolean => {
	if (typeof window !== "undefined") {
		const saved = localStorage.getItem(STORAGE_KEY)
		if (saved === "true") return true
		if (saved === "false") return false
	}

	return PUBLIC_DEBUG === "true"
}

export const debugEnabled = writable(getInitialDebugEnabled())

export function toggleDebugEnabled() {
	debugEnabled.update((enabled) => !enabled)
}

if (typeof window !== "undefined") {
	debugEnabled.subscribe((enabled) => {
		localStorage.setItem(STORAGE_KEY, String(enabled))
	})
}
