import { supabase } from '../lib/supabase'
import type { TableInsert, TableRow, TableUpdate } from '../types/database'

type Announcement = TableRow<'announcements'>
type AnnouncementInsert = TableInsert<'announcements'>
type AnnouncementUpdate = TableUpdate<'announcements'>

const TABLE = 'announcements'

const toServiceError = (action: string, errorMessage?: string): Error => {
  return new Error(`AnnouncementsService: falha ao ${action}. ${errorMessage ?? 'Tente novamente.'}`)
}

export const announcementsService = {
  async getAll(): Promise<Announcement[]> {
    const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: false })

    if (error) throw toServiceError('listar comunicados', error.message)
    return data ?? []
  },

  async getById(id: string): Promise<Announcement | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle()

    if (error) throw toServiceError('buscar comunicado pelo ID', error.message)
    return data
  },

  async create(payload: AnnouncementInsert): Promise<Announcement> {
    const { data, error } = await supabase.from(TABLE).insert(payload).select('*').single()

    if (error) throw toServiceError('criar comunicado', error.message)
    return data
  },

  async update(id: string, payload: AnnouncementUpdate): Promise<Announcement> {
    const { data, error } = await supabase.from(TABLE).update(payload).eq('id', id).select('*').single()

    if (error) throw toServiceError('atualizar comunicado', error.message)
    return data
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE).delete().eq('id', id)

    if (error) throw toServiceError('remover comunicado', error.message)
  },
}
