<script lang="ts">
interface Props {
	label: string
	checked: boolean
	ariaLabel: string
	onToggle: () => void
}

let { label, checked, ariaLabel, onToggle }: Props = $props()
</script>

<div class="flex flex-col items-center gap-0.5">
	<!-- svelte-ignore a11y_label_has_associated_control -->
	<label class="text-xs text-muted whitespace-nowrap">
		{label}
	</label>
	<button
		onclick={onToggle}
		class="relative inline-flex h-3 w-6 items-center rounded-full cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-accent focus:ring-offset-1 focus:ring-offset-surface {checked ? 'bg-accent' : 'bg-border'}"
		role="switch"
		aria-checked={checked}
		aria-label={ariaLabel}
	>
		<span
			class="inline-block h-2 w-2 transform rounded-full bg-foreground transition-transform duration-200 {checked ? 'translate-x-3' : 'translate-x-0.5'}"
		></span>
	</button>
</div>
