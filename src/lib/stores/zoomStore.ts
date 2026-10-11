import { writable } from "svelte/store"
import { DEFAULT_ZOOM_LEVEL } from "#lib/constants/index.js"

export const zoomLevel = writable(DEFAULT_ZOOM_LEVEL)
