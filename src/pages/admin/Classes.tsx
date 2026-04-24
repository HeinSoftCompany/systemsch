import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { classesService } from '../../services/classesService'
import type { SchoolShift } from '../../types/school'
import type { UserStatus } from '../../types/auth'
import type { TableInsert, TableRow, TableUpdate } from '../../types/database'

type SchoolClass = TableRow<'classes'>
type SchoolClassInsert = TableInsert<'classes'>
type SchoolClassUpdate = TableUpdate<'classes'>

const initialForm: SchoolClassInsert = {
  name: '',
  grade_year: '',
  shift: 'morning',
  school_year: new Date().getFullYear(),
  classroom: '',
  status: 'active',
}

export const Classes = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<SchoolClassInsert>(initialForm)

  const loadClasses = async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const data = await classesService.getAll()
      setClasses(data)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao carregar turmas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadClasses()
  }, [])

  const filteredClasses = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return classes

    return classes.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.grade_year.toLowerCase().includes(term) ||
        String(item.school_year).includes(term) ||
        item.classroom.toLowerCase().includes(term),
    )
  }, [classes, search])

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

  const openEditForm = (schoolClass: SchoolClass) => {
    setFormData({
      name: schoolClass.name,
      grade_year: schoolClass.grade_year,
      shift: schoolClass.shift,
      school_year: schoolClass.school_year,
      classroom: schoolClass.classroom,
      status: schoolClass.status,
    })
    setEditingId(schoolClass.id)
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    resetForm()
  }

  const setField = <K extends keyof SchoolClassInsert>(field: K, value: SchoolClassInsert[K]) => {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      if (editingId) {
        const payload: SchoolClassUpdate = { ...formData }
        await classesService.update(editingId, payload)
        setSuccessMessage('Turma atualizada com sucesso.')
      } else {
        await classesService.create(formData)
        setSuccessMessage('Turma criada com sucesso.')
      }

      closeForm()
      await loadClasses()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel salvar a turma.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja realmente excluir esta turma?')) return

    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      await classesService.remove(id)
      setSuccessMessage('Turma excluida com sucesso.')
      await loadClasses()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel excluir a turma.')
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
          <h2 style={{ margin: 0 }}>Gestao de Turmas</h2>
          <p style={{ margin: '6px 0 0', color: '#4b5563' }}>
            Cadastre, edite e organize as turmas da escola.
          </p>
        </div>
        <button type="button" onClick={openCreateForm}>
          Nova turma
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
        <label htmlFor="search-classes">Buscar turmas</label>
        <input
          id="search-classes"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nome, serie/ano, ano letivo ou sala"
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
          <h3 style={{ margin: 0 }}>{editingId ? 'Editar turma' : 'Nova turma'}</h3>

          <input
            placeholder="Nome da turma"
            value={formData.name}
            onChange={(event) => setField('name', event.target.value)}
            required
          />
          <input
            placeholder="Serie/Ano"
            value={formData.grade_year}
            onChange={(event) => setField('grade_year', event.target.value)}
            required
          />
          <select
            value={formData.shift}
            onChange={(event) => setField('shift', event.target.value as SchoolShift)}
            required
          >
            <option value="morning">Manha</option>
            <option value="afternoon">Tarde</option>
            <option value="evening">Noite</option>
            <option value="full_time">Integral</option>
          </select>
          <input
            type="number"
            placeholder="Ano letivo"
            value={formData.school_year}
            onChange={(event) => setField('school_year', Number(event.target.value))}
            required
          />
          <input
            placeholder="Sala"
            value={formData.classroom}
            onChange={(event) => setField('classroom', event.target.value)}
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
          <p style={{ padding: '16px' }}>Carregando turmas...</p>
        ) : filteredClasses.length === 0 ? (
          <p style={{ padding: '16px' }}>Nenhuma turma encontrada.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Nome da turma</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Serie/Ano</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Turno</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Ano letivo</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Sala</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map((item) => (
                <tr key={item.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px' }}>{item.name}</td>
                  <td style={{ padding: '10px' }}>{item.grade_year}</td>
                  <td style={{ padding: '10px' }}>{item.shift}</td>
                  <td style={{ padding: '10px' }}>{item.school_year}</td>
                  <td style={{ padding: '10px' }}>{item.classroom}</td>
                  <td style={{ padding: '10px' }}>{item.status === 'active' ? 'Ativa' : 'Inativa'}</td>
                  <td style={{ padding: '10px', display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => openEditForm(item)}>
                      Editar
                    </button>
                    <button type="button" onClick={() => void handleDelete(item.id)}>
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
