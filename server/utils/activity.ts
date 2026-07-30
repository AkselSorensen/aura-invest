import { query } from './db'

export async function logActivity(userId: number, action: string, entityType: string, entityId?: number, details?: string) {
  try {
    await query(
      'INSERT INTO activity_log (user_id, action, entity_type, entity_id, details) VALUES ($1,$2,$3,$4,$5)',
      [userId, action, entityType, entityId || null, details || '']
    )
  } catch {}
}
