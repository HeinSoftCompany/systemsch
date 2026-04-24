import { supabase } from '../lib/supabase'
import type { TableInsert, TableRow, TableUpdate } from '../types/database'

type Student = TableRow<'students'>
type StudentInsert = TableInsert<'students'>
type StudentUpdate = TableUpdate<'students'>

const TABLE = 'students'

const toServiceError = (action: string, errorMessage?: string): Error => {
  return new Error(`StudentsService: falha ao ${action}. ${errorMessage ?? 'Tente novamente.'}`)
}

export const studentsService = {
  async getAll(): Promise<Student[]> {
    const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false })

    if (error) throw toServiceError('listar estudantes', error.message)
    return data ?? []
  },

  async getById(id: string): Promise<Student | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle()

    if (error) throw toServiceError('buscar estudante pelo ID', error.message)
    return data
  },

  async create(payload: StudentInsert): Promise<Student> {
    const { data, error } = await supabase.from(TABLE).insert(payload).select('*').single()

    if (error) throw toServiceError('criar estudante', error.message)
    return data
  },

  async update(id: string, payload: StudentUpdate): Promise<Student> {
    const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select('*').single()

    if (error) throw toServiceError('atualizar estudante', error.message)
    return data
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)

    if (error) throw toServiceError('remover estudante', error.message)
  },
}
