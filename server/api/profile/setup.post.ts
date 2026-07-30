import { query } from '~~/server/utils/db'

// Auto-setup: add investor_profiles table to setup
export default defineEventHandler(async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS investor_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      full_name TEXT NOT NULL,
      bio TEXT DEFAULT '',
      investment_horizon TEXT NOT NULL,
      risk_tolerance TEXT NOT NULL,
      goal_description TEXT DEFAULT '',
      preferred_categories JSONB DEFAULT '[]',
      completed BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  return { success: true }
})
