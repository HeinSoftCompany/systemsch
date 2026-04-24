import { supabase } from '../lib/supabase'
import type { UserRole } from '../types/auth'

const isValidRole = (value: unknown): value is UserRole =>
  value === 'admin' || value === 'teacher' || value === 'student'

export interface AuthProfile {
  id: string
  school_id: string
  full_name: string
  email: string
  role: UserRole
  status: 'active' | 'inactive'
}

const parseProfile = (row: {
  id: string
  school_id: string
  full_name: string
  email: string
  role: string
  status: 'active' | 'inactive'
}): AuthProfile | null => {
  if (!isValidRole(row.role)) return null
  return {
    id: row.id,
    school_id: row.school_id,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    status: row.status,
  }
}

export const profileService = {
  async getByAuthUserId(userId: string): Promise<AuthProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, school_id, full_name, email, role, status')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('[ProfileService] getByAuthUserId error:', error)
      throw new Error(error.message || 'Erro ao consultar profile em public.profiles.')
    }

    if (!data) return null
    return parseProfile(data)
  },
}
