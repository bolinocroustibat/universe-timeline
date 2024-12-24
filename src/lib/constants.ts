const currentYear = new Date().getFullYear()

export const TIME_CONSTANTS = {
	START_YEAR: -1000000000,
	END_YEAR: currentYear,
} as const

// These could be adjusted based on future needs
export const ZOOM_SCALES = [
	{ level: 1, viewportYearSpan: 1000000000 }, // Billion years
	{ level: 2, viewportYearSpan: 300000000 }, // Hundred millions
	{ level: 3, viewportYearSpan: 100000000 }, // Hundred millions
	{ level: 4, viewportYearSpan: 30000000 }, // Ten millions
	{ level: 5, viewportYearSpan: 10000000 }, // Ten millions
	{ level: 6, viewportYearSpan: 3000000 }, // Millions
	{ level: 7, viewportYearSpan: 1000000 }, // Millions
	{ level: 8, viewportYearSpan: 300000 }, // Hundred thousands
	{ level: 9, viewportYearSpan: 100000 }, // Hundred thousands
	{ level: 10, viewportYearSpan: 30000 }, // Ten thousands
	{ level: 11, viewportYearSpan: 10000 }, // Ten thousands
	{ level: 12, viewportYearSpan: 3000 }, // Thousands
	{ level: 13, viewportYearSpan: 1000 }, // Thousands
] as const
