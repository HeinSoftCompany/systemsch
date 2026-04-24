import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { activitiesService } from '../../services/activitiesService'
import { classesService } from '../../services/classesService'
import { subjectsService } from '../../services/subjectsService'
import { teachersService } from '../../services/teachersService'
import type { ActivityStatus, Bimester } from '../../types/school'
import type { TableInsert, TableRow, TableUpdate } from '../../types/database'

type Activity = TableRow<'activities'>
type SchoolClass = TableRow<'classes'>
type Subject = TableRow<'subjects'>
type Teacher = TableRow<'teachers'>
type ActivityInsert = TableInsert<'activities'>
type ActivityUpdate = TableUpdate<'activities'>

const initialForm = (teacherId: string): ActivityInsert => ({
  title: '',
  description: '',
  class_id: '',
  subject_id: '',
  teacher_id: teacherId,
  bimester: 1,
  due_date: '',
  max_score: 10,
  status: 'draft',
})

export const TeacherActivities = () => {
  const { user } = useAuth()
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<ActivityInsert | null>(null)

  const loadData = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const [teachersData, activitiesData, classesData, subjectsData] = await Promise.all([
        teachersService.getAll(),
        activitiesService.getAll(),
        classesService.getAll(),
        subjectsService.getAll(),
      ])
      const currentTeacher =
        teachersData.find((item) => item.email.toLowerCase() === (user?.email ?? '').toLowerCase()) ?? null

      if (!currentTeacher) {
        setErrorMessage('Professor nao encontrado para o usuario logado.')
      }

      setTeacher(currentTeacher)
      setClasses(classesData)
      setSubjects(subjectsData)
      setActivities(activitiesData)
      setFormData(currentTeacher ? initialForm(currentTeacher.id) : null)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao carregar atividades.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const availableClasses = useMemo(() => {
    if (!teacher) return []
    const allowed = new Set(teacher.linked_classes.map((item) => item.toLowerCase()))
    return classes.filter((item) => allowed.has(item.id.toLowerCase()) || allowed.has(item.name.toLowerCase()))
  }, [classes, teacher])

  const availableSubjects = useMemo(() => {
    if (!teacher) return []
    const allowed = new Set(teacher.linked_subjects.map((item) => item.toLowerCase()))
    return subjects.filter((item) => allowed.has(item.id.toLowerCase()) || allowed.has(item.name.toLowerCase()))
  }, [subjects, teacher])

  const myActivities = useMemo(() => {
    if (!teacher) return []
    return activities.filter((item) => item.teacher_id === teacher.id)
  }, [activities, teacher])

  const classById = useMemo(() => new Map(classes.map((item) => [item.id, item.name])), [classes])
  const subjectById = useMemo(() => new Map(subjects.map((item) => [item.id, item.name])), [subjects])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return myActivities
    return myActivities.filter((item) => {
      const className = classById.get(item.class_id)?.toLowerCase() ?? ''
      const subjectName = subjectById.get(item.subject_id)?.toLowerCase() ?? ''
      return (
        item.title.toLowerCase().includes(term) ||
        (item.description ?? '').toLowerCase().includes(term) ||
        className.includes(term) ||
        subjectName.includes(term)
      )
    })
  }, [classById, myActivities, search, subjectById])

  const setField = <K extends keyof ActivityInsert>(field: K, value: ActivityInsert[K]) => {
    setFormData((current) => (current ? { ...current, [field]: value } : current))
  }

  const openCreate = () => {
    if (!teacher) return
    setFormData(initialForm(teacher.id))
    setEditingId(null)
    setIsFormOpen(true)
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const openEdit = (activity: Activity) => {
    setFormData({
      title: activity.title,
      description: activity.description ?? '',
      class_id: activity.class_id,
      subject_id: activity.subject_id,
      teacher_id: activity.teacher_id,
      bimester: activity.bimester,
      due_date: activity.due_date ?? '',
      max_score: activity.max_score,
      status: activity.status,
    })
    setEditingId(activity.id)
    setIsFormOpen(true)
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingId(null)
    if (teacher) setFormData(initialForm(teacher.id))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formData || !teacher) return
    setSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const payload = { ...formData, teacher_id: teacher.id }
      if (editingId) {
        const updatePayload: ActivityUpdate = payload
        await activitiesService.update(editingId, updatePayload)
        setSuccessMessage('Atividade atualizada com sucesso.')
      } else {
        await activitiesService.create(payload)
        setSuccessMessage('Atividade criada com sucesso.')
      }
      closeForm()
      await loadData()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel salvar atividade.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir esta atividade?')) return
    try {
      await activitiesService.remove(id)
      setSuccessMessage('Atividade excluida com sucesso.')
      await loadData()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel excluir atividade.')
    }
  }

  return (
    <section style={{ display: 'grid', gap: '16px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Atividades (Professor)</h2>
        <button type="button" onClick={openCreate} disabled={!teacher}>
          Nova atividade
        </button>
      </header>

      {errorMessage ? <p style={{ color: '#dc2626', margin: 0 }}>{errorMessage}</p> : null}
      {successMessage ? <p style={{ color: '#166534', margin: 0 }}>{successMessage}</p> : null}

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
        <label htmlFor="search-teacher-activities">Buscar atividades</label>
        <input
          id="search-teacher-activities"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Titulo, descricao, turma ou disciplina"
          style={{ width: '100%', marginTop: '6px' }}
        />
      </div>

      {isFormOpen && formData ? (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
          <h3 style={{ margin: 0 }}>{editingId ? 'Editar atividade' : 'Nova atividade'}</h3>
          <input value={formData.title} onChange={(event) => setField('title', event.target.value)} placeholder="Titulo" required />
          <textarea value={formData.description ?? ''} onChange={(event) => setField('description', event.target.value)} placeholder="Descricao" rows={3} />
          <select value={formData.class_id} onChange={(event) => setField('class_id', event.target.value)} required>
            <option value="">Selecione a turma</option>
            {availableClasses.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <select value={formData.subject_id} onChange={(event) => setField('subject_id', event.target.value)} required>
            <option value="">Selecione a disciplina</option>
            {availableSubjects.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <input value={teacher?.name ?? '-'} readOnly />
          <select value={formData.bimester} onChange={(event) => setField('bimester', Number(event.target.value) as Bimester)} required>
            <option value={1}>1º Bimestre</option><option value={2}>2º Bimestre</option><option value={3}>3º Bimestre</option><option value={4}>4º Bimestre</option>
          </select>
          <input type="date" value={formData.due_date ?? ''} onChange={(event) => setField('due_date', event.target.value)} />
          <input type="number" min={0} step="0.1" value={formData.max_score} onChange={(event) => setField('max_score', Number(event.target.value))} placeholder="Valor" required />
          <select value={formData.status} onChange={(event) => setField('status', event.target.value as ActivityStatus)} required>
            <option value="draft">Rascunho</option><option value="open">Aberta</option><option value="closed">Encerrada</option>
          </select>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</button>
            <button type="button" onClick={closeForm} disabled={submitting}>Cancelar</button>
          </div>
        </form>
      ) : null}

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ padding: '16px' }}>Carregando atividades...</p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: '16px' }}>Nenhuma atividade encontrada.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '980px' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Titulo</th><th style={{ textAlign: 'left', padding: '10px' }}>Turma</th><th style={{ textAlign: 'left', padding: '10px' }}>Disciplina</th><th style={{ textAlign: 'left', padding: '10px' }}>Bimestre</th><th style={{ textAlign: 'left', padding: '10px' }}>Entrega</th><th style={{ textAlign: 'left', padding: '10px' }}>Valor</th><th style={{ textAlign: 'left', padding: '10px' }}>Status</th><th style={{ textAlign: 'left', padding: '10px' }}>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px' }}>{item.title}</td>
                  <td style={{ padding: '10px' }}>{classById.get(item.class_id) ?? '-'}</td>
                  <td style={{ padding: '10px' }}>{subjectById.get(item.subject_id) ?? '-'}</td>
                  <td style={{ padding: '10px' }}>{item.bimester}º</td>
                  <td style={{ padding: '10px' }}>{item.due_date ?? '-'}</td>
                  <td style={{ padding: '10px' }}>{item.max_score}</td>
                  <td style={{ padding: '10px' }}>{item.status}</td>
                  <td style={{ padding: '10px', display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => openEdit(item)}>Editar</button>
                    <button type="button" onClick={() => void handleDelete(item.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
