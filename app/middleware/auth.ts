export default defineNuxtRouteMiddleware(async (to) => {
  if (process.server) return
  try {
    const { data } = await useFetch('/api/auth/me', { credentials: 'include' })
    if (!data.value?.user) {
      return navigateTo('/login')
    }
  } catch {
    return navigateTo('/login')
  }
})
