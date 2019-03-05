export class Period {
	constructor(period: any = {}) {
		Object.assign(this, period);
	}
	id: number;
	parent_period_id: number;
	has_child: number;
	start: number;
	end: number;
	start_uncertainty: number;
	duration: number;
	name: string;
	description: string;
	color: string;
	image: string;
}


export class Event {
	// constructor(event: any = {}) {
	// 	Object.assign(this, event);
	// }
	id: number;
	parent_period_id: number;
	date: number;
	date_abs: number;
	name: string;
	description: string;
	image: string;
}