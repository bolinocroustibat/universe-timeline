import type { Event } from "$lib/types"
import { pigmentMix } from "$lib/utils/spanBandPigment"

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
				offset: "45%",
				color: `color-mix(in srgb, ${color} 52%, transparent)`,
			},
			{
				offset: "100%",
				color: `color-mix(in srgb, ${color} 62%, transparent)`,
			},
		]
	}

	return [
		{
			offset: "0%",
			color: pigmentMix(color, 52, "black"),
		},
		{
			offset: "38%",
			color: pigmentMix(color, 68, "black"),
		},
		{
			offset: "72%",
			color: color,
		},
		{
			offset: "100%",
			color: pigmentMix(color, 90, "white"),
		},
	]
}

/** Vertical panel gradient with uneven pigment pooling toward the base. */
export function getEventPanelBackgroundStyle(color: string): string {
	return `background-color: ${color}; background-image: radial-gradient(ellipse 90% 70% at 22% 18%, ${pigmentMix(color, 78, "white")} 0%, transparent 68%), radial-gradient(ellipse 80% 60% at 78% 82%, ${pigmentMix(color, 72, "black")} 0%, transparent 62%), linear-gradient(to top, ${pigmentMix(color, 52, "black")} 0%, ${pigmentMix(color, 68, "black")} 38%, ${color} 72%, ${pigmentMix(color, 90, "white")} 100%);`
}

/** Horizontal pigment drift overlay for SVG connector fills. */
export function getEventPigmentHorizontalStops(
	color: string,
): EventMarkerGradientStop[] {
	return [
		{
			offset: "0%",
			color: pigmentMix(color, 84, "white"),
		},
		{
			offset: "48%",
			color: `color-mix(in srgb, ${color} 38%, transparent)`,
		},
		{
			offset: "100%",
			color: pigmentMix(color, 78, "black"),
		},
	]
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
