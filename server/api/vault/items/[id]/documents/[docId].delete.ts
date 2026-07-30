import { query } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const itemId = getRouterParam(event, 'id')
  const docId = getRouterParam(event, 'docId')

  const check = await query('SELECT id FROM vault_items WHERE id = $1 AND user_id = $2', [itemId, user.id])
  if (check.rows.length === 0) throw createError({ statusCode: 404, statusMessage: 'Objet non trouvé' })

  const result = await query('DELETE FROM vault_documents WHERE id = $1 AND vault_item_id = $2 RETURNING id', [docId, itemId])
  if (result.rows.length === 0) throw createError({ statusCode: 404, statusMessage: 'Document non trouvé' })
  return { success: true }
})
