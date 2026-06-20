import React from 'react'
import { motion } from 'framer-motion'

interface AnimatedTextProps {
  text: string
  className?: string
  /** Delay in seconds before starting */
  delay?: number
  /** Duration per word in seconds */
  wordDuration?: number
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

/**
 * Text reveal animation — words fade + slide in one by one.
 * Used for hero headings on Landing and Dashboard pages.
 */
export function AnimatedText({
  text,
  className = '',
  delay = 0,
  wordDuration = 0.05,
  as: Tag = 'h1',
}: AnimatedTextProps) {
  const words = text.split(' ')

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: wordDuration,
        delayChildren: delay,
      },
    },
  }

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      filter: 'blur(8px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`flex flex-wrap gap-x-[0.3em] ${className}`}
      aria-label={text}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          variants={wordVariants}
          className="inline-block"
        >
          <Tag className="inline">{word}</Tag>
        </motion.span>
      ))}
    </motion.div>
  )
}
