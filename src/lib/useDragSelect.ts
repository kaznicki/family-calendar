import { useState, useCallback, useRef } from 'react'
import { eachDayOfInterval, parseISO, format, isBefore } from 'date-fns'

export interface DragState {
  startDate: string
  endDate: string
  active: boolean
}

const INITIAL_STATE: DragState = { startDate: '', endDate: '', active: false }
const CLICK_THRESHOLD_PX = 4

interface DragSelectResult {
  dragState: DragState
  handlePointerDown: (e: React.PointerEvent<HTMLElement>, date: string) => void
  handlePointerMove: (e: React.PointerEvent<HTMLElement>, date: string) => void
  handlePointerUp: (e: React.PointerEvent<HTMLElement>) => {
    type: 'click' | 'drag' | 'none'
    startDate: string
    endDate: string
  }
  selectionDates: string[]
}

export function useDragSelect(): DragSelectResult {
  const [dragState, setDragState] = useState<DragState>(INITIAL_STATE)
  const startPosRef = useRef<{ x: number; y: number } | null>(null)

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLElement>, date: string) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    startPosRef.current = { x: e.clientX, y: e.clientY }
    setDragState({ startDate: date, endDate: date, active: true })
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLElement>, date: string) => {
    setDragState(prev => {
      if (!prev.active) return prev
      if (prev.endDate === date) return prev
      document.body.style.userSelect = 'none'
      return { ...prev, endDate: date }
    })
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId)
    document.body.style.userSelect = ''

    const { startDate, endDate } = dragState

    if (!startDate) {
      setDragState(INITIAL_STATE)
      return { type: 'none' as const, startDate: '', endDate: '' }
    }

    // Compute total pointer movement
    const dx = startPosRef.current ? e.clientX - startPosRef.current.x : 0
    const dy = startPosRef.current ? e.clientY - startPosRef.current.y : 0
    const totalMovement = Math.sqrt(dx * dx + dy * dy)
    startPosRef.current = null

    setDragState(INITIAL_STATE)

    if (totalMovement < CLICK_THRESHOLD_PX || startDate === endDate) {
      return { type: 'click' as const, startDate, endDate: startDate }
    }

    // Normalize date order
    const start = isBefore(parseISO(startDate), parseISO(endDate)) ? startDate : endDate
    const end = isBefore(parseISO(startDate), parseISO(endDate)) ? endDate : startDate
    return { type: 'drag' as const, startDate: start, endDate: end }
  }, [dragState])

  // Compute selection dates for highlight during active drag
  const selectionDates: string[] = dragState.active && dragState.startDate && dragState.endDate
    ? eachDayOfInterval({
        start: isBefore(parseISO(dragState.startDate), parseISO(dragState.endDate))
          ? parseISO(dragState.startDate)
          : parseISO(dragState.endDate),
        end: isBefore(parseISO(dragState.startDate), parseISO(dragState.endDate))
          ? parseISO(dragState.endDate)
          : parseISO(dragState.startDate),
      }).map(d => format(d, 'yyyy-MM-dd'))
    : []

  return { dragState, handlePointerDown, handlePointerMove, handlePointerUp, selectionDates }
}
