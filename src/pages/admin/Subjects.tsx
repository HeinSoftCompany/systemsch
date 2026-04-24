import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { subjectsService } from '../../services/subjectsService'
import type { UserStatus } from '../../types/auth'
import type { TableInsert, TableRow, TableUpdate } from '../../types/database'

type Subject = TableRow<'subjects'>
type SubjectInsert = TableInsert<'subjects'>
type SubjectUpdate = TableUpdate<'subjects'>

const initialForm: SubjectInsert = {
  name: '',
  description: '',
  workload_hours: 0,
  status: 'active',
}

export const Subjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<SubjectInsert>(initialForm)

  const loadSubjects = async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const data = await subjectsService.getAll()
      setSubjects(data)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao carregar disciplinas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadSubjects()
  }, [])

  const filteredSubjects = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return subjects

    return subjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(term) || subject.description.toLowerCase().includes(term),
    )
  }, [search, subjects])

  const resetForm = () => {
    setFormData(initialForm)
    setEditingId(null)
  }

  const openCreateForm = () => {
    resetForm()
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsFormOpen(true)
  }

  const openEditForm = (subject: Subject) => {
    setFormData({
      name: subject.name,
      description: subject.description,
      workload_hours: subject.workload_hours,
      status: subject.status,
    })
    setEditingId(subject.id)
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    resetForm()
  }

  const setField = <K extends keyof SubjectInsert>(field: K, value: SubjectInsert[K]) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      if (editingId) {
        const payload: SubjectUpdate = { ...formData }
        await subjectsService.update(editingId, payload)
        setSuccessMessage('Disciplina atualizada com sucesso.')
      } else {
        await subjectsService.create(formData)
        setSuccessMessage('Disciplina criada com sucesso.')
      }

      closeForm()
      await loadSubjects()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel salvar a disciplina.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir esta disciplina?')) return

    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await subjectsService.remove(id)
      setSuccessMessage('Disciplina excluida com sucesso.')
      await loadSubjects()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel excluir a disciplina.')
    }
  }

  return (
    <section style={{ display: 'grid', gap: '16px' }}>
      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Gestao de Disciplinas</h2>
          <p style={{ margin: '6px 0 0', color: '#4b5563' }}>
            Cadastre, edite e organize as disciplinas da escola.
          </p>
        </div>
        <button type="button" onClick={openCreateForm}>
          Nova disciplina
        </button>
      </header>

      {errorMessage ? <p style={{ color: '#dc2626', margin: 0 }}>{errorMessage}</p> : null}
      {successMessage ? <p style={{ color: '#166534', margin: 0 }}>{successMessage}</p> : null}

      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '16px',
        }}
      >
        <label htmlFor="search-subjects">Buscar disciplinas</label>
        <input
          id="search-subjects"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nome ou descricao"
          style={{ width: '100%', marginTop: '6px' }}
        />
      </div>

      {isFormOpen ? (
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'grid',
            gap: '10px',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px',
          }}
        >
          <h3 style={{ margin: 0 }}>{editingId ? 'Editar disciplina' : 'Nova disciplina'}</h3>

          <input
            placeholder="Nome"
            value={formData.name}
            onChange={(event) => setField('name', event.target.value)}
            required
          />
          <textarea
            placeholder="Descricao"
            value={formData.description}
            onChange={(event) => setField('description', event.target.value)}
            rows={3}
            required
          />
          <input
            type="number"
            min={0}
            placeholder="Carga horaria"
            value={formData.workload_hours}
            onChange={(event) => setField('workload_hours', Number(event.target.value))}
            required
          />
          <select
            value={formData.status}
            onChange={(event) => setField('status', event.target.value as UserStatus)}
            required
          >
            <option value="active">Ativa</option>
            <option value="inactive">Inativa</option>
          </select>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" onClick={closeForm} disabled={submitting}>
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          overflowX: 'auto',
        }}
      >
        {loading ? (
          <p style={{ padding: '16px' }}>Carregando disciplinas...</p>
        ) : filteredSubjects.length === 0 ? (
          <p style={{ padding: '16px' }}>Nenhuma disciplina encontrada.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '820px' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Nome</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Descricao</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Carga horaria</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((subject) => (
                <tr key={subject.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px' }}>{subject.name}</td>
                  <td style={{ padding: '10px' }}>{subject.description}</td>
                  <td style={{ padding: '10px' }}>{subject.workload_hours}h</td>
                  <td style={{ padding: '10px' }}>{subject.status === 'active' ? 'Ativa' : 'Inativa'}</td>
                  <td style={{ padding: '10px', display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => openEditForm(subject)}>
                      Editar
                    </button>
                    <button type="button" onClick={() => void handleDelete(subject.id)}>
                      Excluir
                    </button>
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
