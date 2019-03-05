<template>
	<div>EVENT</div>
</template>

<script lang="ts">

import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class EventComponent extends Vue {

	// initial data
	msg = 123;

	// lifecycle hook
	mounted () {
		// this.greet()
	}

	// method
	greet () {
		// alert('greeting: ' + this.msg)
	}

}
</script>