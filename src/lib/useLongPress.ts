import { useRef } from 'react'

/**
 * useLongPress — detects a long-press on any element.
 *
 * Attaches four event handlers to the target element. After the pointer has been
 * held down for `delay` ms without being lifted or leaving, `onLongPress` fires.
 *
 * Also handles context-menu (right-click / long-press on iOS): calls
 * `e.preventDefault()` to suppress the browser native menu, then fires
 * `onLongPress` immediately.
 *
 * Usage:
 *   const handlers = useLongPress(() => openEditMenu(), 500)
 *   return <div {...handlers}>...</div>
 */
export function useLongPress(onLongPress: () => void, delay = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const start = () => {
    timerRef.current = setTimeout(onLongPress, delay)
  }

  const cancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  return {
    onPointerDown: (_e: React.PointerEvent) => start(),
    onPointerUp: (_e: React.PointerEvent) => cancel(),
    onPointerLeave: (_e: React.PointerEvent) => cancel(),
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault()
      cancel()
      onLongPress()
    },
  }
}
