export type UserRole = 'admin' | 'teacher' | 'student'
export type UserStatus = 'active' | 'inactive'

export interface UserProfile {
  id: string
  full_name: string
  email: string
  role: UserRole
  status: UserStatus
  created_at: string
  updated_at: string
}

export interface AuthSessionUser {
  id: string
  email: string | null
  role: UserRole | null
}
