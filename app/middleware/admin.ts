export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return
  try {
    const { data } = await useFetch('/api/auth/me', { credentials: 'include' })
    if (!data.value?.user || data.value.user.role !== 'admin') {
      return navigateTo('/login')
    }
  } catch {
    return navigateTo('/login')
  }
})
