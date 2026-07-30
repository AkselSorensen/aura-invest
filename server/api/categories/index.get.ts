import { query } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  const result = await query('SELECT * FROM categories ORDER BY sort_order')
  return result.rows
})
