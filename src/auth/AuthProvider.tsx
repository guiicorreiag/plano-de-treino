import type { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'

type AuthContextValue = {
  loading: boolean
  session: Session | null
  user: User | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(navigator.onLine)
  const [online, setOnline] = useState(navigator.onLine)
  const [offlineUser, setOfflineUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('training.offline-user') ?? 'null') } catch { return null }
  })
  function remember(next: Session | null) {
    if (next?.user) {
      const user = { id: next.user.id, email: next.user.email, aud: next.user.aud, created_at: next.user.created_at } as User
      localStorage.setItem('training.offline-user', JSON.stringify(user))
      setOfflineUser(user)
    }
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (active) {
        remember(data.session)
        setSession(data.session)
        setLoading(false)
      }
    }).catch(() => { if (active) setLoading(false) })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      remember(nextSession)
      setSession(nextSession)
      setLoading(false)
    })

    const connectivity = () => { setOnline(navigator.onLine); if (!navigator.onLine) setLoading(false) }
    window.addEventListener('online', connectivity)
    window.addEventListener('offline', connectivity)
    return () => {
      window.removeEventListener('online', connectivity)
      window.removeEventListener('offline', connectivity)
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      session,
      user: session?.user ?? (!online ? offlineUser : null),
      signOut: async () => {
        if (supabase) { const { error } = await supabase.auth.signOut(); if (error) throw error }
        localStorage.removeItem('training.offline-user')
        setOfflineUser(null)
      },
    }),
    [loading, session, online, offlineUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
