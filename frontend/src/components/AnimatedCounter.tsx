import { motion, useMotionValueEvent, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

export function AnimatedCounter({ value, suffix = '', className = '' }: { value: number; suffix?: string; className?: string }) {
  const spring = useSpring(0, { stiffness: 80, damping: 20 })
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString())
  const [text, setText] = useState('0')

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  useMotionValueEvent(display, 'change', (latest) => {
    setText(latest)
  })

  return (
    <motion.span className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      {text}
      {suffix}
    </motion.span>
  )
}
