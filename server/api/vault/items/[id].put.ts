import { query } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const check = await query('SELECT id FROM vault_items WHERE id = $1 AND user_id = $2', [id, user.id])
  if (check.rows.length === 0) throw createError({ statusCode: 404, statusMessage: 'Objet non trouvé' })

  const fields: string[] = []; const values: any[] = []; let p = 1
  const map: Record<string, string> = {
    name: 'name', category: 'category', description: 'description',
    acquisition_date: 'acquisition_date', acquisition_price: 'acquisition_price',
    current_value: 'current_value', insured_value: 'insured_value',
    location: 'location', condition: 'condition', serial_number: 'serial_number',
    dimensions: 'dimensions', weight: 'weight', notes: 'notes',
  }

  for (const [key, col] of Object.entries(map)) {
    if (body[key] !== undefined) { fields.push(`${col} = $${p++}`); values.push(body[key]) }
  }
  if (body.metadata !== undefined) { fields.push(`metadata = $${p++}::jsonb`); values.push(JSON.stringify(body.metadata)) }

  if (fields.length === 0) throw createError({ statusCode: 400, statusMessage: 'Rien à modifier' })
  fields.push('updated_at = NOW()')
  values.push(id, user.id)

  const result = await query(
    `UPDATE vault_items SET ${fields.join(', ')} WHERE id = $${p++} AND user_id = $${p} RETURNING *`,
    values)
  return { success: true, item: result.rows[0] }
})
