export interface Period {
	id: number
	parentPeriodId: number
	has_child: number
	start: number
	end: number
	startUncertainty: number
	duration: number
	name: string
	description: string
	color: string
	image: string
}

export interface Event {
	id: number
	parentPeriodId: number
	date: number
	dateAbs: number
	name: string
	description: string
	image: string
}

export interface TimelineTick {
	year: number
	position: number
}
