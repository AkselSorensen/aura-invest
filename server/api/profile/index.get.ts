import { query } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

// GET - Récupérer le profil
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const result = await query('SELECT * FROM investor_profiles WHERE user_id = $1', [user.id])
  return { success: true, profile: result.rows[0] || null, completed: result.rows[0]?.completed || false }
})
