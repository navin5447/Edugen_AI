import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Brain, Flame, GraduationCap, Sparkles, Upload, Zap } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { QuizStats } from '../types/quiz'
import { AnimatedCounter } from '../components/AnimatedCounter'
import { EmptyState } from '../components/EmptyState'
import { GlassCard, MetricPill, PageHero, SectionHeading } from '../components/AppShell'
import { DashboardSkeleton } from '../components/PageSkeleton'
import { TiltCard } from '../components/TiltCard'
import { StaggerContainer } from '../components/StaggerContainer'


type UploadedItem = {
  id: string
  title: string
  category: string
  filename: string
  size_bytes: number
  page_count?: number
  chunk_count?: number
  created_at: string
}

export default function Dashboard() {
  const { user, backendVerified } = useAuth()
  const [quizStats, setQuizStats] = useState<QuizStats>({ total_quizzes_completed: 0, average_score: 0, total_attempts: 0 })
  const [uploads, setUploads] = useState<UploadedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/quiz/stats'), api.get('/uploads/files')])
      .then(([statsResponse, uploadsResponse]) => {
        setQuizStats(statsResponse.data)
        setUploads(uploadsResponse.data.items ?? [])
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false))
  }, [])

  const recentUploads = uploads.slice(0, 3)
  const totalPages = useMemo(() => uploads.reduce((sum, item) => sum + (item.page_count ?? 0), 0), [uploads])
  const totalChunks = useMemo(() => uploads.reduce((sum, item) => sum + (item.chunk_count ?? 0), 0), [uploads])

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="AI study workspace"
        title={`Welcome back, ${user?.displayName ?? 'Student'}`}
        description="Upload PDFs, ask questions, generate quizzes, and follow source-linked answers inside a polished study cockpit built like a modern SaaS product."
        cta={
          <div className="grid gap-3 sm:grid-cols-2">
            <Link to="/uploads">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-white/10 transition"
              >
                <Upload className="h-4 w-4" /> Upload PDF
              </motion.div>
            </Link>
            <Link to="/assistant">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.12]"
              >
                <Brain className="h-4 w-4" /> Ask Assistant
              </motion.div>
            </Link>
          </div>
        }
        metrics={[
          { label: 'Backend', value: backendVerified ? 'Verified' : 'Pending', hint: 'Auth session state', icon: <Sparkles className="h-4 w-4" /> },
          { label: 'Quiz score', value: `${Math.round(quizStats.average_score)}%`, hint: `${quizStats.total_quizzes_completed} completed quizzes`, icon: <GraduationCap className="h-4 w-4" /> },
          { label: 'Uploads', value: `${uploads.length}`, hint: `${totalPages} pages processed`, icon: <Upload className="h-4 w-4" /> },
          { label: 'Chunks', value: `${totalChunks}`, hint: 'Indexed for retrieval', icon: <BookOpen className="h-4 w-4" /> },
        ]}
      />

      <StaggerContainer className="grid gap-4 xl:grid-cols-[1.5fr_1fr]" delay={0.3}>
        <GlassCard className="p-6">
          <SectionHeading title="Progress widgets" subtitle="A quick snapshot of your study momentum" />
          <div className="grid gap-4 sm:grid-cols-3">
            <TiltCard className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 backdrop-blur">
              <MetricPill label="Study streak" value="12 days" icon={<Flame className="h-4 w-4" />} />
            </TiltCard>
            <TiltCard className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 backdrop-blur">
              <MetricPill label="Average score" value={`${Math.round(quizStats.average_score)}%`} icon={<Zap className="h-4 w-4" />} />
            </TiltCard>
            <TiltCard className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 backdrop-blur">
              <MetricPill label="Documents" value={`${uploads.length}`} icon={<BookOpen className="h-4 w-4" />} />
            </TiltCard>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <motion.div
              whileHover={{ y: -3 }}
              className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur"
            >
              <p className="text-sm text-slate-400">Quiz attempts</p>
              <div className="mt-3 text-4xl font-bold text-white">
                <AnimatedCounter value={quizStats.total_attempts} />
              </div>
              <p className="mt-2 text-sm text-slate-400">Track how often you practice with generated quizzes.</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -3 }}
              className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur"
            >
              <p className="text-sm text-slate-400">Pages processed</p>
              <div className="mt-3 text-4xl font-bold text-white">
                <AnimatedCounter value={totalPages} />
              </div>
              <p className="mt-2 text-sm text-slate-400">Every uploaded PDF becomes searchable study material.</p>
            </motion.div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionHeading title="Quick actions" subtitle="Jump straight into the core workflows" />
          <div className="grid gap-3">
            {[
              { to: '/uploads', label: 'Upload PDFs', desc: 'Index lecture notes and papers', icon: Upload },
              { to: '/assistant', label: 'Ask the assistant', desc: 'Get answers with citations', icon: Brain },
              { to: '/quiz', label: 'Generate quiz', desc: 'Practice by difficulty and length', icon: BookOpen },
            ].map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.to} to={action.to}>
                  <motion.div
                    whileHover={{ y: -3, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="group rounded-3xl border border-white/[0.08] bg-white/[0.04] p-4 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.06] text-cyan-300 transition group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-cyan-400/20 group-hover:to-violet-500/20">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{action.label}</div>
                        <div className="text-sm text-slate-400">{action.desc}</div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </GlassCard>
      </StaggerContainer>

      <StaggerContainer className="grid gap-4 xl:grid-cols-2" delay={0.5}>
        <GlassCard className="p-6">
          <SectionHeading title="Recent uploads" subtitle="Your latest indexed documents" action={<Link to="/uploads" className="text-sm text-cyan-300 hover:text-cyan-200 transition">View all</Link>} />
          {recentUploads.length === 0 ? (
            <EmptyState title="No uploads yet" description="Upload your first PDF to unlock AI search, citations, and quiz generation." icon="upload" />
          ) : (
            <div className="space-y-3">
              {recentUploads.map((item) => (
                <motion.div key={item.id} whileHover={{ y: -3, scale: 1.01 }} className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur transition">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-white">{item.title}</div>
                      <div className="text-sm text-slate-400">{item.filename} · {item.category}</div>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <div>{item.page_count ?? 0} pages</div>
                      <div>{item.chunk_count ?? 0} chunks</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <SectionHeading title="Recent quizzes" subtitle="Review your practice activity" action={<Link to="/quiz" className="text-sm text-cyan-300 hover:text-cyan-200 transition">Start quiz</Link>} />
          {quizStats.total_quizzes_completed === 0 ? (
            <EmptyState title="No quizzes completed" description="Generate a quiz from your uploads to see score trends here." icon="book" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <motion.div whileHover={{ y: -3 }} className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur">
                <p className="text-sm text-slate-400">Completed</p>
                <p className="mt-2 text-3xl font-bold text-white"><AnimatedCounter value={quizStats.total_quizzes_completed} /></p>
              </motion.div>
              <motion.div whileHover={{ y: -3 }} className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur">
                <p className="text-sm text-slate-400">Average score</p>
                <p className="mt-2 text-3xl font-bold text-white"><AnimatedCounter value={Math.round(quizStats.average_score)} suffix="%" /></p>
              </motion.div>
            </div>
          )}
        </GlassCard>
      </StaggerContainer>
    </div>
  )
}
