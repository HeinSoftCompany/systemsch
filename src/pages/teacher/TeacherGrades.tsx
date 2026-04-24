import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { classesService } from '../../services/classesService'
import { gradesService } from '../../services/gradesService'
import { studentsService } from '../../services/studentsService'
import { subjectsService } from '../../services/subjectsService'
import { teachersService } from '../../services/teachersService'
import type { TableInsert, TableRow, TableUpdate } from '../../types/database'
import { calculateFinalAverage } from '../../utils/calculateGrades'

type SchoolClass = TableRow<'classes'>
type Subject = TableRow<'subjects'>
type Student = TableRow<'students'>
type Grade = TableRow<'grades'>
type Teacher = TableRow<'teachers'>
type GradeInsert = TableInsert<'grades'>
type GradeUpdate = TableUpdate<'grades'>
type Bimester = GradeInsert['bimester']

const BIMESTERS: Bimester[] = [1, 2, 3, 4]
const getResultLabel = (result: Grade['result']): string => {
  if (result === 'approved') return 'Aprovado'
  if (result === 'recovery') return 'Recuperacao'
  if (result === 'failed') return 'Reprovado'
  return '-'
}

export const TeacherGrades = () => {
  const { user } = useAuth()
  const [allClasses, setAllClasses] = useState<SchoolClass[]>([])
  const [allSubjects, setAllSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [selectedBimester, setSelectedBimester] = useState<Bimester>(1)
  const [gradeInputs, setGradeInputs] = useState<Record<string, string>>({})
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadBaseData = async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      const [teachersData, classesData, subjectsData, studentsData, gradesData] = await Promise.all([
        teachersService.getAll(),
        classesService.getAll(),
        subjectsService.getAll(),
        studentsService.getAll(),
        gradesService.getAll(),
      ])

      const currentTeacher =
        teachersData.find((item) => item.email.toLowerCase() === (user?.email ?? '').toLowerCase()) ?? null

      if (!currentTeacher) {
        setErrorMessage('Professor nao encontrado para o usuario logado.')
      }

      setTeacher(currentTeacher)
      setAllClasses(classesData)
      setAllSubjects(subjectsData)
      setStudents(studentsData)
      setGrades(gradesData)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erro ao carregar dados de notas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadBaseData()
  }, [])

  const availableClasses = useMemo(() => {
    if (!teacher) return []
    const allowed = new Set(teacher.linked_classes.map((item) => item.toLowerCase()))
    return allClasses.filter(
      (item) => allowed.has(item.id.toLowerCase()) || allowed.has(item.name.toLowerCase()),
    )
  }, [allClasses, teacher])

  const availableSubjects = useMemo(() => {
    if (!teacher) return []
    const allowed = new Set(teacher.linked_subjects.map((item) => item.toLowerCase()))
    return allSubjects.filter(
      (item) => allowed.has(item.id.toLowerCase()) || allowed.has(item.name.toLowerCase()),
    )
  }, [allSubjects, teacher])

  const selectedClass = useMemo(
    () => availableClasses.find((item) => item.id === selectedClassId) ?? null,
    [availableClasses, selectedClassId],
  )

  const classStudents = useMemo(() => {
    if (!selectedClass) return []
    return students.filter((student) => student.class_name === selectedClass.name)
  }, [students, selectedClass])

  const gradesByStudent = useMemo(() => {
    const map = new Map<string, Grade[]>()
    for (const grade of grades) {
      if (grade.class_id !== selectedClassId || grade.subject_id !== selectedSubjectId) continue
      const current = map.get(grade.student_id) ?? []
      current.push(grade)
      map.set(grade.student_id, current)
    }
    return map
  }, [grades, selectedClassId, selectedSubjectId])

  useEffect(() => {
    const nextInputs: Record<string, string> = {}
    for (const student of classStudents) {
      const current = gradesByStudent
        .get(student.id)
        ?.find((grade) => grade.bimester === selectedBimester)?.value
      nextInputs[student.id] = current != null ? String(current) : ''
    }
    setGradeInputs(nextInputs)
  }, [classStudents, gradesByStudent, selectedBimester])

  const saveStudentGrade = async (studentId: string) => {
    if (!selectedClassId || !selectedSubjectId) {
      setErrorMessage('Selecione turma e disciplina antes de salvar.')
      return
    }

    const rawValue = gradeInputs[studentId]
    const numericValue = Number(rawValue)
    if (!rawValue || Number.isNaN(numericValue) || numericValue < 0 || numericValue > 10) {
      setErrorMessage('A nota deve ser um numero entre 0 e 10.')
      return
    }

    setSavingStudentId(studentId)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const existingGrade = gradesByStudent
        .get(studentId)
        ?.find((grade) => grade.bimester === selectedBimester)

      let updatedGrades = [...(gradesByStudent.get(studentId) ?? [])]
      if (existingGrade) {
        updatedGrades = updatedGrades.map((grade) =>
          grade.id === existingGrade.id ? { ...grade, value: numericValue } : grade,
        )
      } else {
        updatedGrades.push({
          id: '__temp__',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          student_id: studentId,
          subject_id: selectedSubjectId,
          class_id: selectedClassId,
          bimester: selectedBimester,
          value: numericValue,
          result: null,
        })
      }

      const summary = calculateFinalAverage(updatedGrades.map((grade) => grade.value))

      if (existingGrade) {
        const payload: GradeUpdate = { value: numericValue, result: summary.result }
        await gradesService.update(existingGrade.id, payload)
      } else {
        const payload: GradeInsert = {
          student_id: studentId,
          subject_id: selectedSubjectId,
          class_id: selectedClassId,
          bimester: selectedBimester,
          value: numericValue,
          result: summary.result,
        }
        await gradesService.create(payload)
      }

      setSuccessMessage('Nota salva com sucesso.')
      await loadBaseData()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel salvar a nota.')
    } finally {
      setSavingStudentId(null)
    }
  }

  return (
    <section style={{ display: 'grid', gap: '16px' }}>
      <h2 style={{ margin: 0 }}>Lancamento de Notas (Professor)</h2>

      {errorMessage ? <p style={{ color: '#dc2626', margin: 0 }}>{errorMessage}</p> : null}
      {successMessage ? <p style={{ color: '#166534', margin: 0 }}>{successMessage}</p> : null}

      <div style={{ display: 'grid', gap: '10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
        <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} disabled={!teacher}>
          <option value="">Selecione a turma</option>
          {availableClasses.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <select value={selectedSubjectId} onChange={(event) => setSelectedSubjectId(event.target.value)} disabled={!teacher}>
          <option value="">Selecione a disciplina</option>
          {availableSubjects.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <select value={selectedBimester} onChange={(event) => setSelectedBimester(Number(event.target.value) as Bimester)}>
          {BIMESTERS.map((bimester) => (
            <option key={bimester} value={bimester}>
              {bimester}º Bimestre
            </option>
          ))}
        </select>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ padding: '16px' }}>Carregando...</p>
        ) : !selectedClassId || !selectedSubjectId ? (
          <p style={{ padding: '16px' }}>Selecione turma e disciplina para lancar notas.</p>
        ) : classStudents.length === 0 ? (
          <p style={{ padding: '16px' }}>Nenhum aluno encontrado para a turma selecionada.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '860px' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ textAlign: 'left', padding: '10px' }}>Aluno</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Matrícula</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Nota ({selectedBimester}º)</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Média final</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Situação</th>
                <th style={{ textAlign: 'left', padding: '10px' }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((student) => {
                const studentGrades = gradesByStudent.get(student.id) ?? []
                const summary = calculateFinalAverage(studentGrades.map((grade) => grade.value))

                return (
                  <tr key={student.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px' }}>{student.name}</td>
                    <td style={{ padding: '10px' }}>{student.registration_number}</td>
                    <td style={{ padding: '10px' }}>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step="0.1"
                        value={gradeInputs[student.id] ?? ''}
                        onChange={(event) =>
                          setGradeInputs((current) => ({ ...current, [student.id]: event.target.value }))
                        }
                      />
                    </td>
                    <td style={{ padding: '10px' }}>{summary.average.toFixed(2)}</td>
                    <td style={{ padding: '10px' }}>{getResultLabel(summary.result)}</td>
                    <td style={{ padding: '10px' }}>
                      <button type="button" onClick={() => void saveStudentGrade(student.id)} disabled={savingStudentId === student.id}>
                        {savingStudentId === student.id ? 'Salvando...' : 'Salvar'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
