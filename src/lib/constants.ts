export const TIME_CONSTANTS = {
	START_YEAR: -4000000000,
	END_YEAR: new Date().getFullYear(),
} as const

// These could be adjusted based on future needs
export const ZOOM_SCALES = [
	{
		level: 1,
		viewportYearSpan: 1000000000,
		majorTickInterval: 1000000000,
		minorTickInterval: 100000000,
	}, // Billion years
	{
		level: 2,
		viewportYearSpan: 300000000,
		majorTickInterval: 100000000,
		minorTickInterval: 10000000,
	}, // Hundred millions
	{
		level: 3,
		viewportYearSpan: 100000000,
		majorTickInterval: 10000000,
		minorTickInterval: 1000000,
	}, // Ten millions
	{
		level: 4,
		viewportYearSpan: 30000000,
		majorTickInterval: 10000000,
		minorTickInterval: 1000000,
	}, // Ten millions
	{
		level: 5,
		viewportYearSpan: 10000000,
		majorTickInterval: 1000000,
		minorTickInterval: 100000,
	}, // Millions
	{
		level: 6,
		viewportYearSpan: 3000000,
		majorTickInterval: 1000000,
		minorTickInterval: 100000,
	}, // Millions
	{
		level: 7,
		viewportYearSpan: 1000000,
		majorTickInterval: 100000,
		minorTickInterval: 10000,
	}, // Hundred thousands
	{
		level: 8,
		viewportYearSpan: 300000,
		majorTickInterval: 100000,
		minorTickInterval: 10000,
	}, // Hundred thousands
	{
		level: 9,
		viewportYearSpan: 100000,
		majorTickInterval: 10000,
		minorTickInterval: 1000,
	}, // Ten thousands
	{
		level: 10,
		viewportYearSpan: 30000,
		majorTickInterval: 10000,
		minorTickInterval: 1000,
	}, // Ten thousands
	{
		level: 11,
		viewportYearSpan: 10000,
		majorTickInterval: 1000,
		minorTickInterval: 100,
	}, // Thousands
	{
		level: 12,
		viewportYearSpan: 3000,
		majorTickInterval: 1000,
		minorTickInterval: 100,
	}, // Thousands
	{
		level: 13,
		viewportYearSpan: 1000,
		majorTickInterval: 100,
		minorTickInterval: 10,
	}, // Centuries
] as const
