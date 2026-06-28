import { describe, expect, test } from "bun:test"
import {
	getClampedSpanPosition,
	snapLayoutX,
	yearToLayoutX,
} from "$lib/utils/spanPosition"

describe("yearToLayoutX", () => {
	test("maps years to layout pixels", () => {
		expect(yearToLayoutX(100, 0, 10)).toBe(10)
	})
})

describe("snapLayoutX", () => {
	test("rounds to nearest pixel", () => {
		expect(snapLayoutX(10.4)).toBe(10)
		expect(snapLayoutX(10.6)).toBe(11)
	})
})

describe("getClampedSpanPosition", () => {
	test("returns unclamped start and end coordinates", () => {
		const position = getClampedSpanPosition({
			start: 200,
			end: 800,
			leftEdgeYear: 0,
			rightEdgeYear: 1000,
			yearsPerPixel: 1,
		})

		expect(position.startX).toBe(200)
		expect(position.endX).toBe(800)
		expect(position.x).toBe(200)
		expect(position.width).toBe(600)
	})
})
