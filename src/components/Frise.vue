<template>
	<div>FRISE CHARGEE</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
// import json from '../src/frise_periodes.json';
// import json from '../json/frise_evenements.json';

@Component
export default class Frise extends Vue {

	// initial data
	msg = 123

	// lifecycle hook
	mounted () {
		this.greet()
	}

	// method
	greet () {
		alert('greeting: ' + this.msg)
	}

}
</script>
