import { query } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const result = await query(
    'SELECT * FROM activity_log WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
    [user.id]
  )
  return result.rows
})
