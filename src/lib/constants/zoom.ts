import { TIME_CONSTANTS } from "./timeline"

// Default zoom level
export const DEFAULT_ZOOM_LEVEL = 1

/** Minimum pixel spacing between minor tick labels before they are shown. */
export const MIN_MINOR_LABEL_SPACING_PX = 85

export type ZoomScale = {
	level: number
	tierId: string
	viewportYearSpan: number
	majorTickInterval: number
	minorTickInterval: number
}

type TickTier = {
	id: string
	majorTickInterval: number
	minorTickInterval: number
	viewportYearSpans: number[]
}

// 29 zoom levels. Level 1 span is derived from TIME_CONSTANTS in buildZoomScales().
const TICK_TIERS: TickTier[] = [
	{
		id: "universe",
		majorTickInterval: 1_000_000_000,
		minorTickInterval: 100_000_000,
		viewportYearSpans: [
			13_800_000_000, 8_306_623_863, 5_000_000_000, 2_236_067_977,
			1_000_000_000, 547_722_558,
		],
	},
	{
		id: "hundred-million",
		majorTickInterval: 100_000_000,
		minorTickInterval: 10_000_000,
		viewportYearSpans: [300_000_000, 173_205_081],
	},
	{
		id: "ten-million",
		majorTickInterval: 10_000_000,
		minorTickInterval: 1_000_000,
		viewportYearSpans: [100_000_000, 54_772_256, 30_000_000, 17_320_508],
	},
	{
		id: "million",
		majorTickInterval: 1_000_000,
		minorTickInterval: 100_000,
		viewportYearSpans: [10_000_000, 5_477_226, 3_000_000, 1_732_051],
	},
	{
		id: "hundred-thousand",
		majorTickInterval: 100_000,
		minorTickInterval: 10_000,
		viewportYearSpans: [1_000_000, 547_723, 300_000, 173_205],
	},
	{
		id: "ten-thousand",
		majorTickInterval: 10_000,
		minorTickInterval: 1_000,
		viewportYearSpans: [100_000, 54_772, 30_000, 17_321],
	},
	{
		id: "thousand",
		majorTickInterval: 1_000,
		minorTickInterval: 100,
		viewportYearSpans: [10_000, 5_477, 3_000, 1_732],
	},
	{
		id: "century",
		majorTickInterval: 100,
		minorTickInterval: 10,
		viewportYearSpans: [1_000],
	},
]

function buildZoomScales(): ZoomScale[] {
	let level = 1
	const fullTimelineSpan = TIME_CONSTANTS.END_YEAR - TIME_CONSTANTS.START_YEAR

	const scales = TICK_TIERS.flatMap((tier) =>
		tier.viewportYearSpans.map((viewportYearSpan) => ({
			level: level++,
			tierId: tier.id,
			viewportYearSpan,
			majorTickInterval: tier.majorTickInterval,
			minorTickInterval: tier.minorTickInterval,
		})),
	)

	if (scales.length > 0) {
		scales[0].viewportYearSpan = fullTimelineSpan
	}

	return scales
}

export const ZOOM_SCALES = buildZoomScales()
export const MAX_ZOOM_LEVEL = ZOOM_SCALES.length
