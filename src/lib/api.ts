import type { Event, Period } from './types'

export async function fetchPeriods(): Promise<Period[]> {
	try {
		const response = await fetch('/src/data/periods.json')
		if (!response.ok) {
			throw new Error('Failed to fetch periods')
		}
		return response.json()
	} catch (error) {
		console.error('Error loading periods:', error)
		return []
	}
}

export async function fetchEvents(): Promise<Event[]> {
	try {
		const response = await fetch('/src/data/events.json')
		if (!response.ok) {
			throw new Error('Failed to fetch events')
		}
		return response.json()
	} catch (error) {
		console.error('Error loading events:', error)
		return []
	}
} 