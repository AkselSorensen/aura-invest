<template>
  <NuxtLayout name="admin">
    <div ref="pageRef">
      <h1 class="text-2xl font-bold text-text mb-8">Dashboard Admin</h1>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="glass p-5">
          <div class="text-text-600 text-xs uppercase tracking-wider mb-1">Utilisateurs</div>
          <div class="text-2xl font-bold text-text">{{ stats.users }}</div>
        </div>
        <div class="glass p-5">
          <div class="text-text-600 text-xs uppercase tracking-wider mb-1">Investissements</div>
          <div class="text-2xl font-bold text-text">{{ stats.investments }}</div>
        </div>
        <div class="glass p-5">
          <div class="text-text-600 text-xs uppercase tracking-wider mb-1">Patrimoine total</div>
          <div class="text-2xl font-bold text-text">{{ formatCurrency(stats.totalValue) }}</div>
        </div>
      </div>

      <!-- Recent users -->
      <div class="glass p-5">
        <h3 class="text-sm font-semibold text-text mb-4">Utilisateurs récents</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-text-700">
                <th class="pb-3 font-medium">Nom</th>
                <th class="pb-3 font-medium">Email</th>
                <th class="pb-3 font-medium">Rôle</th>
                <th class="pb-3 font-medium">Inscription</th>
                <th class="pb-3 font-medium">Invest.</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in recentUsers" :key="user.id" class="border-t border-surface-500">
                <td class="py-3 text-text">{{ user.name }}</td>
                <td class="py-3 text-text-600">{{ user.email }}</td>
                <td class="py-3">
                  <span class="text-xs px-2 py-0.5 rounded-full" :class="user.role === 'admin' ? 'bg-gold/20 text-gold' : 'bg-surface-500 text-text-600'">
                    {{ user.role }}
                  </span>
                </td>
                <td class="py-3 text-text-700">{{ formatDate(user.created_at) }}</td>
                <td class="py-3 text-text">{{ user.investment_count }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'

definePageMeta({ middleware: 'admin', layout: false })

const pageRef = ref<HTMLElement | null>(null)
const stats = ref({ users: 0, investments: 0, totalValue: 0 })
const recentUsers = ref<any[]>([])

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)
}
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR')
}

onMounted(async () => {
  try {
    const [statsRes, usersRes] = await Promise.all([
      $fetch('/api/admin/stats', { credentials: 'include' }),
      $fetch('/api/admin/users', { credentials: 'include' })
    ])
    stats.value = statsRes as any
    recentUsers.value = usersRes as any[]
  } catch {}

  nextTick(() => {
    gsap.fromTo(pageRef.value?.children || [], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' })
  })
})
</script>
