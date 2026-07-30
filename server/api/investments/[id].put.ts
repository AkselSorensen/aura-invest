import { query } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const check = await query('SELECT id FROM investments WHERE id = $1 AND user_id = $2', [id, user.id])
  if (check.rows.length === 0) throw createError({ statusCode: 404, statusMessage: 'Investissement non trouvé' })

  const { name, category_id, type, quantity, purchase_price, current_value, purchase_date, description, notes, image_url, metadata } = body

  const result = await query(
    `UPDATE investments
     SET name = COALESCE($1,name), category_id = $2, type = COALESCE($3,type),
     quantity = COALESCE($4,quantity), purchase_price = COALESCE($5,purchase_price),
     current_value = COALESCE($6,current_value), purchase_date = COALESCE($7,purchase_date),
     description = COALESCE($8,description), notes = COALESCE($9,notes),
     image_url = $10, metadata = COALESCE($11::jsonb, metadata), updated_at = NOW()
     WHERE id = $12 AND user_id = $13 RETURNING *`,
    [name, category_id, type, quantity, purchase_price, current_value, purchase_date,
     description, notes, image_url, metadata ? JSON.stringify(metadata) : null, id, user.id]
  )
  return { success: true, investment: result.rows[0] }
})
