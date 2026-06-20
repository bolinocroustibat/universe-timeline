import type { LocalizedText } from "$lib/types"
import { TIME_CONSTANTS } from "./timeline"

export interface NavigatorMilestone {
	id: string
	year: number
	icon: string
	label: LocalizedText
}

/** Fixed visual anchors on the navigator track (years match key events in events.jsonc). */
export const NAVIGATOR_MILESTONES: readonly NavigatorMilestone[] = [
	{
		id: "big-bang",
		year: TIME_CONSTANTS.START_YEAR,
		icon: "/icons/navigator/bigbang.png",
		label: { en: "Big Bang", fr: "Big-bang" },
	},
	{
		id: "galaxy",
		year: -12_000_000_000,
		icon: "/icons/navigator/galaxy.png",
		label: { en: "First galaxies", fr: "Premières galaxies" },
	},
	{
		id: "sun",
		year: -4_567_000_000,
		icon: "/icons/navigator/sun.png",
		label: { en: "Solar system", fr: "Système solaire" },
	},
	{
		id: "dna",
		year: -3_800_000_000,
		icon: "/icons/navigator/dna.png",
		label: { en: "Origin of life", fr: "Apparition de la vie" },
	},
] as const
