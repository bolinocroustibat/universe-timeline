<script lang="ts">
import Footer from "$lib/components/footer/Footer.svelte"
import Header from "$lib/components/header/Header.svelte"
import "../app.css"
</script>

<div class="min-h-screen bg-gray-800 flex flex-col">
	<Header />
	<slot />
	<Footer />
</div>
