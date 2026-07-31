import { describe, expect, test } from "bun:test"
import type { GeologicalPeriodSource } from "$lib/utils/geologicalPeriodColors"
import {
	deriveSiblingColors,
	getLightness,
	resolveGeologicalPeriodColors,
} from "$lib/utils/geologicalPeriodColors"

const basePeriod = {
	startUncertainty: 0,
	endUncertainty: 0,
	duration: 100,
	name: { en: "Test", fr: "Test" },
	description: { en: "Test", fr: "Test" },
	image: null,
} satisfies Omit<
	GeologicalPeriodSource,
	"id" | "parentPeriodId" | "start" | "end"
>

describe("deriveSiblingColors", () => {
	test("returns parent color for a single child", () => {
		expect(deriveSiblingColors("#C2410C", 1)).toEqual(["#C2410C"])
	})

	test("returns progressively lighter colors for multiple siblings", () => {
		const colors = deriveSiblingColors("#C2410C", 4)
		const lightness = colors.map(getLightness)

		expect(colors).toHaveLength(4)
		expect(lightness[0]).toBeLessThan(lightness[3])
		expect(new Set(colors).size).toBe(4)
	})

	test("returns the exact parent color for the middle sibling when count is odd", () => {
		const colors = deriveSiblingColors("#C2410C", 5)

		expect(colors[2]).toBe("#c2410c")
	})

	test("avoids near-black colors for large sibling groups", () => {
		const colors = deriveSiblingColors("#005c05", 6)

		for (const color of colors) {
			expect(getLightness(color)).toBeGreaterThan(15)
		}
		expect(new Set(colors).size).toBe(6)
	})
})

describe("resolveGeologicalPeriodColors", () => {
	test("keeps explicit eon colors", () => {
		const periods: GeologicalPeriodSource[] = [
			{
				...basePeriod,
				id: 1,
				parentPeriodId: null,
				start: -4000,
				end: -3000,
				color: "#991B1B",
			},
			{
				...basePeriod,
				id: 2,
				parentPeriodId: null,
				start: -3000,
				end: -2000,
				color: "#C2410C",
			},
		]

		const resolved = resolveGeologicalPeriodColors(periods)

		expect(resolved[0]?.color).toBe("#991B1B")
		expect(resolved[1]?.color).toBe("#C2410C")
	})

	test("derives distinct sibling colors from the parent", () => {
		const periods: GeologicalPeriodSource[] = [
			{
				...basePeriod,
				id: 1,
				parentPeriodId: null,
				start: -4000,
				end: -1000,
				color: "#C2410C",
			},
			{
				...basePeriod,
				id: 2,
				parentPeriodId: 1,
				start: -4000,
				end: -3000,
			},
			{
				...basePeriod,
				id: 3,
				parentPeriodId: 1,
				start: -3000,
				end: -2000,
			},
			{
				...basePeriod,
				id: 4,
				parentPeriodId: 1,
				start: -2000,
				end: -1000,
			},
		]

		const resolved = resolveGeologicalPeriodColors(periods)
		const childColors = resolved.slice(1).map((period) => period.color)

		expect(new Set(childColors).size).toBe(3)
		expect(childColors.every((color) => color !== "#C2410C")).toBe(true)
	})

	test("orders derived siblings from darkest to lightest by start date", () => {
		const periods: GeologicalPeriodSource[] = [
			{
				...basePeriod,
				id: 1,
				parentPeriodId: null,
				start: -4000,
				end: -1000,
				color: "#C2410C",
			},
			{
				...basePeriod,
				id: 2,
				parentPeriodId: 1,
				start: -4000,
				end: -3000,
			},
			{
				...basePeriod,
				id: 3,
				parentPeriodId: 1,
				start: -3000,
				end: -2000,
			},
			{
				...basePeriod,
				id: 4,
				parentPeriodId: 1,
				start: -2000,
				end: -1000,
			},
		]

		const resolved = resolveGeologicalPeriodColors(periods)
		const lightness = resolved
			.slice(1)
			.map((period) => getLightness(period.color))

		expect(lightness[0]).toBeLessThan(lightness[1])
		expect(lightness[1]).toBeLessThan(lightness[2])
	})

	test("uses explicit child color as the base for its descendants", () => {
		const periods: GeologicalPeriodSource[] = [
			{
				...basePeriod,
				id: 1,
				parentPeriodId: null,
				start: -4000,
				end: -1000,
				color: "#15803D",
			},
			{
				...basePeriod,
				id: 2,
				parentPeriodId: 1,
				start: -4000,
				end: -2000,
				color: "#FF0000",
			},
			{
				...basePeriod,
				id: 3,
				parentPeriodId: 2,
				start: -4000,
				end: -3000,
			},
			{
				...basePeriod,
				id: 4,
				parentPeriodId: 2,
				start: -3000,
				end: -2000,
			},
		]

		const resolved = resolveGeologicalPeriodColors(periods)
		const grandchildColors = [
			resolved.find((period) => period.id === 3)?.color,
			resolved.find((period) => period.id === 4)?.color,
		]

		expect(resolved.find((period) => period.id === 2)?.color).toBe("#FF0000")
		expect(grandchildColors[0]).not.toBe("#15803D")
		expect(grandchildColors[1]).not.toBe("#15803D")
		expect(grandchildColors[0]).not.toBe(grandchildColors[1])
	})

	test("derives each hierarchy level from its direct parent", () => {
		const periods: GeologicalPeriodSource[] = [
			{
				...basePeriod,
				id: 1,
				parentPeriodId: null,
				start: -4000,
				end: -500,
				color: "#15803D",
			},
			{
				...basePeriod,
				id: 2,
				parentPeriodId: 1,
				start: -4000,
				end: -2000,
			},
			{
				...basePeriod,
				id: 3,
				parentPeriodId: 2,
				start: -4000,
				end: -3000,
			},
			{
				...basePeriod,
				id: 4,
				parentPeriodId: 2,
				start: -3000,
				end: -2000,
			},
		]

		const resolved = resolveGeologicalPeriodColors(periods)
		const parent = resolved.find((period) => period.id === 2)?.color
		const children = resolved
			.filter((period) => period.parentPeriodId === 2)
			.map((period) => period.color)

		expect(parent).toBeDefined()
		expect(children).toHaveLength(2)
		expect(children.every((color) => color !== "#15803D")).toBe(true)
		expect(new Set(children).size).toBe(2)
	})
})
