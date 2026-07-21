import chroma from "chroma-js"
import type { GeologicalPeriod } from "$lib/types"

export type GeologicalPeriodSource = Omit<GeologicalPeriod, "color"> & {
	color?: string
}

const DEFAULT_EON_COLOR = "#3d4558"

/** N variations around parentColor in LCH space, symmetrically centered on the parent. */
export function deriveSiblingColors(
	parentColor: string,
	count: number,
): string[] {
	if (count <= 0) {
		return []
	}

	if (count === 1) {
		return [parentColor]
	}

	const base = chroma(parentColor)
	const spread = Math.min(count / 2, 2)
	const lightness = base.get("lch.l")
	const chromaValue = base.get("lch.c")
	const hue = base.get("lch.h")
	const ratio = spread / (spread + 3)

	return chroma
		.scale([
			chroma.lch(lightness * (1 - ratio), chromaValue, hue),
			base,
			chroma.lch(lightness + (100 - lightness) * ratio, chromaValue, hue),
		])
		.mode("lch")
		.colors(count)
}

export function resolveGeologicalPeriodColors(
	periods: GeologicalPeriodSource[],
): GeologicalPeriod[] {
	const byId = new Map(periods.map((period) => [period.id, period]))
	const childrenByParent = new Map<number | null, GeologicalPeriodSource[]>()

	for (const period of periods) {
		const parentId = period.parentPeriodId
		const siblings = childrenByParent.get(parentId) ?? []
		siblings.push(period)
		childrenByParent.set(parentId, siblings)
	}

	const resolvedColors = new Map<number, string>()

	function resolveColor(periodId: number): string {
		const cached = resolvedColors.get(periodId)
		if (cached !== undefined) {
			return cached
		}

		const period = byId.get(periodId)
		if (!period) {
			return DEFAULT_EON_COLOR
		}

		if (period.parentPeriodId === null) {
			const color = period.color ?? DEFAULT_EON_COLOR
			resolvedColors.set(periodId, color)
			return color
		}

		if (period.color) {
			resolvedColors.set(periodId, period.color)
			return period.color
		}

		const parentColor = resolveColor(period.parentPeriodId)
		const autoDerivedSiblings = (childrenByParent.get(period.parentPeriodId) ?? [])
			.filter((sibling) => !sibling.color)
			.sort((a, b) => a.start - b.start)
		const colors = deriveSiblingColors(
			parentColor,
			autoDerivedSiblings.length,
		)
		const index = autoDerivedSiblings.findIndex(
			(sibling) => sibling.id === periodId,
		)
		const color = index >= 0 ? colors[index] : parentColor

		resolvedColors.set(periodId, color)
		return color
	}

	return periods.map((period) => ({
		...period,
		color: resolveColor(period.id),
	}))
}

export function getLightness(color: string): number {
	return chroma(color).get("lch.l")
}
