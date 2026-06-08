import type { Event, GeologicalPeriod } from "$lib/types"

export async function fetchGeologicalPeriods(): Promise<GeologicalPeriod[]> {
	try {
		const response = await fetch("/src/data/periods.json")
		if (!response.ok) {
			throw new Error("Failed to fetch geological periods")
		}
		return response.json()
	} catch (error) {
		console.error("Error loading geological periods:", error)
		return []
	}
}

export async function fetchEvents(): Promise<Event[]> {
	try {
		const response = await fetch("/src/data/events.json")
		if (!response.ok) {
			throw new Error("Failed to fetch events")
		}
		return response.json()
	} catch (error) {
		console.error("Error loading events:", error)
		return []
	}
}
