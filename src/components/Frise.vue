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

	import periodsJson from '../json/frise_periodes.json';
	import eventsJson from '../json/frise_evenements.json';

	@Component({
		components: {
			'period': PeriodComponent,
			// 'event': EventComponent
		},
	})
	export default class FriseComponent extends Vue {

		// initial data
		periods = periodsJson;
		events = eventsJson;

		// lifecycle hook
		mounted () {
			// this.greet()
			// console.log(this.periods.length)
			// console.log(this.periods);
		}

		// method
		greet () {
			// alert('greeting: ' + this.msg)
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