import { query } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const cookieHeader = event.headers.get('cookie')
  if (cookieHeader) {
    const cookies: Record<string, string> = {}
    cookieHeader.split(';').forEach((c: string) => { const [k, ...r] = c.trim().split('='); cookies[k] = r.join('=') })
    const token = cookies['auth_token']
    if (token) await query('DELETE FROM sessions WHERE token = $1', [token])
  }
  deleteCookie(event, 'auth_token', { path: '/' })
  return { success: true, message: 'Déconnecté' }
})
