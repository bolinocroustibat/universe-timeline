<template>

</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import json from '../src/frise_periodes.json';
// import json from '../json/frise_evenements.json';

@Component
export default class Frise extends Vue {
	// console.log(json);
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
	margin: 40px 0 0;
}
ul {
	list-style-type: none;
	padding: 0;
}
li {
	display: inline-block;
	margin: 0 10px;
}
a {
	color: #42b983;
}
</style>
