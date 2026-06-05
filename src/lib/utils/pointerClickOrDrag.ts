export const POINTER_DRAG_THRESHOLD_PX = 5

export function bindPointerClick(node: HTMLElement, onClick: () => void) {
	let startX = 0
	let startY = 0
	let pointerId = -1
	let dragged = false

	function cleanup() {
		window.removeEventListener("pointermove", handlePointerMove)
		window.removeEventListener("pointerup", handlePointerUp)
		window.removeEventListener("pointercancel", handlePointerUp)
	}

	function handlePointerMove(e: PointerEvent) {
		if (e.pointerId !== pointerId) return

		const distance = Math.hypot(e.clientX - startX, e.clientY - startY)
		if (distance > POINTER_DRAG_THRESHOLD_PX) {
			dragged = true
		}
	}

	function handlePointerUp(e: PointerEvent) {
		if (e.pointerId !== pointerId) return

		cleanup()

		if (!dragged) {
			onClick()
		}
	}

	function handlePointerDown(e: PointerEvent) {
		if (e.button !== 0) return

		startX = e.clientX
		startY = e.clientY
		pointerId = e.pointerId
		dragged = false

		window.addEventListener("pointermove", handlePointerMove)
		window.addEventListener("pointerup", handlePointerUp)
		window.addEventListener("pointercancel", handlePointerUp)
	}

	node.addEventListener("pointerdown", handlePointerDown)

	return {
		destroy() {
			cleanup()
			node.removeEventListener("pointerdown", handlePointerDown)
		},
	}
}
