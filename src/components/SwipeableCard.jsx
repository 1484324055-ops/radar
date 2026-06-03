import { useState, useRef } from 'react'
import { hapticMedium } from '../utils/haptics'

export default function SwipeableCard({ children, onSwipeLeft, onSwipeRight, leftLabel, rightLabel, leftColor, rightColor }) {
  const [offsetX, setOffsetX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const [confirmed, setConfirmed] = useState(null) // 'left' | 'right' | null
  const startXRef = useRef(0)
  const threshold = 120 // Much higher threshold to prevent accidental triggers

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX
    setSwiping(true)
  }

  const handleTouchMove = (e) => {
    if (!swiping) return
    const diff = e.touches[0].clientX - startXRef.current
    // Dampen the movement significantly
    setOffsetX(diff * 0.35)
  }

  const handleTouchEnd = () => {
    if (!swiping) return
    setSwiping(false)

    const rawDiff = offsetX / 0.35 // undo dampening
    if (rawDiff < -threshold && onSwipeLeft) {
      hapticMedium()
      setConfirmed('left')
      // Show confirmation state for 800ms before executing
      setTimeout(() => {
        onSwipeLeft()
        setConfirmed(null)
        setOffsetX(0)
      }, 800)
    } else if (rawDiff > threshold && onSwipeRight) {
      hapticMedium()
      setConfirmed('right')
      setTimeout(() => {
        onSwipeRight()
        setConfirmed(null)
        setOffsetX(0)
      }, 800)
    } else {
      setOffsetX(0)
    }
  }

  // Use confirmed state for visual feedback instead of live offset
  const visualOffset = confirmed === 'left' ? -60 : confirmed === 'right' ? 60 : offsetX
  const showLeft = visualOffset < -20
  const showRight = visualOffset > 20

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', marginBottom: '8px' }}>
      {/* Left action (behind card) */}
      {onSwipeLeft && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '100px',
            background: leftColor || 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '0 16px 16px 0',
            opacity: showLeft ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
        >
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>
            {confirmed === 'left' ? '确认删除...' : leftLabel || '删除'}
          </span>
        </div>
      )}

      {/* Right action (behind card) */}
      {onSwipeRight && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '100px',
            background: rightColor || 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '16px 0 0 16px',
            opacity: showRight ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
        >
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>
            {confirmed === 'right' ? '标记完成...' : rightLabel || '完成'}
          </span>
        </div>
      )}

      {/* Card content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${visualOffset}px)`,
          transition: swiping ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          position: 'relative',
          zIndex: 1,
          background: confirmed ? 'var(--bg-tertiary)' : 'var(--bg-card)',
          borderRadius: '16px',
          opacity: confirmed ? 0.8 : 1,
        }}
      >
        {children}
      </div>
    </div>
  )
}
