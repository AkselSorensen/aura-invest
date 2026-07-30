import { query } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'
import { logActivity } from '~~/server/utils/activity'

const ALL_FIELDS = [
  'name', 'category_id', 'type', 'quantity', 'purchase_price', 'current_value',
  'purchase_date', 'description', 'notes', 'image_url',
  'company_name', 'stage', 'equity_pct', 'invested_amount', 'moic', 'irr',
  'exit_status', 'exit_value', 'fund_name', 'pipeline_status', 'sector', 'co_investors',
  'property_address', 'property_type', 'city', 'surface_sqm', 'rooms_qty',
  'rental_income', 'monthly_charges', 'property_tax', 'loan_amount', 'loan_rate', 'loan_end_date',
  'ticker', 'isin', 'shares_qty', 'avg_cost', 'dividend_yield',
  'dividend_amount', 'account_type', 'broker', 'stock_market', 'strategy',
  'token_symbol', 'blockchain', 'crypto_amount', 'avg_buy_price',
  'staking_apy', 'staking_rewards', 'wallet_type', 'wallet_address', 'platform_name', 'vesting_end',
  'metal_type', 'metal_form', 'weight_grams', 'purity', 'spot_price', 'premium_pct',
  'storage_location', 'certificate_number',
  'collectible_category', 'item_condition', 'serial_number', 'has_certificate',
  'estimated_value', 'appreciation_pct', 'provenance',
  'bank_name', 'interest_rate', 'interest_earned', 'monthly_deposit', 'goal_amount',
]

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  if (!body.name) throw createError({ statusCode: 400, statusMessage: 'Nom requis' })

  const columns: string[] = ['user_id']
  const values: any[] = [user.id]
  const placeholders: string[] = ['$1']
  let p = 2
  for (const field of ALL_FIELDS) {
    if (body[field] !== undefined) { columns.push(field); values.push(body[field]); placeholders.push(`$${p++}`) }
  }

  const sql = `INSERT INTO investments (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`
  const result = await query(sql, values)

  await logActivity(user.id, 'create', 'investment', result.rows[0].id, `Création : ${body.name}`)
  return { success: true, investment: result.rows[0] }
})
