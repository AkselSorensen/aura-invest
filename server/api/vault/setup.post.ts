import { query } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  await query(`CREATE TABLE IF NOT EXISTS vault_items (
    id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'other',
    description TEXT DEFAULT '', acquisition_date DATE,
    acquisition_price NUMERIC DEFAULT 0, current_value NUMERIC DEFAULT 0,
    insured_value NUMERIC DEFAULT 0, location TEXT DEFAULT '',
    condition TEXT DEFAULT 'excellent', serial_number TEXT DEFAULT '',
    dimensions TEXT DEFAULT '', weight TEXT DEFAULT '', notes TEXT DEFAULT '',
    qr_code_data TEXT DEFAULT '', metadata JSONB DEFAULT '{}',
    sold BOOLEAN DEFAULT false, sold_price NUMERIC, sold_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`)

  // Add columns to existing tables (ignore errors if already present)
  for (const col of ['sold BOOLEAN DEFAULT false', 'sold_price NUMERIC', 'sold_date DATE']) {
    try { await query(`ALTER TABLE vault_items ADD COLUMN ${col}`) } catch {}
  }

  await query(`CREATE TABLE IF NOT EXISTS vault_images (
    id SERIAL PRIMARY KEY, vault_item_id INTEGER REFERENCES vault_items(id) ON DELETE CASCADE,
    url TEXT NOT NULL, alt TEXT DEFAULT '', sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW())`)
  await query(`CREATE TABLE IF NOT EXISTS vault_documents (
    id SERIAL PRIMARY KEY, vault_item_id INTEGER REFERENCES vault_items(id) ON DELETE CASCADE,
    name TEXT NOT NULL, url TEXT NOT NULL, doc_type TEXT DEFAULT 'other',
    sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW())`)
  return { success: true, message: 'Vault tables ready' }
})
