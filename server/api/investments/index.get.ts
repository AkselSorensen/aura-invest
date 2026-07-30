import { query } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const result = await query(
    `SELECT i.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon, c.color as category_color
     FROM investments i LEFT JOIN categories c ON c.id = i.category_id
     WHERE i.user_id = $1 ORDER BY i.created_at DESC`, [user.id])
  return result.rows
})
