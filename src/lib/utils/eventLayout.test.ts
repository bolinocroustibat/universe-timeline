import { describe, expect, test } from "bun:test"
import { EVENT_CARD_MIN_BOTTOM_OFFSET_PX } from "$lib/constants"
import type { Event } from "$lib/types"
import {
	buildEventLayouts,
	EVENT_CARD_HEIGHT,
	EVENT_CARD_WIDTH,
	EVENT_LANE_PEEK_GAP_PX,
	EVENT_Z_INDEX_MAX_DEFAULT,
	EVENT_Z_INDEX_SELECTED,
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
		color: "#3d4558",
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
		expect(layouts[0]?.spanBand).toEqual({
			bottom: EVENT_CARD_MIN_BOTTOM_OFFSET_PX,
			height: 300 - EVENT_CARD_MIN_BOTTOM_OFFSET_PX,
		})
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
		expect(layouts[0]?.spanBand?.height).toBe(
			(300 - EVENT_CARD_MIN_BOTTOM_OFFSET_PX) / 2,
		)
		expect(layouts[1]?.spanBand?.height).toBe(
			(300 - EVENT_CARD_MIN_BOTTOM_OFFSET_PX) / 2,
		)
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

	test("keeps lane-0 cards above the events zone floor", () => {
		const layouts = buildEventLayouts({
			events: [createEvent({ date: 5000 })],
			...baseParams,
		})

		expect(layouts[0]?.bottom).toBe(EVENT_CARD_MIN_BOTTOM_OFFSET_PX)
		expect(layouts[0]?.markerHeight).toBe(0)
	})

	test("uses natural lane step from collapsed card height", () => {
		const peekGap = EVENT_LANE_PEEK_GAP_PX
		const naturalLaneStep = EVENT_CARD_HEIGHT + peekGap
		const zoneHeight =
			naturalLaneStep + EVENT_CARD_HEIGHT + EVENT_CARD_MIN_BOTTOM_OFFSET_PX

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
		})

		expect(layouts[0]?.bottom).toBe(EVENT_CARD_MIN_BOTTOM_OFFSET_PX)
		expect(layouts[1]?.bottom).toBe(
			EVENT_CARD_MIN_BOTTOM_OFFSET_PX + naturalLaneStep,
		)
	})

	test("compresses lane spacing when stack exceeds zone height", () => {
		const cardHeight = EVENT_CARD_HEIGHT
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

	test("does not compress unrelated groups when another group has a deep stack", () => {
		const cardHeight = EVENT_CARD_HEIGHT
		const peekGap = EVENT_LANE_PEEK_GAP_PX
		const naturalLaneStep = cardHeight + peekGap
		// Fits a 2-lane group at natural spacing, but not a 3-lane group.
		const zoneHeight =
			naturalLaneStep + cardHeight + 1 + EVENT_CARD_MIN_BOTTOM_OFFSET_PX

		const layouts = buildEventLayouts({
			events: [
				// Left group: two overlapping cards.
				createEvent({ id: 1, date: 5000 }),
				createEvent({ id: 2, date: 5050 }),
				// Right group: three cards clamped to the same viewport edge.
				createEvent({ id: 3, date: 9950 }),
				createEvent({ id: 4, date: 9960 }),
				createEvent({ id: 5, date: 9970 }),
			],
			leftEdgeYear: 0,
			rightEdgeYear: 10_000,
			yearsPerPixel: 10,
			viewportWidth: 1000,
			zoneHeight,
			cardHeight,
			peekGap,
		})

		const leftGroup = layouts.filter((layout) =>
			[1, 2].includes(layout.event.id),
		)
		const rightGroup = layouts.filter((layout) =>
			[3, 4, 5].includes(layout.event.id),
		)

		expect(leftGroup).toHaveLength(2)
		expect(rightGroup).toHaveLength(3)

		// Left group keeps natural spacing because it only needs two lanes.
		expect(leftGroup[1]?.bottom).toBe(
			EVENT_CARD_MIN_BOTTOM_OFFSET_PX + naturalLaneStep,
		)

		// Right group is compressed to fit three lanes in the same zone height.
		expect(rightGroup[1]?.bottom ?? 0).toBeLessThan(naturalLaneStep)
		expect(rightGroup[2]?.bottom ?? 0).toBeLessThan(naturalLaneStep * 2)
	})

	test("caps default z-index below selected for deep stacks", () => {
		const events = Array.from({ length: 25 }, (_, index) =>
			createEvent({ id: index + 1, date: 9950 + index }),
		)

		const layouts = buildEventLayouts({
			events,
			leftEdgeYear: 0,
			rightEdgeYear: 10_000,
			yearsPerPixel: 10,
			viewportWidth: 1000,
			zoneHeight: 300,
		})

		expect(layouts.every((layout) => layout.zIndexBase <= EVENT_Z_INDEX_MAX_DEFAULT)).toBe(
			true,
		)
		expect(layouts[24]?.zIndexBase).toBe(EVENT_Z_INDEX_MAX_DEFAULT)
		expect(EVENT_Z_INDEX_SELECTED).toBeGreaterThan(EVENT_Z_INDEX_MAX_DEFAULT)
	})
})
