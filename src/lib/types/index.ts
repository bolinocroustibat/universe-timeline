export type SupportedLocales = "en" | "fr"

export type LocalizedText = {
	[key in SupportedLocales]: string
}

export interface Period {
	id: number
	parentPeriodId: number
	hasChild: number
	start: number
	end: number
	startUncertainty: number
	duration: number
	name: LocalizedText
	description: LocalizedText
	color: string
	image: string | null
}
export interface Event {
	id: number
	parentPeriodId: number
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
