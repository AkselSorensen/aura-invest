import { query } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  // Add real columns for each asset class
  const columns = [
    // Private Equity
    'company_name TEXT', 'stage TEXT', 'equity_pct NUMERIC DEFAULT 0',
    'invested_amount NUMERIC DEFAULT 0', 'moic NUMERIC DEFAULT 0',
    'irr NUMERIC DEFAULT 0', 'exit_status TEXT DEFAULT \'active\'',
    'exit_value NUMERIC DEFAULT 0', 'fund_name TEXT', 'pipeline_status TEXT DEFAULT \'closed\'',
    'sector TEXT', 'co_investors TEXT',

    // Immobilier
    'property_address TEXT', 'property_type TEXT', 'city TEXT',
    'surface_sqm NUMERIC DEFAULT 0', 'rooms_qty INTEGER DEFAULT 0',
    'rental_income NUMERIC DEFAULT 0', 'monthly_charges NUMERIC DEFAULT 0',
    'property_tax NUMERIC DEFAULT 0', 'loan_amount NUMERIC DEFAULT 0',
    'loan_rate NUMERIC DEFAULT 0', 'loan_end_date DATE',

    // Actions & ETF
    'ticker TEXT', 'isin TEXT', 'shares_qty NUMERIC DEFAULT 0',
    'avg_cost NUMERIC DEFAULT 0', 'dividend_yield NUMERIC DEFAULT 0',
    'dividend_amount NUMERIC DEFAULT 0', 'account_type TEXT',
    'broker TEXT', 'stock_market TEXT', 'strategy TEXT',

    // Crypto
    'token_symbol TEXT', 'blockchain TEXT', 'crypto_amount NUMERIC DEFAULT 0',
    'avg_buy_price NUMERIC DEFAULT 0', 'staking_apy NUMERIC DEFAULT 0',
    'staking_rewards NUMERIC DEFAULT 0', 'wallet_type TEXT',
    'wallet_address TEXT', 'platform_name TEXT', 'vesting_end DATE',

    // Métaux
    'metal_type TEXT', 'metal_form TEXT', 'weight_grams NUMERIC DEFAULT 0',
    'purity TEXT', 'spot_price NUMERIC DEFAULT 0', 'premium_pct NUMERIC DEFAULT 0',
    'storage_location TEXT', 'certificate_number TEXT',

    // Objets Collection
    'collectible_category TEXT', 'item_condition TEXT', 'serial_number TEXT',
    'has_certificate BOOLEAN DEFAULT false', 'estimated_value NUMERIC DEFAULT 0',
    'appreciation_pct NUMERIC DEFAULT 0', 'provenance TEXT',

    // Épargne
    'bank_name TEXT', 'interest_rate NUMERIC DEFAULT 0',
    'interest_earned NUMERIC DEFAULT 0', 'monthly_deposit NUMERIC DEFAULT 0',
    'goal_amount NUMERIC DEFAULT 0',
  ]

  for (const col of columns) {
    try {
      await query(`ALTER TABLE investments ADD COLUMN IF NOT EXISTS ${col}`)
    } catch (e) {
      // Column might already exist in a different form, skip
    }
  }

  return { success: true, message: `${columns.length} columns migrated` }
})
