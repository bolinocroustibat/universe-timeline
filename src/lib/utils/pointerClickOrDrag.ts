export const POINTER_DRAG_THRESHOLD_PX = 5

export function bindPointerClick(
	node: HTMLElement | SVGElement,
	onClick: () => void,
) {
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

	function handlePointerDown(e: Event) {
		if (!(e instanceof PointerEvent) || e.button !== 0) return

		startX = e.clientX
		startY = e.clientY
		pointerId = e.pointerId
		dragged = false

		window.addEventListener("pointermove", handlePointerMove)
		window.addEventListener("pointerup", handlePointerUp)
		window.addEventListener("pointercancel", handlePointerUp)
	}

	const pointerDownListener = handlePointerDown as EventListener

	node.addEventListener("pointerdown", pointerDownListener)

	return {
		destroy() {
			cleanup()
			node.removeEventListener("pointerdown", pointerDownListener)
		},
	}
}
