import { DEFAULT_ZOOM_LEVEL } from "$lib/constants"
import { writable } from "svelte/store"

export const zoomLevel = writable(DEFAULT_ZOOM_LEVEL)
