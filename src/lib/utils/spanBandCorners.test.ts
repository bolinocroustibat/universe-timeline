import { describe, expect, test } from "bun:test"
import { SPAN_BAND_CORNER_RADIUS_PX } from "$lib/constants/layout"
import {
	getEventCardCornerRadiusStyle,
	getEventCardTopCornerRadiusStyle,
	getEventPeriodBandCornerFlags,
	getSpanBandBorderRadius,
} from "$lib/utils/spanBandCorners"

describe("getSpanBandBorderRadius", () => {
	test("rounds only requested corners", () => {
		expect(
			getSpanBandBorderRadius({
				roundTopLeft: true,
				roundTopRight: true,
			}),
		).toBe(`${SPAN_BAND_CORNER_RADIUS_PX}px ${SPAN_BAND_CORNER_RADIUS_PX}px 0px 0px`)
	})

	test("returns zero radius when no corners are rounded", () => {
		expect(getSpanBandBorderRadius({})).toBe("0px 0px 0px 0px")
	})
})

describe("getEventPeriodBandCornerFlags", () => {
	test("rounds top corners for the only lane in a group", () => {
		expect(getSpanBandBorderRadius(getEventPeriodBandCornerFlags(0, 0))).toBe(
			`${SPAN_BAND_CORNER_RADIUS_PX}px ${SPAN_BAND_CORNER_RADIUS_PX}px 0px 0px`,
		)
	})

	test("rounds top corners only for the highest lane", () => {
		expect(getSpanBandBorderRadius(getEventPeriodBandCornerFlags(1, 1))).toBe(
			`${SPAN_BAND_CORNER_RADIUS_PX}px ${SPAN_BAND_CORNER_RADIUS_PX}px 0px 0px`,
		)
		expect(getSpanBandBorderRadius(getEventPeriodBandCornerFlags(0, 1))).toBe(
			"0px 0px 0px 0px",
		)
	})
})

describe("event card corner radius styles", () => {
	test("uses SPAN_BAND_CORNER_RADIUS_PX for full and top-only cards", () => {
		expect(getEventCardCornerRadiusStyle()).toBe(
			`border-radius: ${SPAN_BAND_CORNER_RADIUS_PX}px ${SPAN_BAND_CORNER_RADIUS_PX}px ${SPAN_BAND_CORNER_RADIUS_PX}px ${SPAN_BAND_CORNER_RADIUS_PX}px;`,
		)
		expect(getEventCardTopCornerRadiusStyle()).toBe(
			`border-radius: ${SPAN_BAND_CORNER_RADIUS_PX}px ${SPAN_BAND_CORNER_RADIUS_PX}px 0px 0px;`,
		)
	})
})
