import { query } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

// POST - Créer le profil
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event)
  const { full_name, bio, investment_horizon, risk_tolerance, goal_description, preferred_categories } = body

  if (!full_name || !investment_horizon || !risk_tolerance) {
    throw createError({ statusCode: 400, statusMessage: 'Nom complet, horizon et tolérance au risque requis' })
  }

  // Upsert
  const result = await query(
    `INSERT INTO investor_profiles (user_id, full_name, bio, investment_horizon, risk_tolerance, goal_description, preferred_categories, completed)
     VALUES ($1,$2,$3,$4,$5,$6,$7,true)
     ON CONFLICT (user_id) DO UPDATE SET
       full_name = $2, bio = $3, investment_horizon = $4, risk_tolerance = $5,
       goal_description = $6, preferred_categories = $7, completed = true
     RETURNING *`,
    [user.id, full_name, bio || '', investment_horizon, risk_tolerance, goal_description || '', JSON.stringify(preferred_categories || [])]
  )
  return { success: true, profile: result.rows[0] }
})
