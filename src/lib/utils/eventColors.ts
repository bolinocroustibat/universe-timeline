import type { Event } from "$lib/types"

export const DEFAULT_EVENT_COLOR = "#3d4558"

export function getEventColor(event: Pick<Event, "color">): string {
	return event.color
}

export type EventMarkerGradientStop = {
	offset: string
	color: string
}

export function getEventMarkerGradientStops(
	color: string,
	variant: "background" | "foreground",
): EventMarkerGradientStop[] {
	if (variant === "background") {
		return [
			{
				offset: "0%",
				color: `color-mix(in srgb, ${color} 40%, transparent)`,
			},
			{
				offset: "100%",
				color: `color-mix(in srgb, ${color} 60%, transparent)`,
			},
		]
	}

	return [
		{
			offset: "0%",
			color: `color-mix(in srgb, ${color} 65%, black)`,
		},
		{
			offset: "100%",
			color: color,
		},
	]
}

export function getEventCardBorderStyle(
	color: string,
	selected: boolean,
	hovered = false,
): string {
	if (selected) {
		return `border-color: ${color}; box-shadow: 0 0 0 1px color-mix(in srgb, ${color} 30%, transparent);`
	}

	const mix = hovered ? 55 : 35
	return `border-color: color-mix(in srgb, ${color} ${mix}%, transparent);`
}

export function getEventDetailCardStyle(color: string): string {
	return `border-color: ${color}; box-shadow: 0 0 0 1px color-mix(in srgb, ${color} 30%, transparent);`
}
