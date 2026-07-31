import { env } from "$env/dynamic/public"
import { writable } from "svelte/store"

const STORAGE_KEY = "debugEnabled"

const getInitialDebugEnabled = (): boolean => {
	if (typeof window !== "undefined") {
		const saved = localStorage.getItem(STORAGE_KEY)
		if (saved === "true") return true
		if (saved === "false") return false
	}
	return env.PUBLIC_DEBUG === "true"
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
