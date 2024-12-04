const currentYear = new Date().getFullYear()

export const TIME_CONSTANTS = {
	START_YEAR: -1000000000,
	END_YEAR: currentYear,
	TICKS_PER_MAJOR: 10, // Number of minor ticks between major ticks
} as const

// These could be adjusted based on future needs
export const ZOOM_SCALES = [
	{ level: 1, yearsPerMajorTick: 100000000 },
	{ level: 2, yearsPerMajorTick: 30000000 },
	{ level: 3, yearsPerMajorTick: 10000000 },
	{ level: 4, yearsPerMajorTick: 3000000 },
	{ level: 5, yearsPerMajorTick: 1000000 },
	{ level: 6, yearsPerMajorTick: 300000 },
	{ level: 7, yearsPerMajorTick: 100000 },
	{ level: 8, yearsPerMajorTick: 30000 },
	{ level: 9, yearsPerMajorTick: 10000 },
	{ level: 10, yearsPerMajorTick: 3000 },
	{ level: 11, yearsPerMajorTick: 1000 },
	{ level: 12, yearsPerMajorTick: 300 },
	{ level: 13, yearsPerMajorTick: 100 },
] as const
