import { query } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  const check = await query('SELECT id FROM vault_items WHERE id = $1 AND user_id = $2', [id, user.id])
  if (check.rows.length === 0) throw createError({ statusCode: 404, statusMessage: 'Objet non trouvé' })

  const formData = await readFormData(event)
  const files = formData.getAll('files') as File[]

  if (!files || files.length === 0) {
    const single = formData.get('file') as File
    if (!single) throw createError({ statusCode: 400, statusMessage: 'Aucun fichier' })
    files.push(single)
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const { put } = await import('@vercel/blob')
  const uploaded: any[] = []

  const maxSort = await query('SELECT COALESCE(MAX(sort_order), -1) as max FROM vault_images WHERE vault_item_id = $1', [id])
  let sort = parseInt(maxSort.rows[0].max) + 1

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) continue
    if (file.size > 5 * 1024 * 1024) continue

    const blob = await put(`vault/${id}/${Date.now()}-${file.name}`, file, {
      access: 'public', token: process.env.BLOB_READ_WRITE_TOKEN })
    const result = await query(
      'INSERT INTO vault_images (vault_item_id, url, alt, sort_order) VALUES ($1,$2,$3,$4) RETURNING *',
      [id, blob.url, file.name, sort++])
    uploaded.push(result.rows[0])
  }

  return { success: true, images: uploaded }
})
