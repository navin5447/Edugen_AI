import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Brain, Zap, Trophy, Clock, CheckCircle2, XCircle } from 'lucide-react'
import api from '../services/api'
import type { QuizDifficulty, QuizQuestion, QuizRecord } from '../types/quiz'
import { PageHero, GlassCard, SectionHeading } from '../components/AppShell'
import { AnimatedCounter } from '../components/AnimatedCounter'
import { EmptyState } from '../components/EmptyState'
import { GlowButton } from '../components/GlowButton'
import { StaggerContainer } from '../components/StaggerContainer'

type QuizAnswer = {
  questionIndex: number
  selected: string
}

const initialSecondsPerQuestion = 30

export default function Quiz() {
  const [difficulty, setDifficulty] = useState<QuizDifficulty>('medium')
  const [questionCount, setQuestionCount] = useState(10)
  const [quiz, setQuiz] = useState<QuizRecord | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [savingScore, setSavingScore] = useState(false)
  const [finalScore, setFinalScore] = useState<number | null>(null)
  const [attemptSaved, setAttemptSaved] = useState(false)
  const [completedInSeconds, setCompletedInSeconds] = useState<number | null>(null)

  const currentQuestion = quiz?.questions[currentQuestionIndex]
  const answeredCount = useMemo(() => Object.keys(selectedAnswers).length, [selectedAnswers])
  const scorePercentage = finalScore !== null && quiz ? Math.round((finalScore / quiz.question_count) * 100) : 0

  // Timer color class
  const getTimerClass = () => {
    if (!quiz) return 'timer-safe'
    const total = quiz.question_count * initialSecondsPerQuestion
    const pct = timerSeconds / total
    if (pct > 0.5) return 'timer-safe'
    if (pct > 0.2) return 'timer-warn'
    return 'timer-danger'
  }

  useEffect(() => {
    if (!quiz || finalScore !== null) return

    setTimerSeconds(quiz.question_count * initialSecondsPerQuestion)
    const interval = window.setInterval(() => {
      setTimerSeconds((secondsLeft) => {
        if (secondsLeft <= 1) {
          window.clearInterval(interval)
          void submitQuiz()
          return 0
        }
        return secondsLeft - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [quiz, finalScore])

  const startQuiz = async () => {
    setBusy(true)
    setError('')
    setQuiz(null)
    setSelectedAnswers({})
    setCurrentQuestionIndex(0)
    setFinalScore(null)
    setAttemptSaved(false)
    setCompletedInSeconds(null)
    try {
      const response = await api.post('/quiz/generate', {
        difficulty,
        question_count: questionCount
      })
      setQuiz(response.data.quiz)
    } catch (generationError) {
      console.error(generationError)
      setError('Could not generate quiz. Make sure you have uploaded PDFs and set GEMINI_API_KEY.')
    } finally {
      setBusy(false)
    }
  }

  const selectAnswer = (questionIndex: number, option: string) => {
    setSelectedAnswers((current) => ({ ...current, [questionIndex]: option }))
  }

  const submitQuiz = async () => {
    if (!quiz || finalScore !== null) return

    const startedSeconds = quiz.question_count * initialSecondsPerQuestion
    const score = quiz.questions.reduce((total, question, index) => total + (selectedAnswers[index] === question.correct_answer ? 1 : 0), 0)
    const elapsed = startedSeconds - timerSeconds
    setCompletedInSeconds(elapsed)
    setFinalScore(score)

    setSavingScore(true)
    try {
      await api.post(`/quiz/${quiz.id}/attempt`, {
        score,
        total_questions: quiz.question_count,
        answers: quiz.questions.map((_, index) => selectedAnswers[index] ?? ''),
        completed_in_seconds: elapsed
      })
      setAttemptSaved(true)
    } catch (attemptError) {
      console.error(attemptError)
      setAttemptSaved(false)
    } finally {
      setSavingScore(false)
    }
  }

  const activeQuestion = currentQuestion ?? quiz?.questions[0]

  // ─── Setup Screen ─────────────────────────────────
  if (!quiz) {
    return (
      <div className="space-y-6">
        <PageHero
          eyebrow="Quiz studio"
          title="Practice with Generated Quizzes"
          description="Create custom-difficulty MCQs from your uploaded study materials. Get instant scoring, review explanations, and track your performance."
          cta={
            <Link to="/uploads">
              <motion.div
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.12]"
              >
                <BookOpen className="h-4 w-4" /> Upload Materials
              </motion.div>
            </Link>
          }
          metrics={[
            { label: 'Difficulty', value: difficulty.charAt(0).toUpperCase() + difficulty.slice(1), hint: 'Quiz intensity', icon: <Zap className="h-4 w-4" /> },
            { label: 'Questions', value: `${questionCount}`, hint: 'Per quiz', icon: <Brain className="h-4 w-4" /> },
            { label: 'Timer', value: `${questionCount * 30}s`, hint: 'Total time', icon: <Clock className="h-4 w-4" /> },
            { label: 'Mode', value: 'Practice', hint: 'From PDFs', icon: <BookOpen className="h-4 w-4" /> },
          ]}
        />

        <StaggerContainer className="grid gap-4 xl:grid-cols-[2fr_1fr]" delay={0.3}>
          <GlassCard className="p-6">
            <SectionHeading title="Quiz settings" subtitle="Configure your practice session" />
            <div className="space-y-4">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-white">Difficulty</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as QuizDifficulty[]).map((d) => (
                    <motion.button
                      key={d}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setDifficulty(d)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                        difficulty === d
                          ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300'
                          : 'border-white/[0.08] bg-white/[0.04] text-slate-300 hover:border-white/[0.15] hover:bg-white/[0.06]'
                      }`}
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-white">Number of questions</span>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((count) => (
                    <motion.button
                      key={count}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setQuestionCount(count)}
                      className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                        questionCount === count
                          ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300'
                          : 'border-white/[0.08] bg-white/[0.04] text-slate-300 hover:border-white/[0.15] hover:bg-white/[0.06]'
                      }`}
                    >
                      {count}
                    </motion.button>
                  ))}
                </div>
              </label>

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
                onClick={startQuiz}
                className="w-full"
                size="lg"
              >
                {busy ? '✨ Generating quiz...' : 'Start Quiz'}
              </GlowButton>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <SectionHeading title="Tips" subtitle="For best results" />
            <div className="space-y-4 text-sm text-slate-400">
              {[
                { emoji: '📚', title: 'Upload PDFs first', desc: 'Quiz questions are generated from your study materials.' },
                { emoji: '⏱️', title: 'Time yourself', desc: 'Auto-submit when timer ends. No rushing needed.' },
                { emoji: '🔍', title: 'Review answers', desc: 'Read explanations to understand mistakes.' },
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
      </div>
    )
  }

  // ─── Active Quiz Screen ───────────────────────────
  if (finalScore === null) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="text-sm text-slate-400">Question {currentQuestionIndex + 1} of {quiz.question_count}</p>
            <p className="mt-1 text-sm text-slate-500">{answeredCount} answered</p>
            {/* Progress bar */}
            <div className="mt-3 h-1.5 w-48 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                animate={{ width: `${((currentQuestionIndex + 1) / quiz.question_count) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          <GlassCard className="p-4">
            <div className="text-center">
              <p className="text-xs text-slate-400">Time remaining</p>
              <p className={`mt-2 font-mono text-2xl font-bold ${getTimerClass()}`}>
                {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
              </p>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">{activeQuestion?.question}</h2>
              </div>

              <div className="grid gap-3">
                {activeQuestion?.options.map((option, i) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === option
                  return (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      whileHover={{ x: 4, scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => selectAnswer(currentQuestionIndex, option)}
                      className={`rounded-2xl border px-5 py-4 text-left transition-all ${
                        isSelected
                          ? 'border-cyan-400/40 bg-cyan-400/10 text-white shadow-lg shadow-cyan-500/10'
                          : 'border-white/[0.08] bg-white/[0.03] text-slate-200 hover:border-white/[0.15] hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                          isSelected ? 'border-cyan-400 bg-cyan-400/20' : 'border-white/20'
                        }`}>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="h-2.5 w-2.5 rounded-full bg-cyan-400"
                            />
                          )}
                        </div>
                        <span className="font-medium">{option}</span>
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <div className="flex flex-wrap gap-3">
          <GlowButton
            variant="secondary"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((value) => Math.max(0, value - 1))}
          >
            ← Previous
          </GlowButton>
          <GlowButton
            variant="secondary"
            disabled={currentQuestionIndex >= quiz.question_count - 1}
            onClick={() => setCurrentQuestionIndex((value) => Math.min(quiz.question_count - 1, value + 1))}
          >
            Next →
          </GlowButton>
          <div className="ml-auto">
            <GlowButton onClick={submitQuiz}>
              Finish Quiz
            </GlowButton>
          </div>
        </div>
      </div>
    )
  }

  // ─── Results Screen ───────────────────────────────
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
      >
        <GlassCard className="border-cyan-400/20 p-8 text-center gradient-border">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <Trophy className="mx-auto h-12 w-12 text-amber-400 mb-4" />
          </motion.div>
          <p className="text-sm text-slate-400">Quiz completed</p>
          <div className="mt-4 text-6xl font-bold">
            <span className="gradient-text">
              <AnimatedCounter value={scorePercentage} suffix="%" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">
            {finalScore} out of {quiz.question_count} correct
          </p>
          <p className="mt-4 text-sm text-slate-400">
            {completedInSeconds !== null ? `Completed in ${Math.round(completedInSeconds / 60)}m ${completedInSeconds % 60}s` : 'Time not recorded'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {attemptSaved ? (
              <span className="flex items-center justify-center gap-1 text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> Score saved
              </span>
            ) : savingScore ? 'Saving...' : 'Score not saved'}
          </p>
        </GlassCard>
      </motion.div>

      <div className="space-y-4">
        <SectionHeading title="Review your answers" subtitle="Learn from every question" />
        <div className="space-y-3">
          {quiz.questions.map((question, index) => {
            const selected = selectedAnswers[index]
            const isCorrect = selected === question.correct_answer
            return (
              <motion.div
                key={`${index}-${question.question}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.04, duration: 0.4 }}
                whileHover={{ y: -3 }}
                className={`rounded-2xl border p-5 transition ${
                  isCorrect
                    ? 'border-emerald-500/20 bg-emerald-500/[0.06]'
                    : 'border-red-500/20 bg-red-500/[0.06]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${
                    isCorrect
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}>
                    {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{index + 1}. {question.question}</p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div>
                        <span className={isCorrect ? 'text-emerald-300' : 'text-red-300'}>
                          Your answer: {selected || '(Not answered)'}
                        </span>
                      </div>
                      {!isCorrect ? (
                        <div className="text-emerald-300">
                          Correct answer: {question.correct_answer}
                        </div>
                      ) : null}
                      <div className="text-slate-400">{question.explanation}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <GlowButton
        onClick={startQuiz}
        className="w-full"
        size="lg"
      >
        Generate New Quiz
      </GlowButton>
    </div>
  )
}