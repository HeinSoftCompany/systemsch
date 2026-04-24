import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { announcementsService } from '../../services/announcementsService'
import { classesService } from '../../services/classesService'
import { studentsService } from '../../services/studentsService'
import type { TableRow } from '../../types/database'

type Announcement = TableRow<'announcements'>
type SchoolClass = TableRow<'classes'>
type Student = TableRow<'students'>

export const StudentAnnouncements = () => {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setErrorMessage(null)
      try {
        const [announcementsData, classesData, studentsData] = await Promise.all([
          announcementsService.getAll(),
          classesService.getAll(),
          studentsService.getAll(),
        ])
        const currentStudent =
          studentsData.find((item) => item.email.toLowerCase() === (user?.email ?? '').toLowerCase()) ?? null
        if (!currentStudent) {
          setErrorMessage('Aluno nao encontrado para o usuario logado.')
        }
        setAnnouncements(announcementsData)
        setClasses(classesData)
        setStudent(currentStudent)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Erro ao carregar comunicados.')
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [])

  const classById = useMemo(() => new Map(classes.map((item) => [item.id, item.name])), [classes])

  const visibleAnnouncements = useMemo(() => {
    if (!student) return []
    return announcements.filter((item) => {
      if (item.audience === 'all') return true
      if (item.audience === 'class' && item.class_id) {
        return classById.get(item.class_id) === student.class_name
      }
      return false
    })
  }, [announcements, classById, student])

  return (
    <section style={{ display: 'grid', gap: '16px' }}>
      <h2 style={{ margin: 0 }}>Comunicados</h2>
      {errorMessage ? <p style={{ color: '#dc2626', margin: 0 }}>{errorMessage}</p> : null}

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ padding: '16px' }}>Carregando comunicados...</p>
        ) : visibleAnnouncements.length === 0 ? (
          <p style={{ padding: '16px' }}>Nenhum comunicado disponivel.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '840px' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Titulo</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Mensagem</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Publico</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Turma</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Autor</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Publicacao</th>
              </tr>
            </thead>
            <tbody>
              {visibleAnnouncements.map((item) => (
                <tr key={item.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px' }}>{item.title}</td>
                  <td style={{ padding: '10px' }}>{item.content}</td>
                  <td style={{ padding: '10px' }}>{item.audience === 'all' ? 'Geral' : 'Turma'}</td>
                  <td style={{ padding: '10px' }}>{item.class_id ? classById.get(item.class_id) ?? '-' : '-'}</td>
                  <td style={{ padding: '10px' }}>{item.author_profile_id}</td>
                  <td style={{ padding: '10px' }}>{item.published_at ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
