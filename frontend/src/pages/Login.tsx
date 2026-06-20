import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Mail, Phone, ArrowRight, Shield, Brain, BookOpen, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { GlowButton } from '../components/GlowButton'

export default function Login() {
  const { signInWithGoogle, signInWithPhone, confirmPhoneCode, backendVerified } = useAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [busy, setBusy] = useState(false)

  const handleGoogle = async () => {
    setBusy(true)
    try {
      await signInWithGoogle()
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      alert('Google sign-in failed')
    } finally {
      setBusy(false)
    }
  }

  const handleSendOtp = async () => {
    setBusy(true)
    try {
      await signInWithPhone(phone)
      setOtpSent(true)
    } catch (err) {
      console.error(err)
      alert('Phone sign-in failed')
    } finally {
      setBusy(false)
    }
  }

  const handleVerifyOtp = async () => {
    setBusy(true)
    try {
      await confirmPhoneCode(verificationCode)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      alert('OTP verification failed')
    } finally {
      setBusy(false)
    }
  }

  const features = [
    { icon: Brain, label: 'AI Assistant', desc: 'Ask questions, get cited answers' },
    { icon: BookOpen, label: 'Smart Quizzes', desc: 'Auto-generated from your PDFs' },
    { icon: Zap, label: 'RAG Pipeline', desc: 'Source-linked, verified responses' },
    { icon: Shield, label: 'Secure', desc: 'Firebase auth + encrypted storage' },
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
            Transform your{' '}
            <span className="gradient-text">study experience</span>{' '}
            with AI
          </h1>
          <p className="mt-4 text-lg text-slate-300 leading-relaxed">
            Upload your PDFs, ask questions with source-linked answers, and generate practice quizzes — all powered by advanced RAG and Gemini AI.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur"
              >
                <f.icon className="h-5 w-5 text-cyan-300 mb-2" />
                <p className="text-sm font-semibold text-white">{f.label}</p>
                <p className="text-xs text-slate-400 mt-1">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right — Login Form */}
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

              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-400">Sign in to your study workspace</p>

              {backendVerified ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.08] px-4 py-3 text-sm text-emerald-300 flex items-center gap-2"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Backend session verified
                </motion.div>
              ) : null}

              {/* Google Sign-in */}
              <div className="mt-6">
                <GlowButton
                  disabled={busy}
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

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.08]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#0c1829] px-4 text-xs text-slate-500 uppercase tracking-wider">or use phone</span>
                </div>
              </div>

              {/* Phone Sign-in */}
              <div className="space-y-3">
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-500 backdrop-blur transition-all focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/10"
                  />
                </div>
                <GlowButton
                  disabled={busy}
                  onClick={handleSendOtp}
                  variant="secondary"
                  className="w-full"
                >
                  Send OTP
                  <ArrowRight className="h-4 w-4" />
                </GlowButton>

                {otpSent ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 overflow-hidden"
                  >
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter OTP"
                        className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-slate-500 backdrop-blur transition-all focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/10"
                      />
                    </div>
                    <GlowButton
                      disabled={busy}
                      onClick={handleVerifyOtp}
                      className="w-full"
                    >
                      Verify OTP
                    </GlowButton>
                  </motion.div>
                ) : null}
              </div>

              {/* Footer */}
              <p className="mt-6 text-center text-sm text-slate-400">
                No account?{' '}
                <Link to="/register" className="font-medium text-cyan-300 transition hover:text-cyan-200">
                  Register
                </Link>
              </p>

              <div id="recaptcha-container" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
