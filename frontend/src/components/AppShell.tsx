import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookOpen,
  Brain,
  LayoutDashboard,
  LogOut,
  Upload,
  Sparkles,
  Network,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ParticleField } from './ParticleField'
import { FloatingOrbs } from './FloatingOrbs'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/uploads', label: 'Uploads', icon: Upload },
  { to: '/assistant', label: 'Assistant', icon: Brain },
  { to: '/quiz', label: 'Quiz', icon: BookOpen },
  { to: '/graph', label: 'Concept Map', icon: Network },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const { user, signOut, backendVerified } = useAuth()

  // Don't show shell on landing, login, register pages
  const isAuthPage = ['/login', '/register', '/'].includes(pathname)
  if (isAuthPage && !user) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#08111f] text-white">
        <ParticleField />
        <FloatingOrbs />
        <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:72px_72px]" />
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(12px)' }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08111f] text-white">
      {/* Atmospheric backgrounds */}
      <ParticleField />
      <FloatingOrbs />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.14),_transparent_32%),radial-gradient(circle_at_80%_20%,_rgba(168,85,247,0.16),_transparent_28%),linear-gradient(180deg,_#08111f_0%,_#0b1524_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:72px_72px]" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#08111f]/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link to="/dashboard" className="group flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className="logo-glow flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-lg shadow-cyan-500/20"
            >
              <Sparkles className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <div className="text-sm font-bold tracking-[0.24em] text-cyan-200 uppercase">EduGenie AI</div>
              <div className="text-[11px] text-slate-400">AI study workspace</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] p-1 shadow-2xl shadow-black/20 backdrop-blur-xl md:flex">
            {navItems.map((item, index) => {
              const Icon = item.icon
              const active = pathname === item.to
              return (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Link
                    to={item.to}
                    className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                      active
                        ? 'bg-white text-slate-900 shadow-lg shadow-white/10'
                        : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {active && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-0 rounded-full bg-white"
                        style={{ zIndex: -1 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] text-slate-400 sm:block">
              {backendVerified ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Pending
                </span>
              )}
            </div>
            <div className="hidden text-right sm:block">
              <div className="text-sm font-medium text-white">{user?.displayName ?? 'Student'}</div>
              <div className="text-[11px] text-slate-400">{user?.email ?? ''}</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8 md:hidden">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
                  active
                    ? 'border-white bg-white text-slate-900'
                    : 'border-white/[0.08] bg-white/[0.04] text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(12px)' }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

/* ─── Shared Layout Components ─────────────────────── */

export function PageHero({
  eyebrow,
  title,
  description,
  cta,
  metrics,
}: {
  eyebrow?: string
  title: string
  description: string
  cta?: React.ReactNode
  metrics?: Array<{ label: string; value: string; hint?: string; icon?: React.ReactNode }>
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.04] p-6 shadow-2xl shadow-cyan-950/10 backdrop-blur-xl sm:p-8 gradient-border shimmer"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_35%,rgba(255,255,255,0.03)_75%)]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300"
            >
              {eyebrow}
            </motion.p>
          ) : null}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            {title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg"
          >
            {description}
          </motion.p>
        </div>
        {cta ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="relative"
          >
            {cta}
          </motion.div>
        ) : null}
      </div>
      {metrics?.length ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="relative mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + i * 0.08, duration: 0.4 }}
              className="rounded-3xl border border-white/[0.08] bg-white/[0.06] p-4 shadow-lg shadow-black/10 backdrop-blur"
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-sm">{metric.label}</span>
                {metric.icon}
              </div>
              <div className="mt-3 text-3xl font-bold text-white">{metric.value}</div>
              {metric.hint ? <p className="mt-1 text-xs text-slate-400">{metric.hint}</p> : null}
            </motion.div>
          ))}
        </motion.div>
      ) : null}
    </motion.section>
  )
}

export function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[1.75rem] border border-white/[0.08] bg-white/[0.04] shadow-2xl shadow-slate-950/25 backdrop-blur-xl ${className}`}>
      {children}
    </div>
  )
}

export function SectionHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold text-white sm:text-xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-400">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  )
}

export function MetricPill({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 backdrop-blur">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.08] text-cyan-300">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </div>
  )
}
