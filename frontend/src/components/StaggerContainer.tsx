import React from 'react'
import { motion } from 'framer-motion'

interface StaggerContainerProps {
  children: React.ReactNode
  className?: string
  /** Delay between each child in seconds */
  staggerDelay?: number
  /** Initial delay before animation starts */
  delay?: number
  /** Direction of entrance */
  direction?: 'up' | 'down' | 'left' | 'right'
}

/**
 * Wrapper that staggers children entrance animations.
 * Configurable delay, direction, and easing.
 */
export function StaggerContainer({
  children,
  className = '',
  staggerDelay = 0.08,
  delay = 0,
  direction = 'up',
}: StaggerContainerProps) {
  const directionOffset = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { y: 0, x: 30 },
    right: { y: 0, x: -30 },
  }

  const offset = directionOffset[direction]

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  }

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: offset.y,
      x: offset.x,
      filter: 'blur(8px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

/**
 * Individual stagger item — use inside StaggerContainer for manual control.
 */
export function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
        visible: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
