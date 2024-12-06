<script lang="ts">
import Footer from "$lib/components/Footer.svelte"
import Header from "$lib/components/Header.svelte"
import Main from "$lib/components/Main.svelte"
import "../app.css"
const { children } = $props()
</script>

<div class="min-h-screen bg-gray-50">
  <Header />
  <Main>
    {@render children?.()}
  </Main>
  <Footer />
</div>
