import { query } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  await query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL,
    salt TEXT NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW())`)
  await query(`CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW())`)
  await query(`CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
    icon TEXT NOT NULL DEFAULT 'lucide:folder', color TEXT NOT NULL DEFAULT '#C9A84C',
    sort_order INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW())`)
  await query(`CREATE TABLE IF NOT EXISTS investments (
    id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL, name TEXT NOT NULL,
    description TEXT DEFAULT '', type TEXT NOT NULL DEFAULT 'financial', quantity NUMERIC DEFAULT 1,
    purchase_price NUMERIC DEFAULT 0, current_value NUMERIC DEFAULT 0,
    purchase_date DATE DEFAULT CURRENT_DATE, image_url TEXT, notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}')`)
  await query(`CREATE TABLE IF NOT EXISTS investor_profiles (
    id SERIAL PRIMARY KEY, user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL, bio TEXT DEFAULT '', investment_horizon TEXT NOT NULL,
    risk_tolerance TEXT NOT NULL, goal_description TEXT DEFAULT '',
    preferred_categories JSONB DEFAULT '[]', completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`)

  const existing = await query('SELECT COUNT(*) FROM categories')
  if (parseInt(existing.rows[0].count) === 0) {
    const defaults = [
      { name: 'Actions & ETF', slug: 'actions-etf', icon: 'lucide:trending-up', color: '#3B82F6', sort_order: 1 },
      { name: 'Crypto', slug: 'crypto', icon: 'lucide:bitcoin', color: '#F7931A', sort_order: 2 },
      { name: 'Immobilier', slug: 'immobilier', icon: 'lucide:building', color: '#22C55E', sort_order: 3 },
      { name: 'Métaux Précieux', slug: 'metaux-precieux', icon: 'lucide:coins', color: '#C9A84C', sort_order: 4 },
      { name: 'Objets de Collection', slug: 'objets-collection', icon: 'lucide:gem', color: '#A855F7', sort_order: 5 },
      { name: 'Private Equity', slug: 'private-equity', icon: 'lucide:briefcase', color: '#EC4899', sort_order: 6 },
      { name: 'Épargne', slug: 'epargne', icon: 'lucide:piggy-bank', color: '#14B8A6', sort_order: 7 },
      { name: 'Autre', slug: 'autre', icon: 'lucide:folder', color: '#71717A', sort_order: 8 },
    ]
    for (const cat of defaults) {
      await query('INSERT INTO categories (name, slug, icon, color, sort_order) VALUES ($1,$2,$3,$4,$5)',
        [cat.name, cat.slug, cat.icon, cat.color, cat.sort_order])
    }
  }
  return { success: true, message: 'Tables created & categories seeded' }
})
