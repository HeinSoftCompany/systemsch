import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { activitiesService } from '../../services/activitiesService'
import { classesService } from '../../services/classesService'
import { studentsService } from '../../services/studentsService'
import { subjectsService } from '../../services/subjectsService'
import { teachersService } from '../../services/teachersService'
import type { TableRow } from '../../types/database'

type Activity = TableRow<'activities'>
type SchoolClass = TableRow<'classes'>
type Subject = TableRow<'subjects'>
type Teacher = TableRow<'teachers'>
type Student = TableRow<'students'>

const statusLabel: Record<Activity['status'], string> = {
  draft: 'Rascunho',
  open: 'Aberta',
  closed: 'Encerrada',
}

export const StudentActivities = () => {
  const { user } = useAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setErrorMessage(null)
      try {
        const [activitiesData, classesData, subjectsData, teachersData, studentsData] = await Promise.all([
          activitiesService.getAll(),
          classesService.getAll(),
          subjectsService.getAll(),
          teachersService.getAll(),
          studentsService.getAll(),
        ])
        const currentStudent =
          studentsData.find((item) => item.email.toLowerCase() === (user?.email ?? '').toLowerCase()) ?? null
        if (!currentStudent) {
          setErrorMessage('Aluno nao encontrado para o usuario logado.')
        }
        setStudent(currentStudent)
        setActivities(activitiesData)
        setClasses(classesData)
        setSubjects(subjectsData)
        setTeachers(teachersData)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Erro ao carregar atividades.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const classById = useMemo(() => new Map(classes.map((item) => [item.id, item.name])), [classes])
  const subjectById = useMemo(() => new Map(subjects.map((item) => [item.id, item.name])), [subjects])
  const teacherById = useMemo(() => new Map(teachers.map((item) => [item.id, item.name])), [teachers])

  const visibleActivities = useMemo(() => {
    if (!student) return []
    return activities.filter((item) => classById.get(item.class_id) === student.class_name)
  }, [activities, classById, student])

  return (
    <section style={{ display: 'grid', gap: '16px' }}>
      <h2 style={{ margin: 0 }}>Minhas Atividades</h2>
      {errorMessage ? <p style={{ color: '#dc2626', margin: 0 }}>{errorMessage}</p> : null}

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ padding: '16px' }}>Carregando atividades...</p>
        ) : visibleActivities.length === 0 ? (
          <p style={{ padding: '16px' }}>Nenhuma atividade encontrada para sua turma.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '920px' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Titulo</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Descricao</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Disciplina</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Professor</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Bimestre</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Entrega</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Valor</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleActivities.map((item) => (
                <tr key={item.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px' }}>{item.title}</td>
                  <td style={{ padding: '10px' }}>{item.description ?? '-'}</td>
                  <td style={{ padding: '10px' }}>{subjectById.get(item.subject_id) ?? '-'}</td>
                  <td style={{ padding: '10px' }}>{teacherById.get(item.teacher_id) ?? '-'}</td>
                  <td style={{ padding: '10px' }}>{item.bimester}º</td>
                  <td style={{ padding: '10px' }}>{item.due_date ?? '-'}</td>
                  <td style={{ padding: '10px' }}>{item.max_score}</td>
                  <td style={{ padding: '10px' }}>{statusLabel[item.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
