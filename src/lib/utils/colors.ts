/**
 * Utility functions for color manipulation
 */

/**
 * Blends two hex colors 50/50
 * @param color1 First hex color (e.g., "#ff0000")
 * @param color2 Second hex color (e.g., "#00ff00")
 * @returns Blended hex color
 */
export function blendColors(color1: string, color2: string): string {
	// Convert hex to RGB
	const hexToRgb = (hex: string) => {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
		return result
			? {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16),
				}
			: null
	}

	// Convert RGB to hex
	const rgbToHex = (r: number, g: number, b: number) => {
		return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
	}

	const rgb1 = hexToRgb(color1)
	const rgb2 = hexToRgb(color2)

	if (!rgb1 || !rgb2) return color1

	// Blend 50/50
	const blendedR = Math.round((rgb1.r + rgb2.r) / 2)
	const blendedG = Math.round((rgb1.g + rgb2.g) / 2)
	const blendedB = Math.round((rgb1.b + rgb2.b) / 2)

	return rgbToHex(blendedR, blendedG, blendedB)
}
