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

// Locale-specific time-related strings
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
 * @returns Formatted year string with appropriate abbreviation
 */
export function formatDate(
	year: number,
	locale: SupportedLocales = "en",
	withEra: boolean = true,
): string {
	const absYear = Math.abs(year)
	const localeStrings = TIME_LOCALES[locale]

	let baseString: string

	// Very round numbers should use higher-level units
	// Check if the year is exactly divisible by a higher unit
	if (absYear >= 1_000_000_000 && absYear % 1_000_000_000 === 0) {
		// Year is exactly divisible by 1 billion - use billion formatting
		const billions = absYear / 1_000_000_000
		const formatted = formatLargeNumber(billions, locale, {
			maximumFractionDigits: 0,
		})
		const form = billions === 1 ? "singular" : "plural"
		// Add "-" sign if not using era suffix (to indicate negative years)
		baseString = `${withEra ? "" : year < 0 ? "-" : ""}${formatted} ${localeStrings.numbers.billion[form]}`
	} else if (absYear >= 1_000_000 && absYear % 1_000_000 === 0) {
		// Year is exactly divisible by 1 million - use million formatting
		const millions = absYear / 1_000_000
		const formatted = formatLargeNumber(millions, locale, {
			maximumFractionDigits: 0,
		})
		const form = millions === 1 ? "singular" : "plural"
		// Add "-" sign if not using era suffix (to indicate negative years)
		baseString = `${withEra ? "" : year < 0 ? "-" : ""}${formatted} ${localeStrings.numbers.million[form]}`
	} else {
		// Default format for years
		// Add "-" sign if not using era suffix (to indicate negative years)
		baseString = withEra
			? formatLargeNumber(absYear, locale)
			: formatLargeNumber(year, locale)
	}

	// Add era suffix if requested
	if (withEra) {
		const eraSuffix =
			year < 0 ? localeStrings.era.before : localeStrings.era.after
		return `${baseString}${eraSuffix}`
	}

	return baseString
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
