import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { useAuth } from '../hooks/useAuth'
import { Login } from '../pages/auth/Login'
import { AdminDashboard } from '../pages/admin/AdminDashboard'
import { Students } from '../pages/admin/Students'
import { Teachers } from '../pages/admin/Teachers'
import { Classes } from '../pages/admin/Classes'
import { Subjects } from '../pages/admin/Subjects'
import { Grades } from '../pages/admin/Grades'
import { Activities } from '../pages/admin/Activities'
import { Announcements } from '../pages/admin/Announcements'
import { TeacherDashboard } from '../pages/teacher/TeacherDashboard'
import { TeacherGrades } from '../pages/teacher/TeacherGrades'
import { TeacherActivities } from '../pages/teacher/TeacherActivities'
import { TeacherAnnouncements } from '../pages/teacher/TeacherAnnouncements'
import { StudentDashboard } from '../pages/student/StudentDashboard'
import { StudentActivities } from '../pages/student/StudentActivities'
import { StudentAnnouncements } from '../pages/student/StudentAnnouncements'
import { ProtectedRoute } from './ProtectedRoute'
import { SectionPlaceholder } from '../components/dashboard/SectionPlaceholder'

const HomeRedirect = () => {
  const { user, role, loading } = useAuth()

  if (loading) {
    return <p>Carregando...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  if (role === 'teacher') {
    return <Navigate to="/teacher" replace />
  }

  if (role === 'student') {
    return <Navigate to="/student" replace />
  }

  return <Navigate to="/login" replace />
}

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/professores" element={<Teachers />} />
            <Route
              path="/admin/alunos"
              element={<Students />}
            />
            <Route path="/admin/turmas" element={<Classes />} />
            <Route path="/admin/disciplinas" element={<Subjects />} />
            <Route path="/admin/atividades" element={<Activities />} />
            <Route
              path="/admin/notas"
              element={<Grades />}
            />
            <Route
              path="/admin/comunicados"
              element={<Announcements />}
            />
            <Route
              path="/admin/configuracoes"
              element={
                <SectionPlaceholder
                  title="Configurações"
                  description="Área preparada para configurações do sistema."
                />
              }
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route
              path="/teacher/turmas"
              element={
                <SectionPlaceholder
                  title="Minhas Turmas"
                  description="Área preparada para acompanhamento das turmas."
                />
              }
            />
            <Route path="/teacher/atividades" element={<TeacherActivities />} />
            <Route
              path="/teacher/notas"
              element={<TeacherGrades />}
            />
            <Route
              path="/teacher/comunicados"
              element={<TeacherAnnouncements />}
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route
              path="/student/disciplinas"
              element={
                <SectionPlaceholder
                  title="Minhas Disciplinas"
                  description="Área preparada para visualização das disciplinas."
                />
              }
            />
            <Route path="/student/atividades" element={<StudentActivities />} />
            <Route
              path="/student/notas"
              element={
                <SectionPlaceholder
                  title="Minhas Notas"
                  description="Área preparada para consulta de notas."
                />
              }
            />
            <Route
              path="/student/comunicados"
              element={<StudentAnnouncements />}
            />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
