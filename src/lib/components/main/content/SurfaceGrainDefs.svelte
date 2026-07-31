<script lang="ts">
import { SURFACE_GRAIN_PATTERN_ID } from "$lib/constants/surfaceGrain"
</script>

<svg aria-hidden="true" class="absolute h-0 w-0 overflow-hidden" focusable="false">
	<defs>
		<pattern
			id={SURFACE_GRAIN_PATTERN_ID}
			patternUnits="userSpaceOnUse"
			width="256"
			height="256"
		>
			<image href="/textures/noise.png" width="256" height="256" preserveAspectRatio="none" />
		</pattern>
	</defs>
</svg>
