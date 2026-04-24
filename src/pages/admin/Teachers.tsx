import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { UserStatus } from '../../types/auth'
import type { TableInsert, TableRow, TableUpdate } from '../../types/database'
import { teachersService } from '../../services/teachersService'

type Teacher = TableRow<'teachers'>
type TeacherInsert = TableInsert<'teachers'>
type TeacherUpdate = TableUpdate<'teachers'>

const initialForm: TeacherInsert = {
  name: '',
  email: '',
  phone: '',
  specialization: '',
  linked_subjects: [],
  linked_classes: [],
  status: 'active',
}

export const Teachers = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<TeacherInsert>(initialForm)
  const [subjectsInput, setSubjectsInput] = useState('')
  const [classesInput, setClassesInput] = useState('')

  const loadTeachers = async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const data = await teachersService.getAll()
      setTeachers(data)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao carregar professores.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadTeachers()
  }, [])

  const filteredTeachers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return teachers

    return teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(term) || teacher.email.toLowerCase().includes(term),
    )
  }, [search, teachers])

  const parseTags = (value: string): string[] =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

  const resetForm = () => {
    setFormData(initialForm)
    setSubjectsInput('')
    setClassesInput('')
    setEditingId(null)
  }

  const openCreateForm = () => {
    resetForm()
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsFormOpen(true)
  }

  const openEditForm = (teacher: Teacher) => {
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      specialization: teacher.specialization,
      linked_subjects: teacher.linked_subjects,
      linked_classes: teacher.linked_classes,
      status: teacher.status,
    })
    setSubjectsInput(teacher.linked_subjects.join(', '))
    setClassesInput(teacher.linked_classes.join(', '))
    setEditingId(teacher.id)
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    resetForm()
  }

  const setField = <K extends keyof TeacherInsert>(field: K, value: TeacherInsert[K]) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const payload: TeacherInsert = {
      ...formData,
      linked_subjects: parseTags(subjectsInput),
      linked_classes: parseTags(classesInput),
    }

    try {
      if (editingId) {
        const updatePayload: TeacherUpdate = { ...payload }
        await teachersService.update(editingId, updatePayload)
        setSuccessMessage('Professor atualizado com sucesso.')
      } else {
        await teachersService.create(payload)
        setSuccessMessage('Professor criado com sucesso.')
      }

      closeForm()
      await loadTeachers()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel salvar o professor.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir este professor?')) return

    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await teachersService.remove(id)
      setSuccessMessage('Professor excluido com sucesso.')
      await loadTeachers()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel excluir o professor.')
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
          <h2 style={{ margin: 0 }}>Gestao de Professores</h2>
          <p style={{ margin: '6px 0 0', color: '#4b5563' }}>
            Cadastre, edite e acompanhe os professores da escola.
          </p>
        </div>
        <button type="button" onClick={openCreateForm}>
          Novo professor
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
        <label htmlFor="search-teachers">Buscar por nome ou e-mail</label>
        <input
          id="search-teachers"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Digite para filtrar professores"
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
          <h3 style={{ margin: 0 }}>{editingId ? 'Editar professor' : 'Novo professor'}</h3>

          <input
            placeholder="Nome"
            value={formData.name}
            onChange={(event) => setField('name', event.target.value)}
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={(event) => setField('email', event.target.value)}
            required
          />
          <input
            placeholder="Telefone"
            value={formData.phone}
            onChange={(event) => setField('phone', event.target.value)}
            required
          />
          <input
            placeholder="Especializacao"
            value={formData.specialization}
            onChange={(event) => setField('specialization', event.target.value)}
            required
          />
          <input
            placeholder="Disciplinas vinculadas (separadas por virgula)"
            value={subjectsInput}
            onChange={(event) => setSubjectsInput(event.target.value)}
          />
          <input
            placeholder="Turmas vinculadas (separadas por virgula)"
            value={classesInput}
            onChange={(event) => setClassesInput(event.target.value)}
          />
          <select
            value={formData.status}
            onChange={(event) => setField('status', event.target.value as UserStatus)}
            required
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
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
          <p style={{ padding: '16px' }}>Carregando professores...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Nome</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>E-mail</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Telefone</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Especializacao</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Disciplinas vinculadas</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Turmas vinculadas</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '14px' }}>
                    Nenhum professor encontrado.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px' }}>{teacher.name}</td>
                    <td style={{ padding: '10px' }}>{teacher.email}</td>
                    <td style={{ padding: '10px' }}>{teacher.phone}</td>
                    <td style={{ padding: '10px' }}>{teacher.specialization}</td>
                    <td style={{ padding: '10px' }}>{teacher.linked_subjects.join(', ') || '-'}</td>
                    <td style={{ padding: '10px' }}>{teacher.linked_classes.join(', ') || '-'}</td>
                    <td style={{ padding: '10px' }}>{teacher.status === 'active' ? 'Ativo' : 'Inativo'}</td>
                    <td style={{ padding: '10px', display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => openEditForm(teacher)}>
                        Editar
                      </button>
                      <button type="button" onClick={() => void handleDelete(teacher.id)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
