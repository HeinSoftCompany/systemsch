import { supabase } from '../lib/supabase'
import type { TableInsert, TableRow, TableUpdate } from '../types/database'

type Subject = TableRow<'subjects'>
type SubjectInsert = TableInsert<'subjects'>
type SubjectUpdate = TableUpdate<'subjects'>

const TABLE = 'subjects'

const toServiceError = (action: string, errorMessage?: string): Error => {
  return new Error(`SubjectsService: falha ao ${action}. ${errorMessage ?? 'Tente novamente.'}`)
}

export const subjectsService = {
  async getAll(): Promise<Subject[]> {
    const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false })

    if (error) throw toServiceError('listar disciplinas', error.message)
    return data ?? []
  },

  async getById(id: string): Promise<Subject | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle()

    if (error) throw toServiceError('buscar disciplina pelo ID', error.message)
    return data
  },

  async create(payload: SubjectInsert): Promise<Subject> {
    const { data, error } = await supabase.from(TABLE).insert(payload).select('*').single()

    if (error) throw toServiceError('criar disciplina', error.message)
    return data
  },

  async update(id: string, payload: SubjectUpdate): Promise<Subject> {
    const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select('*').single()

    if (error) throw toServiceError('atualizar disciplina', error.message)
    return data
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)

    if (error) throw toServiceError('remover disciplina', error.message)
  },
}
