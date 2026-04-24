import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  CalendarCheck2,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  School,
  Settings,
  Shapes,
  Star,
  Users,
} from 'lucide-react'
import type { UserRole } from '../../types/auth'

export interface MenuItem {
  label: string
  to: string
  icon: LucideIcon
}

export const menuByRole: Record<UserRole, MenuItem[]> = {
  admin: [
    { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
    { label: 'Professores', to: '/admin/professores', icon: GraduationCap },
    { label: 'Alunos', to: '/admin/alunos', icon: Users },
    { label: 'Turmas', to: '/admin/turmas', icon: School },
    { label: 'Disciplinas', to: '/admin/disciplinas', icon: BookOpen },
    { label: 'Atividades', to: '/admin/atividades', icon: ClipboardList },
    { label: 'Notas', to: '/admin/notas', icon: Star },
    { label: 'Comunicados', to: '/admin/comunicados', icon: Megaphone },
    { label: 'Configurações', to: '/admin/configuracoes', icon: Settings },
  ],
  teacher: [
    { label: 'Dashboard', to: '/teacher', icon: LayoutDashboard },
    { label: 'Minhas Turmas', to: '/teacher/turmas', icon: School },
    { label: 'Atividades', to: '/teacher/atividades', icon: ClipboardList },
    { label: 'Lançar Notas', to: '/teacher/notas', icon: CalendarCheck2 },
    { label: 'Comunicados', to: '/teacher/comunicados', icon: Megaphone },
  ],
  student: [
    { label: 'Dashboard', to: '/student', icon: LayoutDashboard },
    { label: 'Minhas Disciplinas', to: '/student/disciplinas', icon: Shapes },
    { label: 'Atividades', to: '/student/atividades', icon: ClipboardList },
    { label: 'Minhas Notas', to: '/student/notas', icon: Star },
    { label: 'Comunicados', to: '/student/comunicados', icon: Megaphone },
  ],
}

export const getPageTitle = (pathname: string, role: UserRole): string => {
  const selected = menuByRole[role].find((item) => item.to === pathname)
  return selected?.label ?? 'SystemSchool'
}
