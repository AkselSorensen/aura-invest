import { query } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const result = await query(
    `SELECT i.*, c.name as category_name, c.slug as category_slug, c.icon as category_icon, c.color as category_color
     FROM investments i LEFT JOIN categories c ON c.id = i.category_id
     WHERE i.id = $1 AND i.user_id = $2`, [id, user.id])
  if (result.rows.length === 0) throw createError({ statusCode: 404, statusMessage: 'Investissement non trouvé' })
  return result.rows[0]
})
