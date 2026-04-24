import { supabase } from '../lib/supabase'
import { profileService } from './profileService'

const normalizeAuthErrorMessage = (error: unknown, fallback: string): string => {
  if (!(error instanceof Error)) return fallback
  return error.message || fallback
}

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    console.log('[AuthService] signInWithPassword result:', data)

    if (error) {
      console.error('[AuthService] signIn error:', error)
      throw new Error(normalizeAuthErrorMessage(error, 'Nao foi possivel fazer login.'))
    }

    const user = data.user
    if (!user) {
      throw new Error('Login realizado, mas o Supabase nao retornou o usuario.')
    }

    const profile = await profileService.getByAuthUserId(user.id)
    if (!profile) {
      await supabase.auth.signOut()
      throw new Error(
        'Usuario autenticado, mas profile nao encontrado em public.profiles. Verifique cadastro e role.',
      )
    }

    return { user, profile }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('[AuthService] signOut error:', error)
      throw new Error(error.message || 'Nao foi possivel sair da sessao.')
    }
  },
}
