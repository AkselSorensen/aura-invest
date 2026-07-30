import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import jwt from 'jsonwebtoken'
import { query } from '~~/server/utils/db'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

export function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString('hex')
}

export function generateToken(): string {
  return randomBytes(32).toString('hex')
}

export function generateJWT(user: { id: number; email: string; name: string; role: string }): string {
  return jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '30d' })
}

export async function getSessionUser(token: string) {
  if (!token) return null
  try {
    const result = await query(
      `SELECT u.id, u.email, u.name, u.role, u.created_at
       FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = $1`, [token])
    if (result.rows.length === 0) return null
    return result.rows[0]
  } catch { return null }
}

export async function getCurrentUser(event: any) {
  const cookieHeader = event.headers.get('cookie')
  if (!cookieHeader) return null
  const cookies: Record<string, string> = {}
  cookieHeader.split(';').forEach((c: string) => { const [k, ...r] = c.trim().split('='); cookies[k] = r.join('=') })
  const token = cookies['auth_token']
  if (!token) return null
  return getSessionUser(token)
}

export async function requireAuth(event: any) {
  const user = await getCurrentUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Non autorisé' })
  return user
}

export async function requireAdmin(event: any) {
  const user = await requireAuth(event)
  if (user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Accès réservé admin' })
  return user
}
