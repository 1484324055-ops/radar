import { useState, useRef, useCallback } from 'react'
import { hapticMedium } from '../utils/haptics'

const ACTIVATION_THRESHOLD = 20
const SWIPE_THRESHOLD = 100
const DAMPENING = 0.4

export default function SwipeableCard({ children, onSwipeLeft, onSwipeRight, leftLabel, rightLabel, leftColor, rightColor }) {
  const [offsetX, setOffsetX] = useState(0)
  const [confirmed, setConfirmed] = useState(null)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const lockedRef = useRef(null) // null | 'h' | 'v'

  const handleTouchStart = useCallback((e) => {
    startXRef.current = e.touches[0].clientX
    startYRef.current = e.touches[0].clientY
    lockedRef.current = null
  }, [])

  const handleTouchMove = useCallback((e) => {
    const dx = e.touches[0].clientX - startXRef.current
    const dy = e.touches[0].clientY - startYRef.current
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    // Direction not yet locked
    if (lockedRef.current === null) {
      if (absDx < ACTIVATION_THRESHOLD && absDy < ACTIVATION_THRESHOLD) return
      if (absDy > absDx) {
        lockedRef.current = 'v'
        return
      }
      lockedRef.current = 'h'
    }

    // Vertical: let browser scroll
    if (lockedRef.current === 'v') return

    // Horizontal: prevent scroll, apply offset
    e.preventDefault()
    setOffsetX(dx * DAMPENING)
  }, [])

  const handleTouchEnd = useCallback(() => {
    const rawDiff = offsetX / DAMPENING

    if (lockedRef.current === 'h' && Math.abs(rawDiff) > SWIPE_THRESHOLD) {
      if (rawDiff < 0 && onSwipeLeft) {
        hapticMedium()
        setConfirmed('left')
        setTimeout(() => { onSwipeLeft(); setConfirmed(null); setOffsetX(0) }, 800)
      } else if (rawDiff > 0 && onSwipeRight) {
        hapticMedium()
        setConfirmed('right')
        setTimeout(() => { onSwipeRight(); setConfirmed(null); setOffsetX(0) }, 800)
      } else {
        setOffsetX(0)
      }
    } else {
      setOffsetX(0)
    }

    lockedRef.current = null
  }, [offsetX, onSwipeLeft, onSwipeRight])

  const visualOffset = confirmed === 'left' ? -60 : confirmed === 'right' ? 60 : offsetX
  const showLeft = visualOffset < -20
  const showRight = visualOffset > 20

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', marginBottom: '8px' }}>
      {onSwipeLeft && (
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '100px',
          background: leftColor || 'var(--danger)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '0 16px 16px 0',
          opacity: showLeft ? 1 : 0, transition: 'opacity 0.15s',
        }}>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>
            {confirmed === 'left' ? '确认删除...' : leftLabel || '删除'}
          </span>
        </div>
      )}
      {onSwipeRight && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: '100px',
          background: rightColor || 'var(--success)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '16px 0 0 16px',
          opacity: showRight ? 1 : 0, transition: 'opacity 0.15s',
        }}>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>
            {confirmed === 'right' ? '标记完成...' : rightLabel || '完成'}
          </span>
        </div>
      )}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${visualOffset}px)`,
          transition: lockedRef.current === 'h' ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          position: 'relative',
          zIndex: 1,
          background: confirmed ? 'var(--bg-tertiary)' : 'var(--bg-card)',
          borderRadius: '16px',
          opacity: confirmed ? 0.8 : 1,
          touchAction: 'pan-y',
        }}
      >
        {children}
      </div>
    </div>
  )
}
