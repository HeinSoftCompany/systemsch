import { supabase } from '../lib/supabase'
import type { TableInsert, TableRow, TableUpdate } from '../types/database'

type Grade = TableRow<'grades'>
type GradeInsert = TableInsert<'grades'>
type GradeUpdate = TableUpdate<'grades'>

const TABLE = 'grades'

const toServiceError = (action: string, errorMessage?: string): Error => {
  return new Error(`GradesService: falha ao ${action}. ${errorMessage ?? 'Tente novamente.'}`)
}

export const gradesService = {
  async getAll(): Promise<Grade[]> {
    const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false })

    if (error) throw toServiceError('listar notas', error.message)
    return data ?? []
  },

  async getById(id: string): Promise<Grade | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle()

    if (error) throw toServiceError('buscar nota pelo ID', error.message)
    return data
  },

  async create(payload: GradeInsert): Promise<Grade> {
    const { data, error } = await supabase.from(TABLE).insert(payload).select('*').single()

    if (error) throw toServiceError('criar nota', error.message)
    return data
  },

  async update(id: string, payload: GradeUpdate): Promise<Grade> {
    const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select('*').single()

    if (error) throw toServiceError('atualizar nota', error.message)
    return data
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)

    if (error) throw toServiceError('remover nota', error.message)
  },
}
