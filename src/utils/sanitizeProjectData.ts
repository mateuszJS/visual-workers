import type { Tables, Json } from '@/app/api/supabaseClient/database.types'

export type SanitizedProject = Pick<
  Tables<'projects'>,
  'name' | 'last_updated' | 'height' | 'width'
> & { id: string; owner_id: string; assets: Json[] } // we override 'assets' property here, since is just have Json[] type in db
// > & { id: string; assets: SerializedAsset[] } // we override 'assets' property here, since is just have Json[] type in db

export default function sanitizeProjectData(data: Tables<'projects'>): SanitizedProject {
  return {
    id: data.id,
    name: data.name,
    assets: data.assets,
    last_updated: data.last_updated,
    height: data.height,
    width: data.width,
    owner_id: data.owner_id,
  }
}
