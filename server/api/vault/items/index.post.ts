import { query } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const { name, category, description, acquisition_date, acquisition_price, current_value,
    insured_value, location, condition, serial_number, dimensions, weight, notes, metadata } = body

  if (!name) throw createError({ statusCode: 400, statusMessage: 'Nom requis' })

  const result = await query(
    `INSERT INTO vault_items (user_id, name, category, description, acquisition_date,
     acquisition_price, current_value, insured_value, location, condition, serial_number,
     dimensions, weight, notes, metadata)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb)
     RETURNING *`,
    [user.id, name, category || 'other', description || '', acquisition_date || null,
     acquisition_price || 0, current_value || 0, insured_value || 0, location || '',
     condition || 'excellent', serial_number || '', dimensions || '', weight || '',
     notes || '', JSON.stringify(metadata || {})]
  )
  return { success: true, item: result.rows[0] }
})
