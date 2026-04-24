import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { UserRole } from '../types/auth'
import { authService } from '../services/authService'
import { profileService } from '../services/profileService'

interface AuthContextData {
  user: User | null
  session: Session | null
  role: UserRole | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextData | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const syncAuthSession = async (authSession: Session | null) => {
      setSession(authSession)
      const currentUser = authSession?.user ?? null
      setUser(currentUser)

      if (!currentUser) {
        setRole(null)
        setLoading(false)
        return
      }

      try {
        const profile = await profileService.getByAuthUserId(currentUser.id)
        setRole(profile?.role ?? null)
      } catch (error) {
        console.error('[Auth] Erro ao sincronizar role do profile:', error)
        setRole(null)
      }
      setLoading(false)
    }

    const loadSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()

      await syncAuthSession(currentSession)
    }

    void loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, authSession) => {
      void syncAuthSession(authSession)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    await authService.signIn(email, password)
  }

  const signOut = async () => {
    await authService.signOut()
  }

  const value = useMemo<AuthContextData>(
    () => ({
      user,
      session,
      role,
      loading,
      signIn,
      signOut,
    }),
    [user, session, role, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
