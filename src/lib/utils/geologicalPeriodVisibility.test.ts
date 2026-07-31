import { describe, expect, it } from "bun:test"
import {
	GEOLOGICAL_TIME_END_YEAR,
	GEOLOGICAL_TIME_START_YEAR,
	getMaxGeologicalPeriodDepth,
	viewportOverlapsGeologicalTime,
} from "$lib/utils/geologicalPeriodVisibility"

describe("viewportOverlapsGeologicalTime", () => {
	it("returns true when the viewport intersects Earth geological history", () => {
		expect(
			viewportOverlapsGeologicalTime(
				GEOLOGICAL_TIME_START_YEAR,
				GEOLOGICAL_TIME_END_YEAR,
			),
		).toBe(true)
	})

	it("returns false before geological history begins", () => {
		expect(viewportOverlapsGeologicalTime(-14_000_000_000, -5_000_000_000)).toBe(
			false,
		)
	})

	it("returns false after geological history ends", () => {
		expect(viewportOverlapsGeologicalTime(10_000, 20_000)).toBe(false)
	})
})

describe("getMaxGeologicalPeriodDepth", () => {
	it("hides periods at cosmic zoom", () => {
		expect(
			getMaxGeologicalPeriodDepth(
				13_000_000_000,
				GEOLOGICAL_TIME_START_YEAR,
				GEOLOGICAL_TIME_END_YEAR,
			),
		).toBeNull()
	})

	it("hides periods when the viewport is outside Earth history", () => {
		expect(getMaxGeologicalPeriodDepth(1_000_000_000, -14_000_000_000, -9_000_000_000)).toBeNull()
	})

	it("shows eons only at multi-billion-year zoom", () => {
		expect(
			getMaxGeologicalPeriodDepth(
				5_000_000_000,
				GEOLOGICAL_TIME_START_YEAR,
				GEOLOGICAL_TIME_END_YEAR,
			),
		).toBe(0)
	})

	it("adds eras below 500 million years", () => {
		expect(
			getMaxGeologicalPeriodDepth(
				400_000_000,
				-600_000_000,
				-200_000_000,
			),
		).toBe(1)
	})

	it("adds periods below 50 million years", () => {
		expect(getMaxGeologicalPeriodDepth(30_000_000, -80_000_000, -50_000_000)).toBe(2)
	})

	it("shows the full hierarchy at fine zoom", () => {
		expect(getMaxGeologicalPeriodDepth(5_000_000, -10_000_000, -5_000_000)).toBe(3)
	})
})
