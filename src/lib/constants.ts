export const TIME_CONSTANTS = {
	START_YEAR: -13800000000,
	END_YEAR: new Date().getFullYear(),
} as const

// Default zoom level
export const DEFAULT_ZOOM_LEVEL = 1

export const PERIOD_BAND_COUNT = 4

type ZoomScale = {
	level: number
	viewportYearSpan: number
	majorTickInterval: number
	minorTickInterval: number
}

export const ZOOM_SCALES: ZoomScale[] = [
	{
		level: 1,
		viewportYearSpan: 13800000000,
		majorTickInterval: 1000000000,
		minorTickInterval: 100000000,
	}, // 13.8 Billion years (full universe timeline)
	{
		level: 2,
		viewportYearSpan: 8306623863,
		majorTickInterval: 1000000000,
		minorTickInterval: 100000000,
	},
	{
		level: 3,
		viewportYearSpan: 5000000000,
		majorTickInterval: 1000000000,
		minorTickInterval: 100000000,
	}, // 5 Billion years
	{
		level: 4,
		viewportYearSpan: 2236067977,
		majorTickInterval: 1000000000,
		minorTickInterval: 100000000,
	},
	{
		level: 5,
		viewportYearSpan: 1000000000,
		majorTickInterval: 1000000000,
		minorTickInterval: 100000000,
	}, // Billion years
	{
		level: 6,
		viewportYearSpan: 547722558,
		majorTickInterval: 1000000000,
		minorTickInterval: 100000000,
	},
	{
		level: 7,
		viewportYearSpan: 300000000,
		majorTickInterval: 100000000,
		minorTickInterval: 10000000,
	}, // Hundred millions
	{
		level: 8,
		viewportYearSpan: 173205081,
		majorTickInterval: 100000000,
		minorTickInterval: 10000000,
	},
	{
		level: 9,
		viewportYearSpan: 100000000,
		majorTickInterval: 10000000,
		minorTickInterval: 1000000,
	}, // Ten millions
	{
		level: 10,
		viewportYearSpan: 54772256,
		majorTickInterval: 10000000,
		minorTickInterval: 1000000,
	},
	{
		level: 11,
		viewportYearSpan: 30000000,
		majorTickInterval: 10000000,
		minorTickInterval: 1000000,
	}, // Ten millions
	{
		level: 12,
		viewportYearSpan: 17320508,
		majorTickInterval: 10000000,
		minorTickInterval: 1000000,
	},
	{
		level: 13,
		viewportYearSpan: 10000000,
		majorTickInterval: 1000000,
		minorTickInterval: 100000,
	}, // Millions
	{
		level: 14,
		viewportYearSpan: 5477226,
		majorTickInterval: 1000000,
		minorTickInterval: 100000,
	},
	{
		level: 15,
		viewportYearSpan: 3000000,
		majorTickInterval: 1000000,
		minorTickInterval: 100000,
	}, // Millions
	{
		level: 16,
		viewportYearSpan: 1732051,
		majorTickInterval: 1000000,
		minorTickInterval: 100000,
	},
	{
		level: 17,
		viewportYearSpan: 1000000,
		majorTickInterval: 100000,
		minorTickInterval: 10000,
	}, // Hundred thousands
	{
		level: 18,
		viewportYearSpan: 547723,
		majorTickInterval: 100000,
		minorTickInterval: 10000,
	},
	{
		level: 19,
		viewportYearSpan: 300000,
		majorTickInterval: 100000,
		minorTickInterval: 10000,
	}, // Hundred thousands
	{
		level: 20,
		viewportYearSpan: 173205,
		majorTickInterval: 100000,
		minorTickInterval: 10000,
	},
	{
		level: 21,
		viewportYearSpan: 100000,
		majorTickInterval: 10000,
		minorTickInterval: 1000,
	}, // Ten thousands
	{
		level: 22,
		viewportYearSpan: 54772,
		majorTickInterval: 10000,
		minorTickInterval: 1000,
	},
	{
		level: 23,
		viewportYearSpan: 30000,
		majorTickInterval: 10000,
		minorTickInterval: 1000,
	}, // Ten thousands
	{
		level: 24,
		viewportYearSpan: 17321,
		majorTickInterval: 10000,
		minorTickInterval: 1000,
	},
	{
		level: 25,
		viewportYearSpan: 10000,
		majorTickInterval: 1000,
		minorTickInterval: 100,
	}, // Thousands
	{
		level: 26,
		viewportYearSpan: 5477,
		majorTickInterval: 1000,
		minorTickInterval: 100,
	},
	{
		level: 27,
		viewportYearSpan: 3000,
		majorTickInterval: 1000,
		minorTickInterval: 100,
	}, // Thousands
	{
		level: 28,
		viewportYearSpan: 1732,
		majorTickInterval: 1000,
		minorTickInterval: 100,
	},
	{
		level: 29,
		viewportYearSpan: 1000,
		majorTickInterval: 100,
		minorTickInterval: 10,
	}, // Centuries
]

export const MAX_ZOOM_LEVEL = ZOOM_SCALES.length
