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

/** Vertical panel gradient aligned with connector card foreground fills. */
export function getEventPanelBackgroundStyle(color: string): string {
	return `background: linear-gradient(to top, ${color}, color-mix(in srgb, ${color} 65%, black));`
}

export function getEventConnectorStroke(
	color: string,
	selected: boolean,
	hovered: boolean,
): { stroke: string; strokeWidth: number } {
	if (selected) {
		return {
			stroke: color,
			strokeWidth: 2,
		}
	}

	if (hovered) {
		return {
			stroke: `color-mix(in srgb, ${color} 55%, transparent)`,
			strokeWidth: 1.5,
		}
	}

	return {
		stroke: "transparent",
		strokeWidth: 0,
	}
}

export function getEventPanelBorderStyle(
	color: string,
	selected: boolean,
	hovered: boolean,
): string {
	const { stroke, strokeWidth } = getEventConnectorStroke(
		color,
		selected,
		hovered,
	)

	if (strokeWidth === 0) {
		return "border: 2px solid transparent"
	}

	return `border: ${strokeWidth}px solid ${stroke}`
}
