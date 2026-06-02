import { useState, useRef } from 'react'
import { hapticLight } from '../utils/haptics'

export default function SwipeableCard({ children, onSwipeLeft, onSwipeRight, leftLabel, rightLabel, leftColor, rightColor }) {
  const [offsetX, setOffsetX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const startXRef = useRef(0)
  const threshold = 80

  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX
    setSwiping(true)
  }

  const handleTouchMove = (e) => {
    if (!swiping) return
    const diff = e.touches[0].clientX - startXRef.current
    // Dampen the movement
    setOffsetX(diff * 0.5)
  }

  const handleTouchEnd = () => {
    if (!swiping) return
    setSwiping(false)

    const rawDiff = offsetX / 0.5 // undo dampening
    if (rawDiff < -threshold && onSwipeLeft) {
      hapticLight()
      onSwipeLeft()
    } else if (rawDiff > threshold && onSwipeRight) {
      hapticLight()
      onSwipeRight()
    }
    setOffsetX(0)
  }

  const showLeft = offsetX < -20
  const showRight = offsetX > 20

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
            width: '80px',
            background: leftColor || 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '0 16px 16px 0',
            opacity: showLeft ? 1 : 0,
            transition: 'opacity 0.15s',
          }}
        >
          <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{leftLabel || '删除'}</span>
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
            width: '80px',
            background: rightColor || 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '16px 0 0 16px',
            opacity: showRight ? 1 : 0,
            transition: 'opacity 0.15s',
          }}
        >
          <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>{rightLabel || '完成'}</span>
        </div>
      )}

      {/* Card content */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: swiping ? 'none' : 'transform 0.2s ease-out',
          position: 'relative',
          zIndex: 1,
          background: 'var(--bg-card)',
          borderRadius: '16px',
        }}
      >
        {children}
      </div>
    </div>
  )
}
