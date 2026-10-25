import { describe, expect, test } from "bun:test"
import {
	detailContentFitsInContainer,
	detailTitleFitsInContainer,
	estimateDetailContentHeight,
} from "#lib/utils/detailContentFit.js"

describe("detailContentFitsInContainer", () => {
	test("returns true when description is empty", () => {
		expect(
			detailContentFitsInContainer(
				{ title: "Big Bang", description: "" },
				200,
				40,
			),
		).toBe(true)
	})

	test("returns false when container has no size", () => {
		expect(
			detailContentFitsInContainer(
				{ title: "Big Bang", description: "A long description." },
				0,
				100,
			),
		).toBe(false)
	})

	test("short description fits a tall wide container", () => {
		expect(
			detailContentFitsInContainer(
				{
					title: "Cambrian Explosion",
					subtitle: "541 Ma",
					description: "Sudden appearance of animal phyla.",
				},
				240,
				160,
			),
		).toBe(true)
	})

	test("long description fails a short container", () => {
		const description =
			"A very long description that should wrap over many lines when the container is narrow and definitely exceed a small vertical budget for inline rendering."

		expect(
			detailContentFitsInContainer(
				{ title: "Event", description },
				120,
				48,
			),
		).toBe(false)
	})
})

describe("estimateDetailContentHeight", () => {
	test("grows with subtitle and description", () => {
		const titleOnly = estimateDetailContentHeight(
			{ title: "Event", description: "" },
			200,
		)
		const withDetails = estimateDetailContentHeight(
			{
				title: "Event",
				subtitle: "2024",
				description: "Something happened.",
			},
			200,
		)

		expect(withDetails).toBeGreaterThan(titleOnly)
	})
})

describe("detailTitleFitsInContainer", () => {
	test("rejects empty-sized containers", () => {
		expect(detailTitleFitsInContainer("Title", 100, 0)).toBe(false)
	})
})
