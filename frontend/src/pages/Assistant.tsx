import React, { useEffect, useState, type ChangeEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Lightbulb, Sparkles, Upload, Send } from 'lucide-react'
import api from '../services/api'
import { PageHero, GlassCard, SectionHeading } from '../components/AppShell'
import { EmptyState } from '../components/EmptyState'
import { GlowButton } from '../components/GlowButton'
import { StaggerContainer } from '../components/StaggerContainer'

type ChatItem = {
  id: string
  question: string
  answer: string
  sources?: Array<{
    chunk_id: string
    file_id?: string
    file_name: string
    page_number?: number | null
    score: number
    confidence?: number
    source_url?: string | null
  }>
  created_at: string
}

export default function Assistant() {
  const [searchParams] = useSearchParams()
  const [message, setMessage] = useState(searchParams.get('q') || '')
  const [reply, setReply] = useState('')
  const [sources, setSources] = useState<Array<{ chunk_id: string; file_id?: string; file_name: string; page_number?: number | null; score: number; confidence?: number; source_url?: string | null }>>([])
  const [history, setHistory] = useState<ChatItem[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const loadHistory = async () => {
    const response = await api.get('/assistant/history')
    setHistory(response.data.items ?? [])
  }

  useEffect(() => {
    loadHistory().catch((loadError) => {
      console.error(loadError)
      setError('Could not load chat history')
    })
  }, [])

  const handleAsk = async () => {
    if (!message.trim()) {
      setError('Type a question first')
      return
    }

    setBusy(true)
    setError('')
    try {
      const response = await api.post('/assistant/chat', { message })
      setReply(response.data.answer ?? response.data.reply)
      setSources(response.data.sources ?? [])
      setMessage('')
      await loadHistory()
    } catch (chatError) {
      console.error(chatError)
      setError('Chat request failed')
    } finally {
      setBusy(false)
    }
  }

  const openSource = async (source: { file_id?: string; file_name: string }) => {
    if (!source.file_id) return
    try {
      const response = await api.get(`/uploads/file/${source.file_id}`, { responseType: 'blob' })
      const fileUrl = URL.createObjectURL(response.data)
      window.open(fileUrl, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(fileUrl), 60_000)
    } catch (sourceError) {
      console.error(sourceError)
      setError(`Could not open source file: ${source.file_name}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Source-linked answers"
        title="Ask Your Study Material"
        description="Every response includes the documents, pages, and confidence scores behind the answer so you can verify the source instantly and cite in your assignments."
        cta={
          <Link to="/uploads">
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.12]"
            >
              <Upload className="h-4 w-4" /> Upload More
            </motion.div>
          </Link>
        }
        metrics={[
          { label: 'RAG mode', value: 'Enabled', hint: 'Retrieval-augmented', icon: <Brain className="h-4 w-4" /> },
          { label: 'Citations', value: 'Visible', hint: 'In every answer', icon: <Sparkles className="h-4 w-4" /> },
          { label: 'Confidence', value: 'Scored', hint: 'Per source chunk', icon: <Lightbulb className="h-4 w-4" /> },
          { label: 'Explainability', value: 'Full', hint: 'Document verified', icon: <Sparkles className="h-4 w-4" /> },
        ]}
      />

      <StaggerContainer className="grid gap-4 xl:grid-cols-[2fr_1fr]" delay={0.3}>
        <div className="space-y-4">
          <GlassCard className="p-6">
            <SectionHeading title="Chat" subtitle="Ask questions about your uploaded materials" />
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={4}
                  placeholder="What would you like to know about your study materials?"
                  className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 pr-12 text-white placeholder:text-slate-500 backdrop-blur transition-all focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/10 resize-none"
                />
                <button
                  onClick={handleAsk}
                  disabled={busy}
                  className="absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-white transition hover:scale-110 disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

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

              {busy ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                    <span className="text-sm text-slate-400">Thinking and retrieving sources...</span>
                  </div>
                </motion.div>
              ) : null}

              <div className="flex gap-3">
                <GlowButton
                  disabled={busy}
                  onClick={handleAsk}
                  className="flex-1"
                >
                  {busy ? 'Thinking...' : 'Ask AI'}
                </GlowButton>
                <Link to="/uploads" className="flex items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-3 transition hover:bg-white/[0.08]">
                  <Upload className="h-4 w-4 text-slate-300" />
                </Link>
              </div>
            </div>
          </GlassCard>

          {reply ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard className="border-cyan-400/10 p-6">
                <SectionHeading title="Answer" subtitle="Generated from your uploaded study material" />
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-sm leading-relaxed text-slate-200">
                  {reply}
                </div>
              </GlassCard>
            </motion.div>
          ) : null}

          {sources.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <GlassCard className="p-6">
                <SectionHeading title="Sources" subtitle={`${sources.length} chunk${sources.length !== 1 ? 's' : ''} retrieved`} />
                <div className="grid gap-3 md:grid-cols-2">
                  {sources.map((source, i) => (
                    <motion.button
                      key={source.chunk_id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                      whileHover={{ y: -3, scale: 1.01 }}
                      type="button"
                      onClick={() => void openSource(source)}
                      className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 text-left transition hover:border-cyan-400/20 hover:bg-white/[0.06]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-white">📄 {source.file_name}</div>
                          <div className="mt-2 space-y-1 text-xs text-slate-400">
                            <div>{source.page_number ? `Page ${source.page_number}` : 'Page unavailable'}</div>
                            <div className="text-slate-500">Chunk: {source.chunk_id}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="rounded-lg bg-cyan-400/10 px-2 py-1 text-xs font-bold text-cyan-300">
                            {(source.confidence ?? 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ) : null}
        </div>

        <GlassCard className="h-fit p-6">
          <SectionHeading title="Chat history" subtitle={`${history.length} conversation${history.length !== 1 ? 's' : ''}`} />
          {history.length === 0 ? (
            <EmptyState title="No chat history" description="Ask your first question to start building history." icon="book" />
          ) : (
            <div className="space-y-3">
              {history.slice(0, 5).map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05, duration: 0.4 }}
                  whileHover={{ x: 3 }}
                  type="button"
                  className="block w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3 text-left transition hover:bg-white/[0.06]"
                >
                  <p className="truncate text-sm font-semibold text-white">{item.question}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">{item.answer}</p>
                  {item.sources && item.sources.length > 0 ? (
                    <p className="mt-2 text-xs text-cyan-300">{item.sources.length} source{item.sources.length !== 1 ? 's' : ''}</p>
                  ) : null}
                </motion.button>
              ))}
            </div>
          )}
        </GlassCard>
      </StaggerContainer>
    </div>
  )
}
