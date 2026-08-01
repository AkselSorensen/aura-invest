import { query } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  // Get the item
  const itemResult = await query(
    'SELECT * FROM vault_items WHERE id = $1 AND user_id = $2', [id, user.id])
  if (itemResult.rows.length === 0) throw createError({ statusCode: 404, statusMessage: 'Objet non trouvé' })

  const item = itemResult.rows[0]

  // Get images separately (avoids DISTINCT issue with json_agg on row types)
  const imagesResult = await query(
    'SELECT * FROM vault_images WHERE vault_item_id = $1 ORDER BY sort_order', [id])
  item.images = imagesResult.rows

  // Get documents separately
  const docsResult = await query(
    'SELECT * FROM vault_documents WHERE vault_item_id = $1 ORDER BY sort_order', [id])
  item.documents = docsResult.rows

  return item
})
