import { query } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const result = await query(
    `SELECT u.id, u.name, u.email, u.role, u.created_at,
     COUNT(i.id) as investment_count, COALESCE(SUM(i.current_value), 0) as total_value
     FROM users u LEFT JOIN investments i ON i.user_id = u.id GROUP BY u.id ORDER BY u.created_at DESC`)
  return result.rows
})
