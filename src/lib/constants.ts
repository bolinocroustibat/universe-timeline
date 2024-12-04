const currentYear = new Date().getFullYear()

export const TIME_CONSTANTS = {
	START_YEAR: -2000, // 2000 BC
	END_YEAR: currentYear,
	TICKS_PER_MAJOR: 10, // Number of minor ticks between major ticks
} as const

// These could be adjusted based on future needs
export const ZOOM_SCALES = [
	{ level: 1, yearsPerMajorTick: 1000 }, // 1 major tick = 1000 years, 1 minor = 100 years
	{ level: 2, yearsPerMajorTick: 500 }, // 1 major tick = 500 years, 1 minor = 50 years
	{ level: 3, yearsPerMajorTick: 200 }, // 1 major tick = 200 years, 1 minor = 20 years
	{ level: 4, yearsPerMajorTick: 100 }, // 1 major tick = 100 years, 1 minor = 10 years
	{ level: 5, yearsPerMajorTick: 50 }, // 1 major tick = 50 years, 1 minor = 5 years
	{ level: 6, yearsPerMajorTick: 20 }, // 1 major tick = 20 years, 1 minor = 2 years
	{ level: 7, yearsPerMajorTick: 10 }, // 1 major tick = 10 years, 1 minor = 1 year
	{ level: 8, yearsPerMajorTick: 5 }, // 1 major tick = 5 years, 1 minor = 6 months
	{ level: 9, yearsPerMajorTick: 2 }, // 1 major tick = 2 years, 1 minor = 3 months
	{ level: 10, yearsPerMajorTick: 1 }, // 1 major tick = 1 year, 1 minor = 1 month
] as const
