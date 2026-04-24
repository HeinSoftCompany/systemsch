import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { announcementsService } from '../../services/announcementsService'
import { classesService } from '../../services/classesService'
import { teachersService } from '../../services/teachersService'
import type { TableInsert, TableRow } from '../../types/database'

type Announcement = TableRow<'announcements'>
type SchoolClass = TableRow<'classes'>
type Teacher = TableRow<'teachers'>
type AnnouncementInsert = TableInsert<'announcements'>

export const TeacherAnnouncements = () => {
  const { user } = useAuth()
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState<AnnouncementInsert>({
    title: '',
    content: '',
    audience: 'class',
    class_id: null,
    author_profile_id: user?.id ?? '',
    published_at: new Date().toISOString().slice(0, 10),
  })

  const loadData = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const [teachersData, classesData, announcementsData] = await Promise.all([
        teachersService.getAll(),
        classesService.getAll(),
        announcementsService.getAll(),
      ])

      const currentTeacher =
        teachersData.find((item) => item.email.toLowerCase() === (user?.email ?? '').toLowerCase()) ?? null
      if (!currentTeacher) {
        setErrorMessage('Professor nao encontrado para o usuario logado.')
      }
      setTeacher(currentTeacher)
      setClasses(classesData)
      setAnnouncements(announcementsData)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao carregar comunicados.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  useEffect(() => {
    setFormData((current) => ({ ...current, author_profile_id: user?.id ?? '' }))
  }, [user?.id])

  const availableClasses = useMemo(() => {
    if (!teacher) return []
    const allowed = new Set(teacher.linked_classes.map((item) => item.toLowerCase()))
    return classes.filter((item) => allowed.has(item.id.toLowerCase()) || allowed.has(item.name.toLowerCase()))
  }, [classes, teacher])

  const visibleAnnouncements = useMemo(() => {
    if (!teacher) return []
    const classIds = new Set(availableClasses.map((item) => item.id))
    return announcements.filter(
      (item) =>
        item.author_profile_id === user?.id ||
        (item.audience === 'class' && item.class_id && classIds.has(item.class_id)),
    )
  }, [announcements, availableClasses, teacher, user?.id])

  const classById = useMemo(() => new Map(classes.map((item) => [item.id, item.name])), [classes])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formData.class_id) {
      setErrorMessage('Selecione a turma para publicar o comunicado.')
      return
    }
    setSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    try {
      await announcementsService.create({ ...formData, audience: 'class' })
      setSuccessMessage('Comunicado publicado com sucesso.')
      setFormData({
        title: '',
        content: '',
        audience: 'class',
        class_id: null,
        author_profile_id: user?.id ?? '',
        published_at: new Date().toISOString().slice(0, 10),
      })
      await loadData()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel publicar comunicado.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section style={{ display: 'grid', gap: '16px' }}>
      <h2 style={{ margin: 0 }}>Comunicados (Professor)</h2>
      {errorMessage ? <p style={{ color: '#dc2626', margin: 0 }}>{errorMessage}</p> : null}
      {successMessage ? <p style={{ color: '#166534', margin: 0 }}>{successMessage}</p> : null}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
        <input
          placeholder="Titulo"
          value={formData.title}
          onChange={(event) => setFormData((c) => ({ ...c, title: event.target.value }))}
          required
        />
        <textarea
          placeholder="Mensagem"
          rows={4}
          value={formData.content}
          onChange={(event) => setFormData((c) => ({ ...c, content: event.target.value }))}
          required
        />
        <select
          value={formData.class_id ?? ''}
          onChange={(event) => setFormData((c) => ({ ...c, class_id: event.target.value || null }))}
          required
        >
          <option value="">Selecione a turma</option>
          {availableClasses.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <input value={teacher?.name ?? user?.email ?? 'Professor'} readOnly />
        <input
          type="date"
          value={formData.published_at ?? ''}
          onChange={(event) => setFormData((c) => ({ ...c, published_at: event.target.value }))}
          required
        />
        <button type="submit" disabled={submitting || !teacher}>
          {submitting ? 'Publicando...' : 'Publicar comunicado'}
        </button>
      </form>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ padding: '16px' }}>Carregando comunicados...</p>
        ) : visibleAnnouncements.length === 0 ? (
          <p style={{ padding: '16px' }}>Nenhum comunicado encontrado.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '860px' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Titulo</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Mensagem</th>
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
