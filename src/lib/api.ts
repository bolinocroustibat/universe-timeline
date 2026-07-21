import type { Event, GeologicalPeriod } from "$lib/types"
import {
	type GeologicalPeriodSource,
	resolveGeologicalPeriodColors,
} from "$lib/utils/geologicalPeriodColors"

export async function fetchGeologicalPeriods(): Promise<GeologicalPeriod[]> {
	try {
		const response = await fetch("/geologicalPeriods.jsonc")
		if (!response.ok) {
			throw new Error("Failed to fetch geological periods")
		}
		const raw = (await response.json()) as GeologicalPeriodSource[]
		return resolveGeologicalPeriodColors(raw)
	} catch (error) {
		console.error("Error loading geological periods:", error)
		return []
	}
}

export async function fetchEvents(): Promise<Event[]> {
	try {
		const response = await fetch("/events.jsonc")
		if (!response.ok) {
			throw new Error("Failed to fetch events")
		}
		return response.json()
	} catch (error) {
		console.error("Error loading events:", error)
		return []
	}
}
