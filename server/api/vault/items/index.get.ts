import { query } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const result = await query(
    `SELECT vi.*,
     COALESCE(json_agg(vi2.* ORDER BY vi2.sort_order) FILTER (WHERE vi2.id IS NOT NULL), '[]') as images
     FROM vault_items vi
     LEFT JOIN vault_images vi2 ON vi2.vault_item_id = vi.id
     WHERE vi.user_id = $1
     GROUP BY vi.id
     ORDER BY vi.created_at DESC`, [user.id])
  return result.rows
})
