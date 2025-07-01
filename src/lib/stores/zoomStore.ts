import { writable } from "svelte/store"
import { DEFAULT_ZOOM_LEVEL } from "$lib/constants"

export const zoomLevel = writable(DEFAULT_ZOOM_LEVEL)
