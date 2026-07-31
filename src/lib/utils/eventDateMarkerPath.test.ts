import { describe, expect, test } from "bun:test"
import {
	buildEventDateMarkerPath,
	getEventDateMarkerBBox,
} from "$lib/utils/eventDateMarkerPath"

describe("getEventDateMarkerBBox", () => {
	test("computes bbox spanning card and anchor", () => {
		expect(
			getEventDateMarkerBBox({
				topLeft: 100,
				topRight: 300,
				bottomLeft: 150,
				bottomRight: 200,
				height: 80,
			}),
		).toEqual({ left: 100, width: 200, height: 80 })
	})

	test("handles clamped card wider than anchor on the left", () => {
		expect(
			getEventDateMarkerBBox({
				topLeft: 0,
				topRight: 200,
				bottomLeft: 450,
				bottomRight: 550,
				height: 100,
			}),
		).toEqual({ left: 0, width: 550, height: 100 })
	})
})

describe("buildEventDateMarkerPath", () => {
	test("builds a closed symmetric range path", () => {
		const bbox = getEventDateMarkerBBox({
			topLeft: 100,
			topRight: 300,
			bottomLeft: 180,
			bottomRight: 220,
			height: 100,
		})

		const path = buildEventDateMarkerPath(
			{
				topLeft: 100,
				topRight: 300,
				bottomLeft: 180,
				bottomRight: 220,
				height: 100,
			},
			bbox.left,
		)

		expect(path.startsWith("M 80 100")).toBe(true)
		expect(path).toContain("Z")
		expect(path.split("M").length - 1).toBe(1)
	})

	test("builds an asymmetric path when card is clamped", () => {
		const bbox = getEventDateMarkerBBox({
			topLeft: 0,
			topRight: 200,
			bottomLeft: 450,
			bottomRight: 550,
			height: 120,
		})

		const path = buildEventDateMarkerPath(
			{
				topLeft: 0,
				topRight: 200,
				bottomLeft: 450,
				bottomRight: 550,
				height: 120,
			},
			bbox.left,
		)

		expect(path.startsWith("M 450 120")).toBe(true)
		expect(path).toContain("L 550 120")
		expect(path).toContain("Z")
	})

	test("builds a point-tier path converging at anchor x", () => {
		const bbox = getEventDateMarkerBBox({
			topLeft: 100,
			topRight: 300,
			bottomLeft: 200,
			bottomRight: 200,
			height: 80,
		})

		const path = buildEventDateMarkerPath(
			{
				topLeft: 100,
				topRight: 300,
				bottomLeft: 200,
				bottomRight: 200,
				height: 80,
			},
			bbox.left,
		)

		expect(path.startsWith("M 100 80")).toBe(true)
		expect(path).toContain("L 100 80")
		expect(path).toContain("Z")
	})
})
