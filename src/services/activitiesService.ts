import { supabase } from '../lib/supabase'
import type { TableInsert, TableRow, TableUpdate } from '../types/database'

type Activity = TableRow<'activities'>
type ActivityInsert = TableInsert<'activities'>
type ActivityUpdate = TableUpdate<'activities'>

const TABLE = 'activities'

const toServiceError = (action: string, errorMessage?: string): Error => {
  return new Error(`ActivitiesService: falha ao ${action}. ${errorMessage ?? 'Tente novamente.'}`)
}

export const activitiesService = {
  async getAll(): Promise<Activity[]> {
    const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false })

    if (error) throw toServiceError('listar atividades', error.message)
    return data ?? []
  },

  async getById(id: string): Promise<Activity | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle()

    if (error) throw toServiceError('buscar atividade pelo ID', error.message)
    return data
  },

  async create(payload: ActivityInsert): Promise<Activity> {
    const { data, error } = await supabase.from(TABLE).insert(payload).select('*').single()

    if (error) throw toServiceError('criar atividade', error.message)
    return data
  },

  async update(id: string, payload: ActivityUpdate): Promise<Activity> {
    const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select('*').single()

    if (error) throw toServiceError('atualizar atividade', error.message)
    return data
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)

    if (error) throw toServiceError('remover atividade', error.message)
  },
}
