import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Sparkles, Upload, Brain, BookOpen, Zap, ArrowRight, Shield, Target, GraduationCap, Star } from 'lucide-react'
import { GlowButton } from '../components/GlowButton'
import { TiltCard } from '../components/TiltCard'
import { AnimatedCounter } from '../components/AnimatedCounter'

export default function Landing() {
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95])

  const features = [
    {
      icon: Upload,
      title: 'Smart PDF Upload',
      desc: 'Upload lecture notes, papers, and syllabi. Every PDF is automatically chunked, embedded, and indexed for instant retrieval.',
      color: 'from-cyan-400 to-cyan-600',
      glow: 'shadow-cyan-500/20',
    },
    {
      icon: Brain,
      title: 'AI Assistant',
      desc: 'Ask questions about your study materials and get detailed answers with source citations, page numbers, and confidence scores.',
      color: 'from-violet-400 to-violet-600',
      glow: 'shadow-violet-500/20',
    },
    {
      icon: BookOpen,
      title: 'Quiz Generator',
      desc: 'Generate practice quizzes at any difficulty level from your uploaded PDFs. Get instant scoring and detailed explanations.',
      color: 'from-indigo-400 to-indigo-600',
      glow: 'shadow-indigo-500/20',
    },
    {
      icon: Target,
      title: 'Progress Tracking',
      desc: 'Monitor quiz scores, study streaks, and knowledge gaps. Track your improvement over time with detailed analytics.',
      color: 'from-emerald-400 to-emerald-600',
      glow: 'shadow-emerald-500/20',
    },
  ]

  const stats = [
    { label: 'Response Time', value: '<2s', desc: 'Average AI response' },
    { label: 'Citation Rate', value: '100%', desc: 'Source-linked answers' },
    { label: 'Quiz Types', value: '3', desc: 'Difficulty levels' },
    { label: 'File Support', value: 'PDF', desc: 'With auto-chunking' },
  ]

  const techStack = [
    'React + TypeScript',
    'FastAPI + Python',
    'LangChain RAG',
    'ChromaDB Vectors',
    'Gemini AI',
    'Firebase Auth',
  ]

  return (
    <div className="relative z-10">
      {/* ─── Hero Section ─────────────────────────────────── */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center"
      >
        {/* Floating badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur"
        >
          <Star className="h-3.5 w-3.5 text-amber-400" />
          Built for the Open Innovation Hackathon
          <ArrowRight className="h-3 w-3 text-slate-500" />
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6, type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <div className="logo-glow mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-2xl shadow-cyan-500/30">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
        >
          Your AI-Powered{' '}
          <span className="gradient-text">Study Companion</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-6 max-w-2xl text-lg text-slate-300 leading-relaxed sm:text-xl"
        >
          Transform your PDFs into interactive quizzes, get source-linked answers with AI, and track your progress — all in one beautiful workspace.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link to="/register">
            <GlowButton size="lg">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </GlowButton>
          </Link>
          <Link to="/login">
            <GlowButton variant="secondary" size="lg">
              Sign In
            </GlowButton>
          </Link>
        </motion.div>

        {/* Tech stack pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-2"
        >
          {techStack.map((tech, i) => (
            <motion.span
              key={tech}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + i * 0.05, duration: 0.3 }}
              className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-[11px] text-slate-400 backdrop-blur"
            >
              {tech}
            </motion.span>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-xs text-slate-500">Scroll to explore</span>
            <div className="h-8 w-5 rounded-full border border-white/[0.15] p-1">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="h-2 w-2 rounded-full bg-cyan-400"
              />
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ─── Features Section ─────────────────────────────── */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300 mb-3">Features</p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Everything you need to{' '}
              <span className="gradient-text">study smarter</span>
            </h2>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              Powered by Retrieval-Augmented Generation and Gemini AI, every answer is verified and traceable to your source materials.
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <TiltCard className={`rounded-[1.75rem] border border-white/[0.08] bg-white/[0.04] p-8 backdrop-blur-xl shadow-xl ${feature.glow}`}>
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-300">{feature.desc}</p>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats Section ─────────────────────────────────── */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <div className="gradient-border">
              <div className="rounded-[1.75rem] border border-white/[0.06] bg-[#0c1829]/60 p-8 backdrop-blur-2xl sm:p-12">
                <div className="text-center mb-10">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300 mb-3">By the numbers</p>
                  <h2 className="text-3xl font-bold text-white sm:text-4xl">
                    Built for <span className="gradient-text">performance</span>
                  </h2>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                      className="text-center"
                    >
                      <div className="text-4xl font-bold gradient-text">{stat.value}</div>
                      <p className="mt-2 text-sm font-semibold text-white">{stat.label}</p>
                      <p className="mt-1 text-xs text-slate-400">{stat.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works ──────────────────────────────────── */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300 mb-3">How it works</p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Three steps to{' '}
              <span className="gradient-text">smarter studying</span>
            </h2>
          </motion.div>

          <div className="space-y-8">
            {[
              { step: '01', title: 'Upload Your Materials', desc: 'Drag and drop your PDFs — lecture notes, papers, syllabi. Each document is automatically chunked, embedded, and indexed in ChromaDB for instant retrieval.', icon: Upload },
              { step: '02', title: 'Ask & Learn', desc: 'Ask any question about your materials. The AI retrieves the most relevant chunks, generates a detailed answer, and shows you the exact source pages and confidence scores.', icon: Brain },
              { step: '03', title: 'Practice & Improve', desc: 'Generate custom quizzes at easy, medium, or hard difficulty. Get instant scoring, detailed explanations for every question, and track your improvement over time.', icon: GraduationCap },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 border border-white/[0.08]">
                    <span className="text-lg font-bold gradient-text">{item.step}</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <item.icon className="h-5 w-5 text-cyan-300" />
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ───────────────────────────────────── */}
      <section className="relative px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <div className="gradient-border">
              <div className="rounded-[1.75rem] border border-white/[0.06] bg-[#0c1829]/60 p-12 backdrop-blur-2xl">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="logo-glow mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-2xl shadow-cyan-500/30 mb-6"
                >
                  <Sparkles className="h-8 w-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Ready to <span className="gradient-text">ace your exams</span>?
                </h2>
                <p className="mt-4 text-slate-300">
                  Join EduGenie AI and transform the way you study. It&apos;s free to get started.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Link to="/register">
                    <GlowButton size="lg">
                      Start Studying Now
                      <ArrowRight className="h-4 w-4" />
                    </GlowButton>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-8 px-4">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-400">EduGenie AI</span>
          </div>
          <p className="text-xs text-slate-500">
            Built with ❤️ for the Open Innovation Hackathon
          </p>
        </div>
      </footer>
    </div>
  )
}
