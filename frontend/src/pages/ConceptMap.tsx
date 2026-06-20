import React, { useEffect, useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Network,
  Brain,
  BookOpen,
  ArrowRight,
  Sparkles,
  X,
  RefreshCw,
  Play,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import api from '../services/api'
import { PageHero, GlassCard, SectionHeading } from '../components/AppShell'
import { EmptyState } from '../components/EmptyState'
import { GlowButton } from '../components/GlowButton'

type UploadedItem = {
  id: string
  title: string
  category: string
  filename: string
}

interface Node {
  id: string
  label: string
  val: number
  description: string
  subject: string
  x: number
  y: number
  vx: number
  vy: number
}

interface Link {
  source: string
  target: string
  label: string
}

interface GraphData {
  nodes: Node[]
  links: Link[]
}

interface QuizQuestion {
  question: str
  options: string[]
  correct_answer: string
  explanation: string
}

export default function ConceptMap() {
  const navigate = useNavigate()
  const [uploads, setUploads] = useState<UploadedItem[]>([])
  const [selectedFileId, setSelectedFileId] = useState<string>('workspace')
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingError, setLoadingError] = useState('')
  const [uploadsError, setUploadsError] = useState('')
  
  // Physics simulation state
  const [simulatedNodes, setSimulatedNodes] = useState<Node[]>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  
  // Drag state
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null)
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const dragStartPos = useRef<{ x: number; y: number } | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)

  // Quiz Modal State
  const [quizModalOpen, setQuizModalOpen] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
  const [quizLoading, setQuizLoading] = useState(false)
  const [quizError, setQuizError] = useState('')
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({})
  const [quizFinished, setQuizFinished] = useState(false)

  // Dimensions
  const width = 800
  const height = 500

  // 1. Fetch user uploads
  const loadUploads = async () => {
    try {
      const response = await api.get('/uploads/files')
      setUploads(response.data.items ?? [])
    } catch (err) {
      console.error(err)
      setUploadsError('Could not load files')
    }
  }

  useEffect(() => {
    loadUploads()
  }, [])

  // 2. Fetch graph data when file selection changes
  const fetchGraph = async (fileId: string) => {
    setLoading(true)
    setLoadingError('')
    setSelectedNode(null)
    setGraphData(null)
    setSimulatedNodes([])
    try {
      const endpoint = fileId === 'workspace' ? '/graph/workspace' : `/graph/file/${fileId}`
      const response = await api.get(endpoint)
      
      const data = response.data
      if (data && data.nodes) {
        setGraphData(data)
      } else {
        setLoadingError('No concept map generated for this resource.')
      }
    } catch (err) {
      console.error(err)
      setLoadingError('Failed to generate knowledge map. Please make sure you have uploaded files.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (uploads.length > 0 || selectedFileId === 'workspace') {
      fetchGraph(selectedFileId)
    }
  }, [selectedFileId, uploads.length])

  // 3. Initialize simulated nodes
  useEffect(() => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) return

    const initialNodes = graphData.nodes.map((node: any, i: number) => {
      const angle = (i / graphData.nodes.length) * 2 * Math.PI
      return {
        ...node,
        x: width / 2 + Math.cos(angle) * 180 + (Math.random() - 0.5) * 20,
        y: height / 2 + Math.sin(angle) * 180 + (Math.random() - 0.5) * 20,
        vx: 0,
        vy: 0,
      }
    })

    setSimulatedNodes(initialNodes)
  }, [graphData])

  // 4. Physics simulation engine loop
  useEffect(() => {
    if (simulatedNodes.length === 0) return

    let animationFrameId: number

    const updatePhysics = () => {
      setSimulatedNodes((prevNodes) => {
        const nextNodes = prevNodes.map((n) => ({ ...n }))

        // A. Repulsion (Push nodes apart)
        for (let i = 0; i < nextNodes.length; i++) {
          for (let j = i + 1; j < nextNodes.length; j++) {
            const n1 = nextNodes[i]
            const n2 = nextNodes[j]
            const dx = n2.x - n1.x
            const dy = n2.y - n1.y
            const distSq = dx * dx + dy * dy || 1
            const dist = Math.sqrt(distSq)
            if (dist < 180) {
              const force = (180 - dist) * 0.05
              const fx = (dx / dist) * force
              const fy = (dy / dist) * force
              n1.vx -= fx
              n1.vy -= fy
              n2.vx += fx
              n2.vy += fy
            }
          }
        }

        // B. Link attraction (Pull connected nodes together)
        if (graphData && graphData.links) {
          graphData.links.forEach((link: any) => {
            const sourceNode = nextNodes.find((n) => n.id === link.source)
            const targetNode = nextNodes.find((n) => n.id === link.target)
            if (sourceNode && targetNode) {
              const dx = targetNode.x - sourceNode.x
              const dy = targetNode.y - sourceNode.y
              const dist = Math.sqrt(dx * dx + dy * dy) || 1
              const desiredDist = 130
              const force = (dist - desiredDist) * 0.02
              const fx = (dx / dist) * force
              const fy = (dy / dist) * force
              sourceNode.vx += fx
              sourceNode.vy += fy
              targetNode.vx -= fx
              targetNode.vy -= fy
            }
          })
        }

        // C. Gravity (Pull to the center)
        nextNodes.forEach((node) => {
          const dx = width / 2 - node.x
          const dy = height / 2 - node.y
          node.vx += dx * 0.002
          node.vy += dy * 0.002
        })

        // D. Update position with velocities + boundaries
        nextNodes.forEach((node) => {
          if (node.id === draggedNodeId && dragPos) {
            node.x = dragPos.x
            node.y = dragPos.y
            node.vx = 0
            node.vy = 0
          } else {
            node.x += node.vx
            node.y += node.vy
            node.vx *= 0.85 // friction
            node.vy *= 0.85
          }

          // boundaries clamp
          node.x = Math.max(30, Math.min(width - 30, node.x))
          node.y = Math.max(30, Math.min(height - 30, node.y))
        })

        return nextNodes
      })

      animationFrameId = requestAnimationFrame(updatePhysics)
    }

    animationFrameId = requestAnimationFrame(updatePhysics)
    return () => cancelAnimationFrame(animationFrameId)
  }, [graphData, draggedNodeId, dragPos])

  // Get mouse coordinates relative to SVG
  const getMouseCoords = (e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return null
    const rect = svgRef.current.getBoundingClientRect()
    
    let clientX: number
    let clientY: number
    
    if ('touches' in e) {
      if (e.touches.length === 0) return null
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    // Translate client coordinates into SVG space coordinates
    const x = ((clientX - rect.left) / rect.width) * width
    const y = ((clientY - rect.top) / rect.height) * height
    return { x, y }
  }

  // Node Drag events
  const handleNodeStartDrag = (nodeId: string, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    const coords = getMouseCoords(e)
    if (!coords) return
    
    setDraggedNodeId(nodeId)
    setDragPos(coords)
    dragStartPos.current = coords
  }

  const handleSVGMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggedNodeId) return
    const coords = getMouseCoords(e)
    if (coords) {
      setDragPos(coords)
    }
  }

  const handleSVGRelease = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggedNodeId) return
    
    // Check if it's a simple click vs a real drag
    if (dragStartPos.current && dragPos) {
      const dx = dragPos.x - dragStartPos.current.x
      const dy = dragPos.y - dragStartPos.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      
      // If the node was barely moved, treat it as a select click
      if (dist < 5) {
        const node = simulatedNodes.find((n) => n.id === draggedNodeId)
        if (node) {
          setSelectedNode(node)
        }
      }
    }

    setDraggedNodeId(null)
    setDragPos(null)
    dragStartPos.current = null
  }

  // Actions
  const handleAskAssistant = () => {
    if (!selectedNode) return
    const query = `Can you explain the concept of "${selectedNode.label}" in detail based on my uploaded study documents?`
    navigate(`/assistant?q=${encodeURIComponent(query)}`)
  }

  const handleStartMicroQuiz = async () => {
    if (!selectedNode) return
    setQuizLoading(true)
    setQuizError('')
    setQuizAnswers({})
    setCurrentQuizIndex(0)
    setQuizFinished(false)
    setQuizModalOpen(true)

    try {
      const response = await api.post('/quiz/generate', {
        difficulty: 'medium',
        question_count: 3,
        concept: selectedNode.label,
        file_id: selectedFileId === 'workspace' ? undefined : selectedFileId
      })
      
      if (response.data?.quiz?.questions) {
        setQuizQuestions(response.data.quiz.questions)
      } else {
        setQuizError('Could not format concept quiz.')
      }
    } catch (err) {
      console.error(err)
      setQuizError('Failed to generate a custom quiz for this concept. Ensure you have valid content.')
    } finally {
      setQuizLoading(false)
    }
  }

  const handleQuizAnswer = (option: string) => {
    setQuizAnswers({
      ...quizAnswers,
      [currentQuizIndex]: option
    })
  }

  const handleQuizNext = () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1)
    } else {
      setQuizFinished(true)
    }
  }

  const quizScore = useMemo(() => {
    let score = 0
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct_answer) {
        score++
      }
    })
    return score
  }, [quizQuestions, quizAnswers])

  // Map links to target coords
  const linksWithCoords = useMemo(() => {
    if (!graphData || !graphData.links || simulatedNodes.length === 0) return []
    return graphData.links.map((link) => {
      const sourceNode = simulatedNodes.find((n) => n.id === link.source)
      const targetNode = simulatedNodes.find((n) => n.id === link.target)
      return {
        ...link,
        sourceNode,
        targetNode,
      }
    }).filter(l => l.sourceNode && l.targetNode)
  }, [graphData, simulatedNodes])

  // Dynamic colors for subjects
  const getNodeColor = (subject: string, isSelected: boolean) => {
    if (isSelected) return 'url(#selectedGlow)'
    const clean = (subject || '').toLowerCase()
    if (clean.includes('math') || clean.includes('algorithm') || clean.includes('regression')) {
      return 'url(#cyanGlow)'
    }
    if (clean.includes('data') || clean.includes('optimization')) {
      return 'url(#violetGlow)'
    }
    return 'url(#indigoGlow)'
  }

  // Check if uploads are empty
  const hasNoUploads = uploads.length === 0

  return (
    <div className="space-y-8 pb-12">
      <PageHero
        eyebrow="Interactive Study Tool"
        title="Knowledge Graph & Concept Map"
        description="Interact with a visual map of your study documents. Click nodes to learn details or test your recall."
      />

      {hasNoUploads ? (
        <EmptyState
          title="No Study Materials Yet"
          description="We need at least one PDF upload to compile your concept network."
          actionLink="/uploads"
          actionText="Go to Uploads"
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Visualizer Area */}
          <div className="lg:col-span-2 space-y-4">
            <GlassCard className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-[0.16em]">Graph Focus Scope</span>
                <div className="mt-1.5 flex items-center gap-2">
                  <Network className="h-4 w-4 text-cyan-400" />
                  <select
                    value={selectedFileId}
                    onChange={(e) => setSelectedFileId(e.target.value)}
                    className="bg-slate-900 border border-white/[0.08] rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="workspace">Combined Workspace (All PDFs)</option>
                    {uploads.map((file) => (
                      <option key={file.id} value={file.id}>
                        {file.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                Drag nodes to organize • Click nodes to view
              </div>
            </GlassCard>

            <GlassCard className="relative aspect-[8/5] w-full overflow-hidden border border-white/[0.08] p-1 select-none">
              {loading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#08111f]/80 backdrop-blur-md space-y-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="h-10 w-10 border-4 border-cyan-500 border-t-transparent rounded-full"
                  />
                  <div className="text-center space-y-1">
                    <p className="text-sm font-semibold text-white tracking-wide">Analyzing study materials...</p>
                    <p className="text-xs text-slate-400">EduGenie is drawing concept connections using Gemini</p>
                  </div>
                </div>
              )}

              {loadingError && !loading && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#08111f]/60 backdrop-blur-md space-y-4">
                  <AlertCircle className="h-12 w-12 text-violet-400" />
                  <div className="max-w-md space-y-2">
                    <p className="text-base font-semibold text-white">{loadingError}</p>
                    <button
                      onClick={() => fetchGraph(selectedFileId)}
                      className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 border border-white/[0.08] text-white rounded-xl transition"
                    >
                      Retry Graph Generation
                    </button>
                  </div>
                </div>
              )}

              {!loading && !loadingError && simulatedNodes.length === 0 && (
                <div className="absolute inset-0 z-20 flex items-center justify-center text-slate-400 text-sm">
                  Choose a scope or upload documents to display graph.
                </div>
              )}

              {/* Dynamic SVG Workspace */}
              <svg
                ref={svgRef}
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full cursor-crosshair bg-slate-950/20"
                onMouseMove={handleSVGMove}
                onTouchMove={handleSVGMove}
                onMouseUp={handleSVGRelease}
                onTouchEnd={handleSVGRelease}
                onMouseLeave={handleSVGRelease}
              >
                {/* SVG Filters for Glow Effect */}
                <defs>
                  <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="violetGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="indigoGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="selectedGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="10" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  
                  {/* Glowing Node Colors */}
                  <radialGradient id="cyanGrad">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </radialGradient>
                  <radialGradient id="violetGrad">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </radialGradient>
                  <radialGradient id="indigoGrad">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </radialGradient>
                  <radialGradient id="selectedGrad">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="50%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </radialGradient>
                </defs>

                {/* SVG Definitions */}
                <g>
                  {/* 1. Draw Links */}
                  {linksWithCoords.map((link, index) => {
                    const isSelected = selectedNode && (selectedNode.id === link.source || selectedNode.id === link.target)
                    return (
                      <g key={`${link.source}-${link.target}-${index}`}>
                        <line
                          x1={link.sourceNode?.x}
                          y1={link.sourceNode?.y}
                          x2={link.targetNode?.x}
                          y2={link.targetNode?.y}
                          stroke={isSelected ? '#c084fc' : '#334155'}
                          strokeWidth={isSelected ? 2 : 1}
                          strokeOpacity={isSelected ? 0.8 : 0.4}
                          className="transition-all duration-300"
                        />
                        {/* Edge Label */}
                        {link.label && (
                          <text
                            x={((link.sourceNode?.x || 0) + (link.targetNode?.x || 0)) / 2}
                            y={((link.sourceNode?.y || 0) + (link.targetNode?.y || 0)) / 2 - 4}
                            fill={isSelected ? '#c084fc' : '#64748b'}
                            fontSize="8"
                            textAnchor="middle"
                            className="pointer-events-none select-none font-medium"
                          >
                            {link.label}
                          </text>
                        )}
                      </g>
                    )
                  })}
                </g>

                <g>
                  {/* 2. Draw Nodes */}
                  {simulatedNodes.map((node) => {
                    const isSelected = selectedNode?.id === node.id
                    const nodeRadius = (node.val || 12) + 2
                    
                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x}, ${node.y})`}
                        className="cursor-pointer group"
                        onMouseDown={(e) => handleNodeStartDrag(node.id, e)}
                        onTouchStart={(e) => handleNodeStartDrag(node.id, e)}
                      >
                        {/* Outer Glow */}
                        <circle
                          r={nodeRadius + 6}
                          fill={isSelected ? 'url(#selectedGrad)' : getNodeColor(node.subject, false)}
                          filter={isSelected ? 'url(#selectedGlow)' : (node.subject ? 'url(#cyanGlow)' : 'url(#indigoGlow)')}
                          opacity={isSelected ? 0.45 : 0.15}
                          className="transition-all duration-500 group-hover:scale-125"
                        />

                        {/* Solid core circle */}
                        <circle
                          r={nodeRadius}
                          fill={isSelected ? 'url(#selectedGrad)' : (node.subject?.toLowerCase().includes('data') ? 'url(#violetGrad)' : 'url(#cyanGrad)')}
                          stroke="#ffffff"
                          strokeWidth={isSelected ? 2.5 : 1}
                          strokeOpacity={isSelected ? 0.9 : 0.2}
                          className="transition-all duration-300 shadow-xl"
                        />

                        {/* Label */}
                        <text
                          y={nodeRadius + 14}
                          textAnchor="middle"
                          fill={isSelected ? '#ffffff' : '#cbd5e1'}
                          fontSize={isSelected ? '12' : '10'}
                          fontWeight={isSelected ? 'bold' : 'normal'}
                          className="pointer-events-none select-none drop-shadow-md select-none font-medium transition-colors"
                        >
                          {node.label}
                        </text>
                      </g>
                    )
                  })}
                </g>
              </svg>
            </GlassCard>
          </div>

          {/* Right Sidebar Details panel */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {selectedNode ? (
                <motion.div
                  key={selectedNode.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard className="p-6 space-y-6 h-full flex flex-col justify-between border-white/[0.08] gradient-border">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-300">
                            {selectedNode.subject || 'Core Concept'}
                          </span>
                          <h3 className="text-xl font-bold text-white mt-1">{selectedNode.label}</h3>
                        </div>
                        <button
                          onClick={() => setSelectedNode(null)}
                          className="h-8 w-8 flex items-center justify-center rounded-full bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="border-b border-white/[0.08]" />

                      <div className="space-y-2">
                        <span className="text-xs text-slate-400 font-semibold">Concept Definition</span>
                        <p className="text-sm text-slate-300 leading-relaxed bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4">
                          {selectedNode.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-6">
                      <GlowButton
                        onClick={handleAskAssistant}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-400 to-violet-500 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-cyan-500/10"
                      >
                        <Brain className="h-4 w-4" />
                        Ask Assistant About This
                      </GlowButton>

                      <button
                        onClick={handleStartMicroQuiz}
                        className="w-full py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition"
                      >
                        <BookOpen className="h-4 w-4 text-violet-300" />
                        Take Concept Micro-Quiz
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              ) : (
                <GlassCard className="p-6 h-full flex flex-col items-center justify-center text-center text-slate-400 border-white/[0.08] min-h-[300px]">
                  <HelpCircle className="h-10 w-10 text-slate-500 mb-3 animate-pulse" />
                  <p className="text-sm font-semibold text-slate-300">No Concept Selected</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
                    Click any bubble on the map to review details, chat, or take micro-quizzes.
                  </p>
                </GlassCard>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Concept Micro-Quiz Modal */}
      <AnimatePresence>
        {quizModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-slate-900 border border-white/[0.08] rounded-[2rem] p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Background gradient blob */}
              <div className="absolute -top-24 -right-24 h-48 w-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">
                      Concept Micro-Quiz
                    </span>
                  </div>
                  <button
                    onClick={() => setQuizModalOpen(false)}
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white/[0.04] text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="border-b border-white/[0.08]" />

                {quizLoading && (
                  <div className="py-12 flex flex-col items-center justify-center space-y-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                      className="h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full"
                    />
                    <p className="text-sm text-slate-400">Generating quiz questions...</p>
                  </div>
                )}

                {quizError && !quizLoading && (
                  <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center">
                    <AlertCircle className="h-10 w-10 text-violet-400" />
                    <p className="text-sm font-semibold text-white">{quizError}</p>
                    <button
                      onClick={handleStartMicroQuiz}
                      className="px-4 py-2 text-xs bg-white/10 hover:bg-white/20 border border-white/[0.08] text-white rounded-xl transition"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!quizLoading && !quizError && quizQuestions.length > 0 && (
                  <div className="space-y-6">
                    {!quizFinished ? (
                      // Active Quiz Question View
                      <div className="space-y-6">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>
                            Question {currentQuizIndex + 1} of {quizQuestions.length}
                          </span>
                          <span className="px-2 py-1 rounded bg-white/[0.04] uppercase tracking-wider text-[10px]">
                            {selectedNode?.label}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-white leading-relaxed">
                          {quizQuestions[currentQuizIndex].question}
                        </h4>

                        <div className="grid gap-3">
                          {quizQuestions[currentQuizIndex].options.map((option, idx) => {
                            const isSelected = quizAnswers[currentQuizIndex] === option
                            return (
                              <button
                                key={idx}
                                onClick={() => handleQuizAnswer(option)}
                                className={`w-full p-4 rounded-2xl text-left text-sm font-medium border transition-all duration-300 flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-cyan-950/40 to-violet-950/40 border-cyan-400 text-white shadow-lg shadow-cyan-950/20'
                                    : 'bg-white/[0.02] border-white/[0.08] text-slate-300 hover:bg-white/[0.06] hover:text-white'
                                }`}
                              >
                                <span>{option}</span>
                                {isSelected && (
                                  <div className="h-5 w-5 flex items-center justify-center rounded-full bg-cyan-400 text-slate-900">
                                    <Check className="h-3 w-3 stroke-[3]" />
                                  </div>
                                )}
                              </button>
                            )
                          })}
                        </div>

                        <div className="flex justify-end pt-4">
                          <button
                            onClick={handleQuizNext}
                            disabled={!quizAnswers[currentQuizIndex]}
                            className="px-6 py-2.5 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-1.5"
                          >
                            <span>
                              {currentQuizIndex < quizQuestions.length - 1 ? 'Next Question' : 'Complete Quiz'}
                            </span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Quiz Score Screen View
                      <div className="space-y-6 text-center py-4">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-2">
                          <Sparkles className="h-8 w-8" />
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="text-xl font-bold text-white">Quiz Completed!</h4>
                          <p className="text-sm text-slate-400">Here's how you did on {selectedNode?.label}:</p>
                        </div>

                        <div className="text-5xl font-black text-white py-2">
                          {quizScore} <span className="text-2xl text-slate-500">/ {quizQuestions.length}</span>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-white/[0.08] text-left">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-[0.16em]">
                            Review Answers
                          </p>
                          
                          <div className="max-h-[220px] overflow-y-auto space-y-4 pr-1">
                            {quizQuestions.map((q, idx) => {
                              const isCorrect = quizAnswers[idx] === q.correct_answer
                              return (
                                <div
                                  key={idx}
                                  className="p-4 rounded-2xl border border-white/[0.04] bg-white/[0.02] space-y-2 text-xs"
                                >
                                  <div className="font-bold text-slate-300">{q.question}</div>
                                  <div className="flex flex-col gap-1">
                                    <div className="text-slate-400">
                                      Your Answer:{' '}
                                      <span className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>
                                        {quizAnswers[idx]}
                                      </span>
                                    </div>
                                    {!isCorrect && (
                                      <div className="text-slate-400">
                                        Correct Answer:{' '}
                                        <span className="text-emerald-400">{q.correct_answer}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-slate-400 italic text-[11px] leading-relaxed pt-1.5 border-t border-white/[0.04]">
                                    {q.explanation}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        <div className="flex justify-center pt-4">
                          <button
                            onClick={() => setQuizModalOpen(false)}
                            className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-violet-500 text-white font-semibold rounded-xl transition text-sm"
                          >
                            Return to Concept Map
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
