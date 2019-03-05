<template>
	<div id="frise">
		<period v-for="p in periods" v-bind:period="p" v-bind:key="p.id"></period>
		<!-- <event></event> -->
	</div>
</template>

<script lang="ts">

	import { Component, Prop, Vue } from 'vue-property-decorator';

	import PeriodComponent from './Period.vue';
	// import EventComponent from './Event.vue';

	import { Period, Event } from '@/models';

	import periodsJson from '../json/periods.json';
	import eventsJson from '../json/events.json';


	@Component({
		components: {
			'period': PeriodComponent,
			// 'event': EventComponent
		},
	})
	export default class FriseComponent extends Vue {

		// initial data
		periods: Array<Period> = [];
		events: Array<Event> = [];

		// // Lifecycle hooks
		// created () { },
		// mounted () { },
		// updated () { },
		// destroyed () { }
		mounted () {
			periodsJson.forEach((element: any) => {
				this.periods.push(new Period(element));
			});
			// eventsJson.forEach((element: any) => {
			// 	this.periods.push(new Period(element));
			// });
		}

	}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#frise {
	width: 100%;
	height: 200px;
	background-color: grey;
	display: flex;
}
</style>