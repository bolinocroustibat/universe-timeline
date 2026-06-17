<script lang="ts">
import Footer from "$lib/components/footer/Footer.svelte"
import Header from "$lib/components/header/Header.svelte"
import { SITE_DESCRIPTION, SITE_TITLE } from "$lib/constants/site"
import { currentLocale } from "$lib/stores/localeStore"
import "../app.css"
</script>

<svelte:head>
	<title>{SITE_TITLE[$currentLocale]}</title>
	<meta name="description" content={SITE_DESCRIPTION[$currentLocale]} />
</svelte:head>

<div class="landscape-required main-container min-h-screen bg-background flex flex-col">
	<Header />
	<slot />
	<Footer />
</div>
