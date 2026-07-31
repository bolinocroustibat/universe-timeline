import type { Event } from "$lib/types"

export const DEFAULT_EVENT_COLOR = "#3d4558"

export function getEventColor(event: Pick<Event, "color">): string {
	return event.color
}

export function getEventMarkerStyle(
	color: string,
	variant: "background" | "foreground",
): string {
	if (variant === "background") {
		return `background: linear-gradient(to top, color-mix(in srgb, ${color} 60%, transparent), color-mix(in srgb, ${color} 40%, transparent));`
	}

	return `background: linear-gradient(to top, ${color}, color-mix(in srgb, ${color} 65%, black));`
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
