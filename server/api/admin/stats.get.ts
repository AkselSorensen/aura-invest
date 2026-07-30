import { query } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const [users, investments, totalValue] = await Promise.all([
    query('SELECT COUNT(*) FROM users'),
    query('SELECT COUNT(*) FROM investments'),
    query('SELECT COALESCE(SUM(current_value), 0) as total FROM investments')])
  return {
    users: parseInt(users.rows[0].count),
    investments: parseInt(investments.rows[0].count),
    totalValue: parseFloat(totalValue.rows[0].total) }
})
