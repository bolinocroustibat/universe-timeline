const PIGMENT_HIGHLIGHT_MIX = 84
const PIGMENT_SHADOW_MIX = 70
const PIGMENT_DRIFT_LIGHT_MIX = 86
const PIGMENT_DRIFT_DARK_MIX = 82
const PIGMENT_BLOOM_MIX = 78
const PIGMENT_POOL_MIX = 72

export function pigmentMix(
	color: string,
	colorWeight: number,
	target: "white" | "black",
): string {
	return `color-mix(in srgb, ${color} ${colorWeight}%, ${target})`
}

/** Soft mesh + depth layers stacked over a base fill color. */
export function getPigmentBackgroundLayers(color: string): string[] {
	const highlight = pigmentMix(color, PIGMENT_HIGHLIGHT_MIX, "white")
	const shadow = pigmentMix(color, PIGMENT_SHADOW_MIX, "black")
	const driftLight = pigmentMix(color, PIGMENT_DRIFT_LIGHT_MIX, "white")
	const driftDark = pigmentMix(color, PIGMENT_DRIFT_DARK_MIX, "black")
	const bloom = pigmentMix(color, PIGMENT_BLOOM_MIX, "white")
	const pool = pigmentMix(color, PIGMENT_POOL_MIX, "black")

	return [
		`radial-gradient(ellipse 95% 75% at 18% 22%, ${bloom} 0%, transparent 72%)`,
		`radial-gradient(ellipse 85% 65% at 82% 78%, ${pool} 0%, transparent 68%)`,
		`linear-gradient(to right, ${driftLight} 0%, ${color} 34%, ${color} 66%, ${driftDark} 100%)`,
		`linear-gradient(to bottom, ${highlight} 0%, ${color} 36%, ${color} 64%, ${shadow} 100%)`,
	]
}

export function buildPigmentBackgroundStyle(
	color: string,
	horizontalBlendLayer?: string,
): string {
	const layers = [
		...getPigmentBackgroundLayers(color),
		...(horizontalBlendLayer ? [horizontalBlendLayer] : []),
	]

	return `background-color: ${color}; background-image: ${layers.join(", ")};`
}
