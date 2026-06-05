export type SupportedLocales = "en" | "fr"

export type LocalizedText = {
	[key in SupportedLocales]: string
}

export type EnrichedPeriod = Period & { depth: number }

export interface Period {
	id: number
	parentPeriodId: number | null
	start: number
	end: number
	/**
	 * Start boundary uncertainty in years. The period could have started between
	 * (start - startUncertainty/2) and (start + startUncertainty/2).
	 * For example: if start = -538800000 and startUncertainty = 600000,
	 * the start boundary range is from -539100000 to -538500000 (±300,000 years).
	 */
	startUncertainty: number
	/**
	 * End boundary uncertainty in years. The period could have ended between
	 * (end - endUncertainty/2) and (end + endUncertainty/2).
	 * For example: if end = -251902000 and endUncertainty = 24000,
	 * the end boundary range is from -251914000 to -251890000 (±12,000 years).
	 *
	 * Note: For periods that end at the present day (end = 2015), endUncertainty is 0.
	 */
	endUncertainty: number
	duration: number
	name: LocalizedText
	description: LocalizedText
	color: string
	image: string | null
}
export interface Event {
	id: number
	parentPeriodId: number | null
	date: number
	/**
	 * Date uncertainty in years. The event could have occurred between
	 * (date - dateUncertainty/2) and (date + dateUncertainty/2).
	 * For example: if date = -3600000000 and dateUncertainty = 500000000,
	 * the event range is from -3850000000 to -3350000000 (±250 million years).
	 */
	dateUncertainty: number
	name: LocalizedText
	description: LocalizedText
	image: string
}

export interface TimelineTick {
	year: number
	position: number
}
