import { query } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  await query(`CREATE TABLE IF NOT EXISTS activity_log (
    id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id INTEGER,
    details TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT NOW())`)
  return { success: true }
})
