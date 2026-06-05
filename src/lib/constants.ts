export const TIME_CONSTANTS = {
	START_YEAR: -13800000000,
	END_YEAR: new Date().getFullYear(),
} as const

// Default zoom level
export const DEFAULT_ZOOM_LEVEL = 1

export const PERIOD_BAND_COUNT = 4

type ZoomAnchor = {
	viewportYearSpan: number
	majorTickInterval: number
	minorTickInterval: number
}

type ZoomScale = ZoomAnchor & {
	level: number
}

const ZOOM_ANCHORS: ZoomAnchor[] = [
	{
		viewportYearSpan: 13800000000,
		majorTickInterval: 1000000000,
		minorTickInterval: 100000000,
	}, // 13.8 Billion years (full universe timeline)
	{
		viewportYearSpan: 5000000000,
		majorTickInterval: 1000000000,
		minorTickInterval: 100000000,
	}, // 5 Billion years
	{
		viewportYearSpan: 1000000000,
		majorTickInterval: 1000000000,
		minorTickInterval: 100000000,
	}, // Billion years
	{
		viewportYearSpan: 300000000,
		majorTickInterval: 100000000,
		minorTickInterval: 10000000,
	}, // Hundred millions
	{
		viewportYearSpan: 100000000,
		majorTickInterval: 10000000,
		minorTickInterval: 1000000,
	}, // Ten millions
	{
		viewportYearSpan: 30000000,
		majorTickInterval: 10000000,
		minorTickInterval: 1000000,
	}, // Ten millions
	{
		viewportYearSpan: 10000000,
		majorTickInterval: 1000000,
		minorTickInterval: 100000,
	}, // Millions
	{
		viewportYearSpan: 3000000,
		majorTickInterval: 1000000,
		minorTickInterval: 100000,
	}, // Millions
	{
		viewportYearSpan: 1000000,
		majorTickInterval: 100000,
		minorTickInterval: 10000,
	}, // Hundred thousands
	{
		viewportYearSpan: 300000,
		majorTickInterval: 100000,
		minorTickInterval: 10000,
	}, // Hundred thousands
	{
		viewportYearSpan: 100000,
		majorTickInterval: 10000,
		minorTickInterval: 1000,
	}, // Ten thousands
	{
		viewportYearSpan: 30000,
		majorTickInterval: 10000,
		minorTickInterval: 1000,
	}, // Ten thousands
	{
		viewportYearSpan: 10000,
		majorTickInterval: 1000,
		minorTickInterval: 100,
	}, // Thousands
	{
		viewportYearSpan: 3000,
		majorTickInterval: 1000,
		minorTickInterval: 100,
	}, // Thousands
	{
		viewportYearSpan: 1000,
		majorTickInterval: 100,
		minorTickInterval: 10,
	}, // Centuries
]

function buildZoomScales(): ZoomScale[] {
	const scales: ZoomScale[] = []
	let level = 1

	for (let i = 0; i < ZOOM_ANCHORS.length; i++) {
		scales.push({ level: level++, ...ZOOM_ANCHORS[i] })

		if (i < ZOOM_ANCHORS.length - 1) {
			const coarser = ZOOM_ANCHORS[i]
			const finer = ZOOM_ANCHORS[i + 1]
			scales.push({
				level: level++,
				viewportYearSpan: Math.sqrt(
					coarser.viewportYearSpan * finer.viewportYearSpan,
				),
				majorTickInterval: coarser.majorTickInterval,
				minorTickInterval: coarser.minorTickInterval,
			})
		}
	}

	return scales
}

export const ZOOM_SCALES = buildZoomScales()
export const MAX_ZOOM_LEVEL = ZOOM_SCALES.length
export const ZOOM_ANCHOR_LEVELS = ZOOM_ANCHORS.map((_, i) => i * 2 + 1)
