const currentYear = new Date().getFullYear()

export const TIME_CONSTANTS = {
	START_YEAR: -1000000000,
	END_YEAR: currentYear,
	TICKS_PER_MAJOR: 10, // Number of minor ticks between major ticks
} as const

// These could be adjusted based on future needs
export const ZOOM_SCALES = [
	{ level: 1, visibleYears: 1000000000 }, // Billion years
	{ level: 2, visibleYears: 300000000 }, // Hundred millions
	{ level: 3, visibleYears: 100000000 }, // Hundred millions
	{ level: 4, visibleYears: 30000000 }, // Ten millions
	{ level: 5, visibleYears: 10000000 }, // Ten millions
	{ level: 6, visibleYears: 3000000 }, // Millions
	{ level: 7, visibleYears: 1000000 }, // Millions
	{ level: 8, visibleYears: 300000 }, // Hundred thousands
	{ level: 9, visibleYears: 100000 }, // Hundred thousands
	{ level: 10, visibleYears: 30000 }, // Ten thousands
	{ level: 11, visibleYears: 10000 }, // Ten thousands
	{ level: 12, visibleYears: 3000 }, // Thousands
	{ level: 13, visibleYears: 1000 }, // Thousands
] as const
