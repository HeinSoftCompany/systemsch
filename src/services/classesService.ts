import { supabase } from '../lib/supabase'
import type { TableInsert, TableRow, TableUpdate } from '../types/database'

type SchoolClass = TableRow<'classes'>
type SchoolClassInsert = TableInsert<'classes'>
type SchoolClassUpdate = TableUpdate<'classes'>

const TABLE = 'classes'

const toServiceError = (action: string, errorMessage?: string): Error => {
  return new Error(`ClassesService: falha ao ${action}. ${errorMessage ?? 'Tente novamente.'}`)
}

export const classesService = {
  async getAll(): Promise<SchoolClass[]> {
    const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false })

    if (error) throw toServiceError('listar turmas', error.message)
    return data ?? []
  },

  async getById(id: string): Promise<SchoolClass | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle()

    if (error) throw toServiceError('buscar turma pelo ID', error.message)
    return data
  },

  async create(payload: SchoolClassInsert): Promise<SchoolClass> {
    const { data, error } = await supabase.from(TABLE).insert(payload).select('*').single()

    if (error) throw toServiceError('criar turma', error.message)
    return data
  },

  async update(id: string, payload: SchoolClassUpdate): Promise<SchoolClass> {
    const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select('*').single()

    if (error) throw toServiceError('atualizar turma', error.message)
    return data
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)

    if (error) throw toServiceError('remover turma', error.message)
  },
}
