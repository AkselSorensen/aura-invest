import { query } from '~~/server/utils/db'
import { requireAdmin } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id, name, slug, icon, color, sort_order } = await readBody(event)
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID requis' })
  const fields: string[] = []; const values: any[] = []; let p = 1
  if (name !== undefined) { fields.push(`name = $${p++}`); values.push(name) }
  if (slug !== undefined) { fields.push(`slug = $${p++}`); values.push(slug) }
  if (icon !== undefined) { fields.push(`icon = $${p++}`); values.push(icon) }
  if (color !== undefined) { fields.push(`color = $${p++}`); values.push(color) }
  if (sort_order !== undefined) { fields.push(`sort_order = $${p++}`); values.push(sort_order) }
  if (fields.length === 0) throw createError({ statusCode: 400, statusMessage: 'Rien à modifier' })
  values.push(id)
  const result = await query(`UPDATE categories SET ${fields.join(', ')} WHERE id = $${p} RETURNING *`, values)
  return { success: true, category: result.rows[0] }
})
