<template>
  <aside
    class="fixed left-0 top-0 h-full bg-surface border-r border-surface-500 z-50 transition-all duration-300 flex flex-col"
    :class="collapsed ? 'w-16' : 'w-60'"
    ref="sidebarRef"
  >
    <!-- Logo -->
    <div class="h-16 flex items-center px-4 border-b border-surface-500 shrink-0">
      <div class="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
        <Icon icon="lucide:sparkles" class="w-4 h-4 text-gold" />
      </div>
      <span v-if="!collapsed" class="ml-2.5 text-lg font-bold text-text whitespace-nowrap tracking-tight">Aura<span class="text-gold">Invest</span></span>
    </div>

    <!-- Nav -->
    <nav class="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
      <div v-if="!collapsed" class="px-3 py-1.5 mb-1">
        <span class="text-[10px] font-semibold text-text-700 uppercase tracking-widest">Navigation</span>
      </div>
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm group relative"
        :class="$route.path === item.to
          ? 'text-gold bg-gold/10 font-medium'
          : 'text-text-600 hover:bg-surface-500 hover:text-text'"
      >
        <Icon :icon="item.icon" class="w-5 h-5 shrink-0" />
        <span v-if="!collapsed" class="whitespace-nowrap">{{ item.label }}</span>
        <div v-if="$route.path === item.to" class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gold rounded-r-full" />
      </NuxtLink>

      <!-- Admin link (if admin) -->
      <div v-if="!collapsed" class="px-3 pt-4 pb-1.5 mt-2">
        <span class="text-[10px] font-semibold text-text-700 uppercase tracking-widest">Administration</span>
      </div>
      <NuxtLink
        to="/admin"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm group"
        :class="$route.path.startsWith('/admin')
          ? 'text-gold bg-gold/10 font-medium'
          : 'text-text-600 hover:bg-surface-500 hover:text-text'"
      >
        <Icon icon="lucide:shield" class="w-5 h-5 shrink-0" />
        <span v-if="!collapsed" class="whitespace-nowrap">Admin</span>
        <span v-if="!collapsed" class="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold font-medium">BETA</span>
      </NuxtLink>
    </nav>

    <!-- Bottom section -->
    <div class="p-2 border-t border-surface-500 space-y-1">
      <button
        @click="handleLogout"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm w-full text-left group"
        :class="'text-text-600 hover:bg-red-500/10 hover:text-red-400'"
      >
        <Icon icon="lucide:log-out" class="w-5 h-5 shrink-0" />
        <span v-if="!collapsed" class="whitespace-nowrap">Déconnexion</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { onMounted, nextTick, ref } from 'vue'
import { gsap } from 'gsap'

const props = defineProps<{ collapsed: boolean }>()
const emit = defineEmits(['toggle'])

const sidebarRef = ref<HTMLElement | null>(null)

const navItems = [
  { to: '/dashboard', label: 'Tableau de bord', icon: 'lucide:layout-dashboard' },
  { to: '/investments', label: 'Mes investissements', icon: 'lucide:briefcase' },
  { to: '/investments/private-equity', label: 'Private Equity', icon: 'lucide:briefcase' },
  { to: '/vault', label: 'Coffre-fort', icon: 'lucide:vault' },
  { to: '/dividends', label: 'Dividendes', icon: 'lucide:hand-coins' },
  { to: '/goals', label: 'Objectifs', icon: 'lucide:target' },
  { to: '/reports', label: 'Rapports', icon: 'lucide:bar-chart-3' },
  { to: '/activity', label: 'Activité', icon: 'lucide:history' },
  { to: '/badges', label: 'Badges', icon: 'lucide:trophy' },
  { to: '/profile', label: 'Profil investisseur', icon: 'lucide:user-circle' },
]

async function handleLogout() {
  await $fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
  window.location.href = '/login'
}
</script>
