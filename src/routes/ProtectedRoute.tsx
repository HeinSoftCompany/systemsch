import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { UserRole } from '../types/auth'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth()

  if (loading) {
    return <p>Carregando...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to={`/${role ?? 'login'}`} replace />
  }

  return <Outlet />
}
