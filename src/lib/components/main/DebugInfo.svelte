<script lang="ts">
interface Props {
	currentScale: { visibleYears: number }
	visibleStartYear: number
	visibleEndYear: number
}

let { currentScale, visibleStartYear, visibleEndYear }: Props = $props()
</script>

<div class="fixed top-24 right-4 bg-black/80 text-white text-xs p-2 rounded-md space-y-1 z-50">
    <div>Visible Years: {currentScale.visibleYears}</div>
    <div>Range: {visibleStartYear} - {visibleEndYear}</div>
</div>
