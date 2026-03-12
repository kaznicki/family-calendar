import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLongPress } from './useLongPress'

describe('useLongPress', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns the four pointer event handlers', () => {
    const { result } = renderHook(() => useLongPress(() => {}, 500))
    expect(typeof result.current.onPointerDown).toBe('function')
    expect(typeof result.current.onPointerUp).toBe('function')
    expect(typeof result.current.onPointerLeave).toBe('function')
    expect(typeof result.current.onContextMenu).toBe('function')
  })

  it('fires onLongPress after the delay when pointer is held down', () => {
    const onLongPress = vi.fn()
    const { result } = renderHook(() => useLongPress(onLongPress, 500))

    act(() => {
      result.current.onPointerDown({} as React.PointerEvent)
    })
    expect(onLongPress).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(onLongPress).toHaveBeenCalledTimes(1)
  })

  it('does NOT fire onLongPress when pointer is released before delay', () => {
    const onLongPress = vi.fn()
    const { result } = renderHook(() => useLongPress(onLongPress, 500))

    act(() => {
      result.current.onPointerDown({} as React.PointerEvent)
    })
    act(() => {
      result.current.onPointerUp({} as React.PointerEvent)
    })
    act(() => {
      vi.advanceTimersByTime(600)
    })
    expect(onLongPress).not.toHaveBeenCalled()
  })

  it('does NOT fire onLongPress when pointer leaves before delay', () => {
    const onLongPress = vi.fn()
    const { result } = renderHook(() => useLongPress(onLongPress, 500))

    act(() => {
      result.current.onPointerDown({} as React.PointerEvent)
    })
    act(() => {
      result.current.onPointerLeave({} as React.PointerEvent)
    })
    act(() => {
      vi.advanceTimersByTime(600)
    })
    expect(onLongPress).not.toHaveBeenCalled()
  })

  it('onContextMenu calls preventDefault and fires onLongPress immediately', () => {
    const onLongPress = vi.fn()
    const { result } = renderHook(() => useLongPress(onLongPress, 500))

    const mockEvent = { preventDefault: vi.fn() } as unknown as React.MouseEvent
    act(() => {
      result.current.onContextMenu(mockEvent)
    })
    expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1)
    expect(onLongPress).toHaveBeenCalledTimes(1)
  })

  it('onContextMenu cancels any pending timer before firing onLongPress', () => {
    const onLongPress = vi.fn()
    const { result } = renderHook(() => useLongPress(onLongPress, 500))

    act(() => {
      result.current.onPointerDown({} as React.PointerEvent)
    })
    const mockEvent = { preventDefault: vi.fn() } as unknown as React.MouseEvent
    act(() => {
      result.current.onContextMenu(mockEvent)
    })
    // onLongPress fired once from contextMenu
    expect(onLongPress).toHaveBeenCalledTimes(1)
    // Advance timers — should not fire again
    act(() => {
      vi.advanceTimersByTime(600)
    })
    expect(onLongPress).toHaveBeenCalledTimes(1)
  })
})
