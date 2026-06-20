import React from 'react'

/**
 * CSS-only animated particle field. Renders via a single element
 * with box-shadow pseudo-elements — zero JS overhead, locked 60fps.
 */
export function ParticleField() {
  return <div className="particle-field" aria-hidden="true" />
}
