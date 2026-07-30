<template>
  <NuxtLayout name="dashboard">
    <div ref="pageRef">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-text flex items-center gap-2.5"><Icon icon="lucide:history" class="w-6 h-6 text-gold" /> Activité</h1>
        <p class="text-text-600 mt-1">Historique de toutes vos actions</p>
      </div>

      <div class="glass p-5">
        <div v-if="logs.length === 0" class="text-center py-10 text-text-700 text-sm">
          <Icon icon="lucide:clock" class="w-10 h-10 mx-auto mb-2 opacity-20" /> Aucune activité
        </div>
        <div v-else class="space-y-0">
          <div v-for="log in logs" :key="log.id" class="flex items-start gap-3 py-3 border-b border-surface-500/50 last:border-0">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="getLogBg(log.action)">
              <Icon :icon="getLogIcon(log.action)" class="w-4 h-4" :class="getLogColor(log.action)" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm text-text">{{ log.details || formatLog(log) }}</div>
              <div class="text-xs text-text-700 mt-0.5">{{ formatTime(log.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
definePageMeta({ middleware: 'auth', layout: false })
const logs = ref<any[]>([])

function getLogIcon(a: string) { const m: Record<string, string> = { create: 'lucide:plus-circle', update: 'lucide:pencil', delete: 'lucide:trash-2', login: 'lucide:log-in', sync: 'lucide:refresh-cw' }; return m[a] || 'lucide:activity' }
function getLogColor(a: string) { const m: Record<string, string> = { create: 'text-green-400', update: 'text-blue-400', delete: 'text-red-400', login: 'text-gold', sync: 'text-purple-400' }; return m[a] || 'text-text-600' }
function getLogBg(a: string) { const m: Record<string, string> = { create: 'bg-green-500/10', update: 'bg-blue-500/10', delete: 'bg-red-500/10', login: 'bg-gold/10', sync: 'bg-purple-500/10' }; return m[a] || 'bg-surface-500' }
function formatLog(l: any) { return `${l.action} ${l.entity_type}${l.entity_id ? ' #' + l.entity_id : ''}` }
function formatTime(t: string) { return new Date(t).toLocaleString('fr-FR') }

onMounted(async () => {
  try { await $fetch('/api/activity/setup', { method: 'POST' }) } catch {}
  try { logs.value = await $fetch('/api/activity', { credentials: 'include' }) as any[] } catch {}
})
</script>
