import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { announcementsService } from '../../services/announcementsService'
import { classesService } from '../../services/classesService'
import type { AnnouncementAudience } from '../../types/school'
import type { TableInsert, TableRow } from '../../types/database'

type Announcement = TableRow<'announcements'>
type SchoolClass = TableRow<'classes'>
type AnnouncementInsert = TableInsert<'announcements'>

const audienceLabel: Record<AnnouncementAudience, string> = {
  all: 'Geral',
  teachers: 'Professores',
  students: 'Alunos',
  class: 'Turma',
}

export const Announcements = () => {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState<AnnouncementInsert>({
    title: '',
    content: '',
    audience: 'all',
    class_id: null,
    author_profile_id: user?.id ?? '',
    published_at: new Date().toISOString().slice(0, 10),
  })

  const loadData = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const [announcementsData, classesData] = await Promise.all([
        announcementsService.getAll(),
        classesService.getAll(),
      ])
      setAnnouncements(announcementsData)
      setClasses(classesData)
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

  const classById = useMemo(() => new Map(classes.map((item) => [item.id, item.name])), [classes])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const payload: AnnouncementInsert = {
        ...formData,
        class_id: formData.audience === 'class' ? formData.class_id : null,
      }
      await announcementsService.create(payload)
      setSuccessMessage('Comunicado criado com sucesso.')
      setFormData({
        title: '',
        content: '',
        audience: 'all',
        class_id: null,
        author_profile_id: user?.id ?? '',
        published_at: new Date().toISOString().slice(0, 10),
      })
      await loadData()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel criar comunicado.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section style={{ display: 'grid', gap: '16px' }}>
      <h2 style={{ margin: 0 }}>Comunicados (Admin)</h2>
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
          value={formData.audience}
          onChange={(event) =>
            setFormData((c) => ({ ...c, audience: event.target.value as AnnouncementAudience, class_id: null }))
          }
        >
          <option value="all">Geral</option>
          <option value="teachers">Professores</option>
          <option value="students">Alunos</option>
          <option value="class">Turma especifica</option>
        </select>
        {formData.audience === 'class' ? (
          <select
            value={formData.class_id ?? ''}
            onChange={(event) => setFormData((c) => ({ ...c, class_id: event.target.value || null }))}
            required
          >
            <option value="">Selecione a turma</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        ) : null}
        <input value={user?.user_metadata?.full_name ?? user?.email ?? 'Admin'} readOnly />
        <input
          type="date"
          value={formData.published_at ?? ''}
          onChange={(event) => setFormData((c) => ({ ...c, published_at: event.target.value }))}
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Publicando...' : 'Publicar comunicado'}
        </button>
      </form>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ padding: '16px' }}>Carregando comunicados...</p>
        ) : announcements.length === 0 ? (
          <p style={{ padding: '16px' }}>Nenhum comunicado cadastrado.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '920px' }}>
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
              {announcements.map((item) => (
                <tr key={item.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px' }}>{item.title}</td>
                  <td style={{ padding: '10px' }}>{item.content}</td>
                  <td style={{ padding: '10px' }}>{audienceLabel[item.audience]}</td>
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
