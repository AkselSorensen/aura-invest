import { query } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id } = await readBody(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID requis' })
  await query('DELETE FROM categories WHERE id = $1', [id])
  return { success: true }
})
