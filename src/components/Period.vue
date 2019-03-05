<template>
	<div id="period">PERIOD {{ period.name }}</div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class PeriodComponent extends Vue {

	// initial data
	props = ['period'];

	// lifecycle hook
	mounted () {
		// this.greet()
	}


}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#period {

}
</style>