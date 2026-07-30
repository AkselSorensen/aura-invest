import { query } from '~~/server/utils/db'
import { hashPassword, generateToken, generateJWT } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { email, password, name } = await readBody(event)
  if (!email || !password || !name) throw createError({ statusCode: 400, statusMessage: 'Email, mot de passe et nom requis' })
  if (password.length < 8) throw createError({ statusCode: 400, statusMessage: 'Mot de passe : 8 caractères minimum' })

  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()])
  if (existing.rows.length > 0) throw createError({ statusCode: 409, statusMessage: 'Cet email est déjà utilisé' })

  const salt = generateToken()
  const passwordHash = hashPassword(password, salt)
  const result = await query(
    'INSERT INTO users (email, password_hash, salt, name) VALUES ($1,$2,$3,$4) RETURNING id, email, name, role',
    [email.toLowerCase().trim(), passwordHash, salt, name.trim()])
  const user = result.rows[0]

  const sessionToken = generateToken()
  await query('INSERT INTO sessions (user_id, token) VALUES ($1,$2)', [user.id, sessionToken])

  setCookie(event, 'auth_token', sessionToken, {
    httpOnly: true, secure: false, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
  return { success: true, user, token: generateJWT(user) }
})
