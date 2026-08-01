import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const formData = await readFormData(event)

  let file: File | null = null
  const multiFiles = formData.getAll('file')
  if (multiFiles && multiFiles.length > 0) {
    const f = Array.from(multiFiles).find((f): f is File => f instanceof File)
    if (f) file = f
  } else {
    const single = formData.get('file')
    if (single instanceof File) file = single
  }

  if (!file) throw createError({ statusCode: 400, statusMessage: 'Aucun fichier' })
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    throw createError({ statusCode: 400, statusMessage: 'Format non supporté (JPG, PNG, WebP)' })
  if (file.size > 5 * 1024 * 1024) throw createError({ statusCode: 400, statusMessage: 'Fichier trop volumineux (max 5MB)' })

  const buffer = Buffer.from(await file.arrayBuffer())
  const base64 = buffer.toString('base64')
  const dataUri = `data:${file.type};base64,${base64}`

  return { url: dataUri }
})
