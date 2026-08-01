import { query } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')

  const check = await query('SELECT id FROM vault_items WHERE id = $1 AND user_id = $2', [id, user.id])
  if (check.rows.length === 0) throw createError({ statusCode: 404, statusMessage: 'Objet non trouvé' })

  const formData = await readFormData(event)
  
  let files: File[] = []
  const multiFiles = formData.getAll('files')
  if (multiFiles && multiFiles.length > 0) {
    files = Array.from(multiFiles).filter((f): f is File => f instanceof File)
  } else {
    const single = formData.get('file')
    if (single instanceof File) files = [single]
  }

  if (files.length === 0) throw createError({ statusCode: 400, statusMessage: 'Aucun fichier' })

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const uploaded: any[] = []

  const maxSort = await query('SELECT COALESCE(MAX(sort_order), -1) as max FROM vault_images WHERE vault_item_id = $1', [id])
  let sort = parseInt(maxSort.rows[0].max) + 1

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) continue
    if (file.size > 5 * 1024 * 1024) continue

    try {
      // Convert file to base64 data URI
      const buffer = Buffer.from(await file.arrayBuffer())
      const base64 = buffer.toString('base64')
      const dataUri = `data:${file.type};base64,${base64}`

      const result = await query(
        'INSERT INTO vault_images (vault_item_id, url, alt, sort_order) VALUES ($1,$2,$3,$4) RETURNING *',
        [id, dataUri, file.name, sort++])
      uploaded.push(result.rows[0])
    } catch (err: any) {
      console.error('Image upload failed:', err.message)
    }
  }

  return { success: true, images: uploaded }
})
