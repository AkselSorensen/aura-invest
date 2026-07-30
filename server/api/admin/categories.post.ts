import { query } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { name, slug, icon, color, sort_order } = await readBody(event)
  if (!name || !slug) throw createError({ statusCode: 400, statusMessage: 'Nom et slug requis' })
  const maxOrder = await query('SELECT COALESCE(MAX(sort_order),0)+1 as next FROM categories')
  const order = sort_order || parseInt(maxOrder.rows[0].next)
  const result = await query(
    'INSERT INTO categories (name, slug, icon, color, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [name, slug, icon || 'lucide:folder', color || '#C9A84C', order])
  return { success: true, category: result.rows[0] }
})
