export type SupportedLocales = "en" | "fr"

export type LocalizedText = {
	[key in SupportedLocales]: string
}

export interface Period {
	id: number
	parentPeriodId: number
	has_child: number
	start: number
	end: number
	startUncertainty: number
	duration: number
	name: LocalizedText
	description: LocalizedText
	color: string
	image: string
}
export interface Event {
	id: number
	parentPeriodId: number
	date: number
	dateAbs: number
	name: LocalizedText
	description: LocalizedText
	image: string
}

export interface TimelineTick {
	year: number
	position: number
}
