<template>
  <NuxtLayout name="admin">
    <div>
      <h1 class="text-2xl font-bold text-text mb-8">Utilisateurs</h1>
      <div class="glass p-5">
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-text-700">
                <th class="pb-3 font-medium">ID</th>
                <th class="pb-3 font-medium">Nom</th>
                <th class="pb-3 font-medium">Email</th>
                <th class="pb-3 font-medium">Rôle</th>
                <th class="pb-3 font-medium">Invest.</th>
                <th class="pb-3 font-medium">Valeur totale</th>
                <th class="pb-3 font-medium">Inscription</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id" class="border-t border-surface-500">
                <td class="py-3 text-text-700">{{ user.id }}</td>
                <td class="py-3 text-text">{{ user.name }}</td>
                <td class="py-3 text-text-600">{{ user.email }}</td>
                <td class="py-3">
                  <span class="text-xs px-2 py-0.5 rounded-full" :class="user.role === 'admin' ? 'bg-gold/20 text-gold' : 'bg-surface-500 text-text-600'">
                    {{ user.role }}
                  </span>
                </td>
                <td class="py-3 text-text">{{ user.investment_count }}</td>
                <td class="py-3 text-text">{{ formatCurrency(Number(user.total_value) || 0) }}</td>
                <td class="py-3 text-text-700">{{ formatDate(user.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({ middleware: 'admin', layout: false })

const users = ref<any[]>([])

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)
}
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR')
}

onMounted(async () => {
  try {
    users.value = await $fetch('/api/admin/users', { credentials: 'include' }) as any[]
  } catch {}
})
</script>
