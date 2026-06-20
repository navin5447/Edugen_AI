import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from '../firebase/firebase'
import api from '../services/api'

type AuthContextType = {
  user: User | null
  loading: boolean
  backendVerified: boolean
  signInWithGoogle: () => Promise<void>
  signInWithPhone: (phone: string, appVerifier?: RecaptchaVerifier) => Promise<void>
  confirmPhoneCode: (verificationCode: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [backendVerified, setBackendVerified] = useState(false)
  const [phoneConfirmation, setPhoneConfirmation] = useState<Awaited<ReturnType<typeof signInWithPhoneNumber>> | null>(null)

  const syncBackendSession = async () => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      setBackendVerified(false)
      return
    }

    const token = await currentUser.getIdToken()
    try {
      await api.post('/auth/verify', null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setBackendVerified(true)
    } catch (err: any) {
      console.error('Backend verify failed', err?.response?.data || err)
      setBackendVerified(false)
      throw err
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (!u) {
        setBackendVerified(false)
        setLoading(false)
        return
      }

      syncBackendSession()
        .catch(() => setBackendVerified(false))
        .finally(() => setLoading(false))
    })
    return () => unsub()
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
    await syncBackendSession()
  }

  const signInWithPhone = async (phone: string, appVerifier?: RecaptchaVerifier) => {
    if (!appVerifier) {
      // create invisible recaptcha by default
      // caller can provide explicit RecaptchaVerifier
      // @ts-ignore
      window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', { size: 'invisible' }, auth)
      // @ts-ignore
      appVerifier = window.recaptchaVerifier
    }
    const confirmation = await signInWithPhoneNumber(auth, phone, appVerifier)
    setPhoneConfirmation(confirmation)
  }

  const confirmPhoneCode = async (verificationCode: string) => {
    if (!phoneConfirmation) {
      throw new Error('Phone sign-in has not been started')
    }

    await phoneConfirmation.confirm(verificationCode)
    setPhoneConfirmation(null)
    await syncBackendSession()
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
    setBackendVerified(false)
    setPhoneConfirmation(null)
  }

  return <AuthContext.Provider value={{ user, loading, backendVerified, signInWithGoogle, signInWithPhone, confirmPhoneCode, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
