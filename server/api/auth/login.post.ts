import { query } from '~~/server/utils/db'
import { hashPassword, generateToken, generateJWT } from '~~/server/utils/auth'
import { timingSafeEqual } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)
  if (!email || !password) throw createError({ statusCode: 400, statusMessage: 'Email et mot de passe requis' })

  const result = await query('SELECT id, email, password_hash, salt, name, role FROM users WHERE email = $1', [email.toLowerCase().trim()])
  if (result.rows.length === 0) throw createError({ statusCode: 401, statusMessage: 'Email ou mot de passe incorrect' })

  const user = result.rows[0]
  const inputHash = hashPassword(password, user.salt)
  const buf1 = Buffer.from(inputHash, 'hex')
  const buf2 = Buffer.from(user.password_hash, 'hex')
  if (buf1.length !== buf2.length || !timingSafeEqual(buf1, buf2)) throw createError({ statusCode: 401, statusMessage: 'Email ou mot de passe incorrect' })

  const sessionToken = generateToken()
  await query('INSERT INTO sessions (user_id, token) VALUES ($1,$2)', [user.id, sessionToken])

  setCookie(event, 'auth_token', sessionToken, {
    httpOnly: true, secure: false, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 })
  return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role }, token: generateJWT({ id: user.id, email: user.email, name: user.name, role: user.role }) }
})
