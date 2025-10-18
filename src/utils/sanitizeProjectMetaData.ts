import type { Tables } from '@/app/api/supabaseClient/database.types'

export type SanitizedProjectMeta = Pick<
  Tables<'projects'>,
  'name' | 'last_updated' | 'height' | 'width'
> & {
  id: string
  owner_id: string
}

export default function sanitizeProjectMetaData(data: Tables<'projects'>): SanitizedProjectMeta {
  return {
    id: data.id,
    name: data.name,
    last_updated: data.last_updated,
    height: data.height,
    width: data.width,
    owner_id: data.owner_id,
  }
}
