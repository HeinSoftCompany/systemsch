import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { studentsService } from '../../services/studentsService'
import type { TableInsert, TableRow, TableUpdate } from '../../types/database'
import type { UserStatus } from '../../types/auth'

type Student = TableRow<'students'>
type StudentInsert = TableInsert<'students'>
type StudentUpdate = TableUpdate<'students'>

const initialForm: StudentInsert = {
  name: '',
  email: '',
  registration_number: '',
  birth_date: '',
  class_name: '',
  guardian_name: '',
  guardian_phone: '',
  status: 'active',
}

export const Students = () => {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<StudentInsert>(initialForm)

  const loadStudents = async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const data = await studentsService.getAll()
      setStudents(data)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao carregar alunos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadStudents()
  }, [])

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) {
      return students
    }

    return students.filter((student) => {
      return (
        student.name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.registration_number.toLowerCase().includes(term)
      )
    })
  }, [search, students])

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

  const openEditForm = (student: Student) => {
    setFormData({
      name: student.name,
      email: student.email,
      registration_number: student.registration_number,
      birth_date: student.birth_date,
      class_name: student.class_name,
      guardian_name: student.guardian_name,
      guardian_phone: student.guardian_phone,
      status: student.status,
    })
    setEditingId(student.id)
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    resetForm()
  }

  const setField = <K extends keyof StudentInsert>(field: K, value: StudentInsert[K]) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      if (editingId) {
        const payload: StudentUpdate = { ...formData }
        await studentsService.update(editingId, payload)
        setSuccessMessage('Aluno atualizado com sucesso.')
      } else {
        await studentsService.create(formData)
        setSuccessMessage('Aluno criado com sucesso.')
      }

      closeForm()
      await loadStudents()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível salvar o aluno.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Deseja realmente excluir este aluno?')
    if (!confirmed) return

    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await studentsService.remove(id)
      setSuccessMessage('Aluno excluído com sucesso.')
      await loadStudents()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível excluir o aluno.')
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
          <h2 style={{ margin: 0 }}>Gestão de Alunos</h2>
          <p style={{ margin: '6px 0 0', color: '#4b5563' }}>
            Cadastre, edite e acompanhe os alunos da escola.
          </p>
        </div>
        <button type="button" onClick={openCreateForm}>
          Novo aluno
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
        <label htmlFor="search-students">Buscar por nome, e-mail ou matrícula</label>
        <input
          id="search-students"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Digite para filtrar alunos"
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
          <h3 style={{ margin: 0 }}>{editingId ? 'Editar aluno' : 'Novo aluno'}</h3>

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
            placeholder="Matrícula"
            value={formData.registration_number}
            onChange={(event) => setField('registration_number', event.target.value)}
            required
          />
          <input
            type="date"
            placeholder="Data de nascimento"
            value={formData.birth_date}
            onChange={(event) => setField('birth_date', event.target.value)}
            required
          />
          <input
            placeholder="Turma"
            value={formData.class_name}
            onChange={(event) => setField('class_name', event.target.value)}
            required
          />
          <input
            placeholder="Responsável"
            value={formData.guardian_name}
            onChange={(event) => setField('guardian_name', event.target.value)}
            required
          />
          <input
            placeholder="Telefone do responsável"
            value={formData.guardian_phone}
            onChange={(event) => setField('guardian_phone', event.target.value)}
            required
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
          <p style={{ padding: '16px' }}>Carregando alunos...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Nome</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>E-mail</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Matrícula</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Nascimento</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Turma</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Responsável</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Telefone</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '14px' }}>
                    Nenhum aluno encontrado.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px' }}>{student.name}</td>
                    <td style={{ padding: '10px' }}>{student.email}</td>
                    <td style={{ padding: '10px' }}>{student.registration_number}</td>
                    <td style={{ padding: '10px' }}>{student.birth_date}</td>
                    <td style={{ padding: '10px' }}>{student.class_name}</td>
                    <td style={{ padding: '10px' }}>{student.guardian_name}</td>
                    <td style={{ padding: '10px' }}>{student.guardian_phone}</td>
                    <td style={{ padding: '10px' }}>{student.status === 'active' ? 'Ativo' : 'Inativo'}</td>
                    <td style={{ padding: '10px', display: 'flex', gap: '8px' }}>
                      <button type="button" onClick={() => openEditForm(student)}>
                        Editar
                      </button>
                      <button type="button" onClick={() => void handleDelete(student.id)}>
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
