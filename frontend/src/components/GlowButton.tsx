import React from 'react'
import { motion } from 'framer-motion'

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'default' | 'lg'
  className?: string
}

/**
 * Premium button with animated gradient border glow.
 * Hover state with expanding glow radius and subtle scale.
 */
export function GlowButton({
  children,
  variant = 'primary',
  size = 'default',
  className = '',
  ...props
}: GlowButtonProps) {
  const baseClasses = 'relative inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50'

  const sizeClasses = size === 'lg'
    ? 'px-8 py-4 text-base'
    : 'px-6 py-3 text-sm'

  const variantClasses = variant === 'primary'
    ? 'bg-gradient-to-r from-cyan-400 via-violet-500 to-indigo-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40'
    : 'border border-white/20 bg-white/[0.06] text-white backdrop-blur-xl hover:bg-white/[0.12] hover:border-white/30'

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {variant === 'primary' && (
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-indigo-500 opacity-0 blur-xl transition-opacity duration-300 hover:opacity-30 group-hover:opacity-30" />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  )
}
