import React, { useRef, useCallback } from 'react'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  tiltMax?: number
  glare?: boolean
}

/**
 * Mouse-tracking 3D tilt card using CSS perspective transforms.
 * Includes an optional shine/glare overlay that follows the cursor.
 */
export function TiltCard({ children, className = '', tiltMax = 8, glare = true }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -tiltMax
    const rotateY = ((x - centerX) / centerX) * tiltMax

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`

    if (glare) {
      const shineX = (x / rect.width) * 100
      const shineY = (y / rect.height) * 100
      card.style.setProperty('--shine-x', `${shineX}%`)
      card.style.setProperty('--shine-y', `${shineY}%`)
    }
  }, [tiltMax, glare])

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  }, [])

  return (
    <div className="perspective-container">
      <div
        ref={cardRef}
        className={`tilt-card ${className}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {glare && <div className="tilt-shine" />}
        {children}
      </div>
    </div>
  )
}
