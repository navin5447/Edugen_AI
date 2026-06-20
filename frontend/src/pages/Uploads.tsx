import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Brain, Upload, Zap } from 'lucide-react'
import api from '../services/api'
import { PageHero, GlassCard, SectionHeading } from '../components/AppShell'
import { EmptyState } from '../components/EmptyState'
import { StaggerContainer } from '../components/StaggerContainer'
import { GlowButton } from '../components/GlowButton'

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

export default function Uploads() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('notes')
  const [items, setItems] = useState<UploadedItem[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [progress, setProgress] = useState(0)

  const loadItems = async () => {
    const response = await api.get('/uploads/files')
    setItems(response.data.items ?? [])
  }

  useEffect(() => {
    loadItems().catch((loadError) => {
      console.error(loadError)
      setError('Could not load uploads')
    })
  }, [])

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      setError('Add a title and select a PDF before uploading')
      return
    }

    setBusy(true)
    setError('')
    setSuccess('')
    setProgress(0)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('title', title)
      formData.append('category', category)

      await api.post('/uploads/pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (!event.total) return
          setProgress(Math.round((event.loaded * 100) / event.total))
        }
      })
      setFile(null)
      setTitle('')
      setSuccess('PDF uploaded and indexed successfully')
      await loadItems()
    } catch (uploadError: any) {
      console.error('Upload error:', uploadError)
      const errorMsg = uploadError?.response?.data?.detail || uploadError?.message || 'Upload failed'
      setError(`Upload failed: ${errorMsg}`)
    } finally {
      setBusy(false)
    }
  }

  const totalPages = items.reduce((sum, item) => sum + (item.page_count ?? 0), 0)
  const totalChunks = items.reduce((sum, item) => sum + (item.chunk_count ?? 0), 0)

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Knowledge ingestion"
        title="Upload PDF Documents"
        description="Index your lecture notes, papers, and study materials. Each file is chunked, embedded locally, and stored for instant retrieval, citations, and quiz generation."
        cta={
          <Link to="/assistant">
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.12]"
            >
              <Brain className="h-4 w-4" /> Ask Assistant
            </motion.div>
          </Link>
        }
        metrics={[
          { label: 'File types', value: 'PDF', hint: 'Supported format', icon: <BookOpen className="h-4 w-4" /> },
          { label: 'Total pages', value: `${totalPages}`, hint: 'Indexed documents', icon: <Upload className="h-4 w-4" /> },
          { label: 'Chunks', value: `${totalChunks}`, hint: 'Embedded vectors', icon: <Zap className="h-4 w-4" /> },
          { label: 'Citations', value: 'Enabled', hint: 'With confidence scores', icon: <BookOpen className="h-4 w-4" /> },
        ]}
      />

      <StaggerContainer className="grid gap-4 xl:grid-cols-[2fr_1fr]" delay={0.3}>
        <GlassCard className="p-6">
          <SectionHeading title="Upload new document" subtitle="Add PDFs to your knowledge base" />
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title"
                className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-white placeholder:text-slate-500 backdrop-blur transition-all focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/10 md:col-span-2"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-white backdrop-blur transition-all focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/10"
              >
                <option value="notes">Notes</option>
                <option value="syllabus">Syllabus</option>
                <option value="question-papers">Question Papers</option>
              </select>
            </div>

            <motion.label
              whileHover={{ scale: 1.01 }}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-12 transition-all ${
                file
                  ? 'border-cyan-400/40 bg-cyan-400/[0.05]'
                  : 'border-white/[0.12] hover:border-cyan-400/30 drop-zone-pulse'
              }`}
            >
              <motion.div
                animate={file ? {} : { y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Upload className="h-8 w-8 text-cyan-300" />
              </motion.div>
              <span className="mt-3 text-sm font-medium text-white">
                {file ? file.name : 'Drag and drop or choose a PDF'}
              </span>
              <span className="mt-1 text-xs text-slate-400">
                {file ? `${(file.size / 1024).toFixed(0)} KB` : 'Maximum file size: 50MB'}
              </span>
              <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </motion.label>

            {busy ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Upload progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-2 rounded-full progress-gradient"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            ) : null}

            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.08] px-4 py-3 text-sm text-emerald-300 flex items-center gap-2"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {success}
              </motion.div>
            ) : null}

            {error ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300 flex items-center gap-2"
              >
                <span className="h-2 w-2 rounded-full bg-red-400" />
                {error}
              </motion.div>
            ) : null}

            <GlowButton
              disabled={busy}
              onClick={handleUpload}
              className="w-full"
              size="lg"
            >
              {busy ? '✨ Uploading & Indexing...' : 'Upload PDF'}
            </GlowButton>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <SectionHeading title="Upload tips" subtitle="Best practices" />
          <div className="space-y-4 text-sm text-slate-400">
            {[
              { emoji: '📚', title: 'Format PDFs', desc: 'Clear titles and organized content improve chunk quality.' },
              { emoji: '🔍', title: 'Readable text', desc: 'Scanned PDFs without OCR may not embed correctly.' },
              { emoji: '⚡', title: 'Instant indexing', desc: 'Every upload is immediately available for search and quizzes.' },
            ].map((tip, i) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
              >
                <p className="font-semibold text-white">{tip.emoji} {tip.title}</p>
                <p>{tip.desc}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </StaggerContainer>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <GlassCard className="p-6">
          <SectionHeading title="Your documents" subtitle={`${items.length} PDF${items.length !== 1 ? 's' : ''} indexed`} action={<Link to="/assistant" className="text-sm text-cyan-300 hover:text-cyan-200 transition">Search all</Link>} />
          {items.length === 0 ? (
            <EmptyState title="No documents uploaded" description="Upload your first PDF to unlock AI search, citations, and quiz generation." icon="upload" />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.05, duration: 0.4 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-5 backdrop-blur transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">{item.title}</div>
                      <div className="mt-1 text-xs text-slate-400">{item.filename}</div>
                      <div className="mt-2 flex gap-3 text-xs text-slate-500">
                        <span>{item.page_count ?? 0} pages</span>
                        <span>•</span>
                        <span>{item.chunk_count ?? 0} chunks</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="rounded-lg bg-cyan-400/10 px-2 py-1 text-xs font-semibold text-cyan-300">{item.category}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  )
}