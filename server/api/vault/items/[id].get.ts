import { query } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  const result = await query(
    `SELECT vi.*,
     COALESCE(json_agg(DISTINCT vi2.* ORDER BY vi2.sort_order) FILTER (WHERE vi2.id IS NOT NULL), '[]') as images,
     COALESCE(json_agg(DISTINCT vd.* ORDER BY vd.sort_order) FILTER (WHERE vd.id IS NOT NULL), '[]') as documents
     FROM vault_items vi
     LEFT JOIN vault_images vi2 ON vi2.vault_item_id = vi.id
     LEFT JOIN vault_documents vd ON vd.vault_item_id = vi.id
     WHERE vi.id = $1 AND vi.user_id = $2
     GROUP BY vi.id`, [id, user.id])

  if (result.rows.length === 0) throw createError({ statusCode: 404, statusMessage: 'Objet non trouvé' })
  return result.rows[0]
})
