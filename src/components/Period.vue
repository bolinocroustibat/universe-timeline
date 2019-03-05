<template>
	<div id="period" :style="style">{{ period.name }}</div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';
import { Period } from '../models';

@Component({
	props: {
		period: Period
	}
})
export default class PeriodComponent extends Vue {

	// initial data
	props = ['period'];

	// lifecycle hook
	mounted() {
		// this.greet()
	}

	get style() {
		return 'background-color: #' + this.period.color + ';';
	}

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#period {
	border: 1px solid black;
}
</style>