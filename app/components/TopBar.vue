<template>
  <header class="h-16 bg-surface border-b border-surface-500 flex items-center justify-between px-6 shrink-0">
    <div class="flex items-center gap-3">
      <button @click="$emit('toggle')" class="text-text-600 hover:text-text transition-colors p-1.5 rounded-lg hover:bg-surface-500">
        <Icon icon="lucide:align-justify" class="w-5 h-5" />
      </button>
      <!-- Breadcrumb / current page indicator -->
      <div class="hidden sm:flex items-center gap-2 text-sm">
        <Icon icon="lucide:chevron-right" class="w-4 h-4 text-text-700" />
        <span class="text-text-600">{{ currentPage }}</span>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <!-- Quick actions -->
      <NuxtLink to="/investments" class="hidden sm:flex items-center gap-1.5 text-sm text-text-600 hover:text-gold transition-colors">
        <Icon icon="lucide:plus-circle" class="w-4 h-4" />
        Ajouter
      </NuxtLink>

      <div v-if="user" class="flex items-center gap-3">
        <button class="relative text-text-600 hover:text-text transition-colors p-1.5 rounded-lg hover:bg-surface-500">
          <Icon icon="lucide:bell" class="w-5 h-5" />
          <span class="absolute top-0 right-0 w-2 h-2 rounded-full bg-gold" />
        </button>
        <div class="flex items-center gap-2.5 pl-3 border-l border-surface-500">
          <div class="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center text-gold text-sm font-semibold">
            <Icon icon="lucide:user" class="w-4 h-4" />
          </div>
          <div class="hidden sm:block text-right">
            <div class="text-sm font-medium text-text leading-tight">{{ user.name }}</div>
            <div class="text-[10px] text-text-700 flex items-center gap-1">
              <Icon icon="lucide:shield-check" class="w-3 h-3" />
              {{ user.role === 'admin' ? 'Admin' : 'Investisseur' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const route = useRoute()
defineEmits(['toggle'])

const { data } = await useFetch('/api/auth/me', { credentials: 'include' })
const user = computed(() => data.value?.user || null)

const pageLabels: Record<string, string> = {
  '/dashboard': 'Tableau de bord',
  '/investments': 'Mes investissements',
  '/profile': 'Profil investisseur',
  '/admin': 'Admin',
}
const currentPage = computed(() => {
  for (const [path, label] of Object.entries(pageLabels)) {
    if (route.path.startsWith(path)) return label
  }
  return ''
})
</script>
