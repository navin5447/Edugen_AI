import React from 'react'

/**
 * Large, blurred gradient orbs that float across the viewport.
 * Pure CSS animation — creates depth and a "living interface" feel.
 */
export function FloatingOrbs() {
  return (
    <div className="floating-orbs" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
    </div>
  )
}
