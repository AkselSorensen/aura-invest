import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const formData = await readFormData(event)
  const file = formData.get('file') as File
  if (!file) throw createError({ statusCode: 400, statusMessage: 'Aucun fichier' })
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    throw createError({ statusCode: 400, statusMessage: 'Format non supporté (JPG, PNG, WebP)' })
  if (file.size > 5 * 1024 * 1024) throw createError({ statusCode: 400, statusMessage: 'Fichier trop volumineux (max 5MB)' })

  const { put } = await import('@vercel/blob')
  const blob = await put(`investments/${Date.now()}-${file.name}`, file, {
    access: 'public', token: process.env.BLOB_READ_WRITE_TOKEN })
  return { url: blob.url }
})
