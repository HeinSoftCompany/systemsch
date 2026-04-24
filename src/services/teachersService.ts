import { supabase } from '../lib/supabase'
import type { TableInsert, TableRow, TableUpdate } from '../types/database'

type Teacher = TableRow<'teachers'>
type TeacherInsert = TableInsert<'teachers'>
type TeacherUpdate = TableUpdate<'teachers'>

const TABLE = 'teachers'

const toServiceError = (action: string, errorMessage?: string): Error => {
  return new Error(`TeachersService: falha ao ${action}. ${errorMessage ?? 'Tente novamente.'}`)
}

export const teachersService = {
  async getAll(): Promise<Teacher[]> {
    const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false })

    if (error) throw toServiceError('listar professores', error.message)
    return data ?? []
  },

  async getById(id: string): Promise<Teacher | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle()

    if (error) throw toServiceError('buscar professor pelo ID', error.message)
    return data
  },

  async create(payload: TeacherInsert): Promise<Teacher> {
    const { data, error } = await supabase.from(TABLE).insert(payload).select('*').single()

    if (error) throw toServiceError('criar professor', error.message)
    return data
  },

  async update(id: string, payload: TeacherUpdate): Promise<Teacher> {
    const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select('*').single()

    if (error) throw toServiceError('atualizar professor', error.message)
    return data
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)

    if (error) throw toServiceError('remover professor', error.message)
  },
}
