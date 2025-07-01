import type { SupportedLocales } from "$lib/types"

type TimeLocale = {
	numbers: {
		billion: { singular: string; plural: string }
		million: { singular: string; plural: string }
	}
	era: {
		before: string
		after: string
		century: {
			before: string
			after: string
		}
	}
}

// Language-specific time-related strings
const TIME_LOCALES: Record<SupportedLocales, TimeLocale> = {
	en: {
		numbers: {
			billion: {
				singular: "billion",
				plural: "billion",
			},
			million: {
				singular: "million",
				plural: "million",
			},
		},
		era: {
			before: " BCE",
			after: " CE",
			century: {
				before: " BC",
				after: " AD",
			},
		},
	},
	fr: {
		numbers: {
			billion: {
				singular: "milliard",
				plural: "milliards",
			},
			million: {
				singular: "million",
				plural: "millions",
			},
		},
		era: {
			before: " av. J.-C.",
			after: " ap. J.-C.",
			century: {
				before: " av. J.-C.",
				after: " ap. J.-C.",
			},
		},
	},
}

// Common formatting options
const DEFAULT_NUMBER_FORMAT_OPTIONS: Intl.NumberFormatOptions = {
	maximumFractionDigits: 0,
	useGrouping: true,
}

/**
 * Formats a large number with thousand separators according to locale
 * @param number - The number to format
 * @param locale - The locale to use for formatting (defaults to 'en')
 * @param options - Additional Intl.NumberFormat options
 * @returns Formatted number string (e.g., "1,000,000" for en, "1 000 000" for fr)
 */
export function formatLargeNumber(
	number: number,
	locale: SupportedLocales = "en",
	options: Intl.NumberFormatOptions = DEFAULT_NUMBER_FORMAT_OPTIONS,
): string {
	return new Intl.NumberFormat(locale, options).format(number)
}

/**
 * Formats a year with abbreviated large numbers (million/billion)
 * @param year - The year to format (negative for BCE/BC)
 * @param locale - The locale to use for formatting (defaults to 'en')
 * @param tickInterval - The tick interval for formatting
 * @returns Formatted year string with appropriate abbreviation
 */
export function formatYear(
	year: number,
	locale: SupportedLocales = "en",
	tickInterval?: number,
): string {
	const absYear = Math.abs(year)
	const localeStrings = TIME_LOCALES[locale]
	const eraSuffix =
		year < 0 ? localeStrings.era.before : localeStrings.era.after

	// Use the tickInterval to determine formatting
	if (tickInterval) {
		// Special case: Very round numbers should use higher-level units
		// Check if the year is exactly divisible by a higher unit than the tick interval suggests
		if (absYear >= 1_000_000_000 && absYear % 1_000_000_000 === 0) {
			// Year is exactly divisible by 1 billion - use billion formatting
			const billions = absYear / 1_000_000_000
			const formatted = formatLargeNumber(billions, locale, {
				maximumFractionDigits: 0,
			})
			const form = billions === 1 ? "singular" : "plural"
			return `${year < 0 ? "-" : ""}${formatted} ${localeStrings.numbers.billion[form]}`
		}

		if (absYear >= 1_000_000 && absYear % 1_000_000 === 0) {
			// Year is exactly divisible by 1 million - use million formatting
			const millions = absYear / 1_000_000
			const formatted = formatLargeNumber(millions, locale, {
				maximumFractionDigits: 0,
			})
			const form = millions === 1 ? "singular" : "plural"
			return `${year < 0 ? "-" : ""}${formatted} ${localeStrings.numbers.million[form]}`
		}

		// Format billions for billion-year ticks
		if (tickInterval >= 100_000_000) {
			const billions = absYear / 1_000_000_000
			const formatted = formatLargeNumber(billions, locale, {
				maximumFractionDigits: 2,
			})
			const form = billions === 1 ? "singular" : "plural"
			return `${year < 0 ? "-" : ""}${formatted} ${localeStrings.numbers.billion[form]}`
		}

		// Format millions for million-year ticks
		if (tickInterval >= 100_000) {
			const millions = absYear / 1_000_000
			const formatted = formatLargeNumber(millions, locale, {
				maximumFractionDigits: 2,
			})
			const form = millions === 1 ? "singular" : "plural"
			return `${year < 0 ? "-" : ""}${formatted} ${localeStrings.numbers.million[form]}`
		}

		// Format thousands for less than thousand-year ticks
		return `${formatLargeNumber(absYear, locale)}${eraSuffix}`

		// // Format centuries for century ticks
		// if (tickInterval === 100) {
		// 	const centuryNum = Math.abs(Math.floor(year / 100))
		// 	const centurySuffix =
		// 		year < 0
		// 			? localeStrings.era.century.before
		// 			: localeStrings.era.century.after
		// 	return `${centuryNum}${centurySuffix}`
		// }
	}

	// Default format for years
	return `${formatLargeNumber(absYear, locale)}${eraSuffix}`
}

/**
 * Formats a year into a century representation with BC/AD suffix
 * @param year - The year to format (negative for BC, positive for AD)
 * @returns Formatted century string (e.g., "20th BC" or "21st AD")
 */
export function formatCentury(year: number): string {
	const centuryNum = Math.abs(Math.floor(year / 100))
	const suffix = year < 0 ? " BC" : " AD"
	return `${centuryNum}${suffix}`
}
