import { describe, expect, test } from "bun:test"
import type { Event } from "$lib/types"
import {
	buildEventLayouts,
	EVENT_CARD_WIDTH,
	EVENT_LANE_PEEK_GAP_PX,
	getEventCardXPosition,
} from "$lib/utils/eventLayout"
import { getClampedSpanPosition } from "$lib/utils/spanPosition"

describe("getClampedSpanPosition", () => {
	test("clamps span to viewport edges", () => {
		const position = getClampedSpanPosition({
			start: 0,
			end: 1000,
			leftEdgeYear: 100,
			rightEdgeYear: 500,
			yearsPerPixel: 1,
		})

		expect(position.startX).toBe(-100)
		expect(position.endX).toBe(900)
		expect(position.x).toBe(0)
		expect(position.width).toBe(400)
		expect(position.centerX).toBe(200)
	})
})

describe("getEventCardXPosition", () => {
	test("centers card on marker when there is room", () => {
		expect(
			getEventCardXPosition({
				centerX: 500,
				viewportWidth: 1000,
			}),
		).toBe(400)
	})

	test("clamps card to viewport edges", () => {
		expect(
			getEventCardXPosition({
				centerX: 50,
				viewportWidth: 1000,
			}),
		).toBe(0)

		expect(
			getEventCardXPosition({
				centerX: 980,
				viewportWidth: 1000,
			}),
		).toBe(800)
	})
})

function createEvent(overrides: Partial<Event> = {}): Event {
	return {
		id: 1,
		parentPeriodId: null,
		date: 1000,
		dateUncertainty: null,
		name: { en: "Event", fr: "Événement" },
		description: { en: "Description", fr: "Description" },
		image: "",
		...overrides,
	}
}

describe("buildEventLayouts", () => {
	const baseParams = {
		leftEdgeYear: 0,
		rightEdgeYear: 10_000,
		yearsPerPixel: 10,
		viewportWidth: 1000,
		zoneHeight: 300,
	}

	test("uses point tier when uncertainty span is below 1px", () => {
		const layouts = buildEventLayouts({
			events: [createEvent({ dateUncertainty: 5 })],
			...baseParams,
		})

		expect(layouts).toHaveLength(1)
		expect(layouts[0]?.tier).toBe("point")
		expect(layouts[0]?.anchor.width).toBe(1)
	})

	test("uses range tier when span is at least 1px but narrower than card width", () => {
		const layouts = buildEventLayouts({
			events: [createEvent({ date: 5000, dateUncertainty: 1000 })],
			...baseParams,
		})

		expect(layouts[0]?.tier).toBe("range")
		expect(layouts[0]?.anchor.width).toBeGreaterThanOrEqual(1)
		expect(layouts[0]?.anchor.width).toBeLessThan(EVENT_CARD_WIDTH)
	})

	test("uses period tier when span is at least card width", () => {
		const layouts = buildEventLayouts({
			events: [createEvent({ date: 5000, dateUncertainty: 5000 })],
			...baseParams,
		})

		expect(layouts[0]?.tier).toBe("period")
		expect(layouts[0]?.showEdgeBlur).toBe(true)
		expect(layouts[0]?.anchor.width).toBeGreaterThanOrEqual(EVENT_CARD_WIDTH)
		expect(layouts[0]?.spanBand).toEqual({ bottom: 0, height: 300 })
	})

	test("assigns overlapping period spans to stacked vertical bands", () => {
		const layouts = buildEventLayouts({
			events: [
				createEvent({ id: 1, date: 5000, dateUncertainty: 5000 }),
				createEvent({ id: 2, date: 5200, dateUncertainty: 5000 }),
			],
			...baseParams,
		})

		expect(layouts).toHaveLength(2)
		expect(layouts.every((layout) => layout.tier === "period")).toBe(true)
		expect(layouts[0]?.lane).toBe(0)
		expect(layouts[1]?.lane).toBe(1)
		expect(layouts[0]?.spanBand?.height).toBe(150)
		expect(layouts[1]?.spanBand?.height).toBe(150)
		expect(layouts[1]?.spanBand?.bottom).toBeGreaterThan(
			layouts[0]?.spanBand?.bottom ?? 0,
		)
	})

	test("assigns overlapping cards to separate lanes", () => {
		const layouts = buildEventLayouts({
			events: [
				createEvent({ id: 1, date: 5000 }),
				createEvent({ id: 2, date: 5050 }),
			],
			...baseParams,
		})

		expect(layouts).toHaveLength(2)
		expect(layouts[0]?.lane).toBe(0)
		expect(layouts[1]?.lane).toBe(1)
		expect(layouts[1]?.bottom).toBeGreaterThan(layouts[0]?.bottom ?? 0)
	})

	test("compresses lane spacing when stack exceeds zone height", () => {
		const cardHeight = 72
		const peekGap = EVENT_LANE_PEEK_GAP_PX
		const zoneHeight = cardHeight + peekGap + 10

		const layouts = buildEventLayouts({
			events: [
				createEvent({ id: 1, date: 5000 }),
				createEvent({ id: 2, date: 5050 }),
			],
			leftEdgeYear: 0,
			rightEdgeYear: 10_000,
			yearsPerPixel: 10,
			viewportWidth: 1000,
			zoneHeight,
			cardHeight,
			peekGap,
		})

		expect(layouts[1]?.bottom).toBeLessThan(cardHeight + peekGap)
	})
})
