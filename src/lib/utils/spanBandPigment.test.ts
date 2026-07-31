import { describe, expect, it } from "bun:test"
import {
	buildPigmentBackgroundStyle,
	getPigmentBackgroundLayers,
} from "$lib/utils/spanBandPigment"
import { getSpanBandBackgroundStyle } from "$lib/utils/spanBandStyle"

describe("getPigmentBackgroundLayers", () => {
	it("returns mesh, drift, and depth gradients", () => {
		const layers = getPigmentBackgroundLayers("#336699")

		expect(layers).toHaveLength(4)
		expect(layers[0]).toContain("radial-gradient")
		expect(layers[2]).toContain("linear-gradient(to right")
		expect(layers[3]).toContain("linear-gradient(to bottom")
	})
})

describe("buildPigmentBackgroundStyle", () => {
	it("includes base color and stacked layers", () => {
		const style = buildPigmentBackgroundStyle("#336699")

		expect(style).toContain("background-color: #336699")
		expect(style).toContain("background-image:")
		expect(style).toContain("radial-gradient")
	})

	it("appends an optional horizontal blend layer", () => {
		const style = buildPigmentBackgroundStyle(
			"#336699",
			"linear-gradient(to right, #111 0%, #336699 100%)",
		)

		expect(style).toContain("linear-gradient(to right, #111 0%, #336699 100%)")
	})
})

describe("getSpanBandBackgroundStyle", () => {
	it("uses pigment layers for a flat span", () => {
		const style = getSpanBandBackgroundStyle({ color: "#aa4433" })

		expect(style).toContain("background-color: #aa4433")
		expect(style).toContain("radial-gradient")
		expect(style).toContain("linear-gradient(to bottom")
	})

	it("keeps neighbor blending as the bottom layer", () => {
		const style = getSpanBandBackgroundStyle({
			color: "#aa4433",
			leftNeighborColor: "#112233",
			rightNeighborColor: "#445566",
		})

		expect(style).toContain("linear-gradient(to right")
		expect(style).toContain("radial-gradient")
	})
})
