import { query } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const result = await query('DELETE FROM vault_items WHERE id = $1 AND user_id = $2 RETURNING id', [id, user.id])
  if (result.rows.length === 0) throw createError({ statusCode: 404, statusMessage: 'Objet non trouvé' })
  return { success: true }
})
