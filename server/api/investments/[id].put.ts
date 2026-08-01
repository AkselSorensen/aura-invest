import { query } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const check = await query('SELECT id FROM investments WHERE id = $1 AND user_id = $2', [id, user.id])
  if (check.rows.length === 0) throw createError({ statusCode: 404, statusMessage: 'Investissement non trouvé' })

  const fields: string[] = []
  const values: any[] = []
  let p = 1

  const allowedFields: Record<string, string> = {
    name: 'name', category_id: 'category_id', type: 'type',
    quantity: 'quantity', purchase_price: 'purchase_price',
    current_value: 'current_value', purchase_date: 'purchase_date',
    description: 'description', notes: 'notes', image_url: 'image_url',
    ticker: 'ticker', isin: 'isin', shares_qty: 'shares_qty',
    avg_cost: 'avg_cost', dividend_yield: 'dividend_yield',
    dividend_amount: 'dividend_amount', account_type: 'account_type',
    broker: 'broker', stock_market: 'stock_market', strategy: 'strategy',
  }

  for (const [key, col] of Object.entries(allowedFields)) {
    if (body[key] !== undefined) {
      fields.push(`${col} = $${p++}`)
      values.push(body[key])
    }
  }

  // Handle metadata
  if (body.metadata !== undefined) {
    fields.push(`metadata = $${p++}::jsonb`)
    values.push(JSON.stringify(body.metadata))
  }

  if (fields.length === 0) throw createError({ statusCode: 400, statusMessage: 'Rien à modifier' })
  fields.push('updated_at = NOW()')
  values.push(id, user.id)

  const result = await query(
    `UPDATE investments SET ${fields.join(', ')} WHERE id = $${p++} AND user_id = $${p} RETURNING *`,
    values)
  return { success: true, investment: result.rows[0] }
})
