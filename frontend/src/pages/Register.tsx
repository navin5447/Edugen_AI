import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, BookOpen, Brain, Upload, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { GlowButton } from '../components/GlowButton'

export default function Register() {
  const { signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleGoogle = async () => {
    try {
      await signInWithGoogle()
      navigate('/dashboard')
    } catch (err: any) {
      console.error('Google sign-in error', err)
      if (err?.code === 'auth/unauthorized-domain' || err?.message?.includes('auth/unauthorized-domain')) {
        alert(`Google Sign-In Error: Unauthorized Domain.\n\nPlease add "${window.location.hostname}" to your Firebase Console under Authentication -> Settings -> Authorized Domains.`)
      } else {
        const detail = err?.response?.data?.detail
        alert(detail || err?.message || 'Google sign-in failed')
      }
    }
  }

  const steps = [
    { icon: Upload, label: 'Upload PDFs', desc: 'Index your study materials instantly' },
    { icon: Brain, label: 'Ask AI', desc: 'Get source-linked answers with citations' },
    { icon: BookOpen, label: 'Take Quizzes', desc: 'Practice with AI-generated MCQs' },
    { icon: Zap, label: 'Track Progress', desc: 'Monitor scores and study streaks' },
  ]

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-2 lg:gap-16 items-center">
        {/* Left — Branding */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="hidden lg:block"
        >
          <div className="flex items-center gap-3 mb-8">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="logo-glow flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500"
            >
              <Sparkles className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h2 className="text-lg font-bold tracking-[0.2em] text-cyan-200 uppercase">EduGenie AI</h2>
              <p className="text-xs text-slate-400">AI-powered study workspace</p>
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white xl:text-5xl">
            Start your{' '}
            <span className="gradient-text">AI study journey</span>{' '}
            today
          </h1>
          <p className="mt-4 text-lg text-slate-300 leading-relaxed">
            Join thousands of students using AI to study smarter. Upload, learn, practice, and ace your exams.
          </p>

          {/* How it works steps */}
          <div className="mt-10 space-y-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 text-cyan-300 border border-white/[0.08]">
                  <step.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{step.label}</p>
                  <p className="text-xs text-slate-400">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="h-3 w-3 text-slate-600 hidden xl:block ml-auto" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right — Register Form */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="gradient-border">
            <div className="rounded-[1.75rem] border border-white/[0.06] bg-[#0c1829]/80 p-8 backdrop-blur-2xl glow-pulse">
              {/* Mobile logo */}
              <div className="flex items-center gap-3 mb-6 lg:hidden">
                <div className="logo-glow flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold tracking-[0.2em] text-cyan-200 uppercase">EduGenie AI</div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white">Create your account</h2>
              <p className="mt-2 text-sm text-slate-400">Get started with your AI study companion</p>

              {/* Google Sign-up */}
              <div className="mt-8">
                <GlowButton
                  onClick={handleGoogle}
                  className="w-full"
                  size="lg"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity="0.8"/>
                    <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" opacity="0.6"/>
                    <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity="0.4"/>
                  </svg>
                  Continue with Google
                </GlowButton>
              </div>

              {/* Benefits */}
              <div className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">What you get</p>
                <ul className="space-y-2.5">
                  {['Unlimited PDF uploads & indexing', 'AI chat with source citations', 'Custom quiz generation', 'Score tracking & analytics'].map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.08 }}
                      className="flex items-center gap-2 text-sm text-slate-300"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <p className="mt-6 text-center text-sm text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-cyan-300 transition hover:text-cyan-200">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
