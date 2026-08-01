import { query } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  await query(`CREATE TABLE IF NOT EXISTS asset_prices (
    id SERIAL PRIMARY KEY,
    investment_id INTEGER REFERENCES investments(id) ON DELETE CASCADE,
    isin TEXT,
    ticker TEXT,
    price NUMERIC,
    currency TEXT DEFAULT 'EUR',
    variation NUMERIC,
    variation_pct NUMERIC,
    fetched_at TIMESTAMPTZ DEFAULT NOW()
  )`)
  await query(`CREATE INDEX IF NOT EXISTS idx_asset_prices_investment ON asset_prices(investment_id, fetched_at DESC)`)
  return { success: true, message: 'asset_prices table ready' }
})
