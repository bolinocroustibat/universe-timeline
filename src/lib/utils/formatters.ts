import type { SupportedLocales } from "$lib/types"

// Language-specific number suffixes
const LARGE_NUMBER_SUFFIXES: Record<
	SupportedLocales,
	{
		billion: { singular: string; plural: string }
		million: { singular: string; plural: string }
	}
> = {
	en: {
		billion: {
			singular: "billion",
			plural: "billion", // Same in English
		},
		million: {
			singular: "million",
			plural: "million", // Same in English
		},
	},
	fr: {
		billion: {
			singular: "milliard",
			plural: "milliards",
		},
		million: {
			singular: "million",
			plural: "millions",
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
export function formatYear(
	year: number,
	locale: SupportedLocales = "en",
): string {
	const absYear = Math.abs(year)
	const suffixes = LARGE_NUMBER_SUFFIXES[locale]

	// Format billions
	if (absYear >= 1_000_000_000) {
		const billions = absYear / 1_000_000_000
		const formatted = formatLargeNumber(billions, locale, {
			maximumFractionDigits: 1,
		})
		const form = billions === 1 ? "singular" : "plural"
		return `${year < 0 ? "-" : ""}${formatted} ${suffixes.billion[form]}`
	}

	// Format millions
	if (absYear >= 1_000_000) {
		const millions = absYear / 1_000_000
		const formatted = formatLargeNumber(millions, locale, {
			maximumFractionDigits: 1,
		})
		const form = millions === 1 ? "singular" : "plural"
		return `${year < 0 ? "-" : ""}${formatted} ${suffixes.million[form]}`
	}

	// Format regular numbers
	const formatted = formatLargeNumber(absYear, locale)
	return year < 0 ? `-${formatted}` : formatted
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
