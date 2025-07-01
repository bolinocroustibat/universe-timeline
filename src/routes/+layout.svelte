<script lang="ts">
import Footer from "$lib/components/Footer.svelte"
import Header from "$lib/components/Header.svelte"
import "../app.css"
</script>

<div class="min-h-screen bg-gray-800 flex flex-col">
	<Header />
	<slot />
	<Footer />
</div>
