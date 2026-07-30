<template>
  <NuxtLayout name="dashboard">
    <div ref="pageRef">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <div class="flex items-center gap-2 text-text-700 text-xs mb-2">
            <Icon icon="lucide:home" class="w-3.5 h-3.5" />
            <Icon icon="lucide:chevron-right" class="w-3 h-3" />
            <Icon icon="lucide:briefcase" class="w-3.5 h-3.5 text-pink-400" />
            <span class="text-text-600">Private Equity</span>
          </div>
          <h1 class="text-2xl font-bold text-text">Private Equity</h1>
        </div>
        <button @click="showForm = true" class="flex items-center gap-2 px-4 py-2.5 bg-gold text-dark font-semibold rounded-lg hover:bg-gold-400 transition-colors text-sm">
          <Icon icon="lucide:plus-circle" class="w-4.5 h-4.5" /> Nouveau deal
        </button>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div class="glass p-4">
          <div class="text-text-600 text-xs uppercase tracking-wider mb-1">Deals actifs</div>
          <div class="text-xl font-bold text-text">{{ activeDeals }}</div>
        </div>
        <div class="glass p-4">
          <div class="text-text-600 text-xs uppercase tracking-wider mb-1">Montant investi</div>
          <div class="text-xl font-bold text-text">{{ formatCurrency(totalInvested) }}</div>
        </div>
        <div class="glass p-4">
          <div class="text-text-600 text-xs uppercase tracking-wider mb-1">MOIC moyen</div>
          <div class="text-xl font-bold text-text">{{ avgMoic }}x</div>
        </div>
        <div class="glass p-4">
          <div class="text-text-600 text-xs uppercase tracking-wider mb-1">Valorisation</div>
          <div class="text-xl font-bold text-text">{{ formatCurrency(totalValue) }}</div>
        </div>
      </div>

      <!-- Pipeline Kanban -->
      <div class="glass p-5 mb-6">
        <h3 class="text-sm font-semibold text-text flex items-center gap-2 mb-4">
          <Icon icon="lucide:kanban" class="w-4 h-4 text-pink-400" /> Pipeline
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div v-for="col in pipelineColumns" :key="col.key" class="space-y-2">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-medium" :class="col.color">{{ col.label }}</span>
              <span class="text-xs text-text-700 bg-surface-500 px-1.5 py-0.5 rounded">{{ getPipelineCount(col.key) }}</span>
            </div>
            <div v-for="deal in getPipelineDeals(col.key)" :key="deal.id"
              class="p-3 rounded-lg bg-surface-500/50 border border-surface-500 cursor-pointer hover:border-gold/20 transition-all text-sm"
              @click="navigateTo(`/investments/${deal.id}`)">
              <div class="font-medium text-text truncate">{{ deal.company_name || deal.name }}</div>
              <div class="flex items-center justify-between mt-1.5 text-xs text-text-700">
                <span>{{ deal.stage ? formatStage(deal.stage) : '' }}</span>
                <span class="font-medium tabular-nums">{{ formatCurrency(deal.current_value) }}</span>
              </div>
            </div>
            <div v-if="getPipelineDeals(col.key).length === 0" class="text-xs text-text-700 text-center py-4">—</div>
          </div>
        </div>
      </div>

      <!-- Deals table -->
      <div class="glass p-5">
        <h3 class="text-sm font-semibold text-text flex items-center gap-2 mb-4">
          <Icon icon="lucide:list" class="w-4 h-4 text-pink-400" /> Tous les deals
        </h3>
        <div v-if="deals.length === 0" class="text-center py-10 text-text-700 text-sm">
          <Icon icon="lucide:briefcase" class="w-10 h-10 mx-auto mb-2 opacity-20" />
          Aucun deal. Ajoutez votre premier investissement.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-text-700 border-b border-surface-500">
                <th class="pb-2 font-medium">Société</th>
                <th class="pb-2 font-medium">Stade</th>
                <th class="pb-2 font-medium">Equity</th>
                <th class="pb-2 font-medium">Investi</th>
                <th class="pb-2 font-medium">Valorisation</th>
                <th class="pb-2 font-medium">MOIC</th>
                <th class="pb-2 font-medium">IRR</th>
                <th class="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="deal in deals" :key="deal.id" class="border-b border-surface-500/50 hover:bg-surface-500/30 cursor-pointer transition-colors"
                @click="navigateTo(`/investments/${deal.id}`)">
                <td class="py-2.5 text-text font-medium">{{ deal.company_name || deal.name }}</td>
                <td class="py-2.5">{{ formatStage(deal.stage) }}</td>
                <td class="py-2.5 tabular-nums">{{ deal.equity_pct || 0 }}%</td>
                <td class="py-2.5 tabular-nums">{{ formatCurrency(deal.invested_amount || deal.purchase_price) }}</td>
                <td class="py-2.5 tabular-nums font-medium">{{ formatCurrency(deal.current_value) }}</td>
                <td class="py-2.5 tabular-nums">{{ deal.moic ? deal.moic + 'x' : '-' }}</td>
                <td class="py-2.5 tabular-nums" :class="deal.irr > 0 ? 'text-success' : ''">{{ deal.irr ? deal.irr + '%' : '-' }}</td>
                <td class="py-2.5">
                  <span class="text-xs px-2 py-0.5 rounded-full" :class="getExitStatusClass(deal.exit_status)">{{ formatExitStatus(deal.exit_status) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- PE Form -->
      <PeForm v-if="showForm" @close="showForm = false; refresh()" />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'

definePageMeta({ middleware: 'auth', layout: false })

const pageRef = ref<HTMLElement | null>(null)
const deals = ref<any[]>([])
const showForm = ref(false)

const pipelineColumns = [
  { key: 'sourcing', label: 'Sourcing', color: 'text-blue-400' },
  { key: 'due_dil', label: 'Due Diligence', color: 'text-yellow-400' },
  { key: 'negotiation', label: 'Négociation', color: 'text-orange-400' },
  { key: 'closed', label: 'Closed', color: 'text-green-400' },
]

const activeDeals = computed(() => deals.value.filter(d => d.exit_status === 'active').length)
const totalInvested = computed(() => deals.value.reduce((s, d) => s + Number(d.invested_amount || d.purchase_price || 0), 0))
const totalValue = computed(() => deals.value.reduce((s, d) => s + Number(d.current_value || 0), 0))
const avgMoic = computed(() => {
  const withMoic = deals.value.filter(d => d.moic > 0)
  if (withMoic.length === 0) return 0
  return (withMoic.reduce((s, d) => s + Number(d.moic), 0) / withMoic.length).toFixed(1)
})

function getPipelineDeals(status: string) { return deals.value.filter(d => d.pipeline_status === status) }
function getPipelineCount(status: string) { return getPipelineDeals(status).length }

function formatStage(s: string) {
  const m: Record<string, string> = { seed: 'Seed', series_a: 'Série A', series_b: 'Série B', series_c: 'Série C+', growth: 'Growth', pre_ipo: 'Pré-IPO' }
  return m[s] || s || '-'
}
function formatExitStatus(s: string) {
  const m: Record<string, string> = { active: 'Actif', exited: 'Sorti', written_off: 'Pertes', secondary: 'Secondary' }
  return m[s] || s || 'Actif'
}
function getExitStatusClass(s: string) {
  const m: Record<string, string> = { active: 'bg-blue-500/10 text-blue-400', exited: 'bg-green-500/10 text-green-400', written_off: 'bg-red-500/10 text-red-400', secondary: 'bg-yellow-500/10 text-yellow-400' }
  return m[s] || 'bg-surface-500 text-text-600'
}
function formatCurrency(v: number) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v) }

async function refresh() {
  try {
    // Get all investments and filter PE by category slug
    const all = await $fetch('/api/investments', { credentials: 'include' }) as any[]
    deals.value = all.filter((i: any) => i.category_slug === 'private-equity')
  } catch {}
}

onMounted(async () => {
  try { await $fetch('/api/migrations/add-columns', { method: 'POST' }) } catch {}
  try { await $fetch('/api/auth/setup', { method: 'POST' }) } catch {}
  await refresh()
  nextTick(() => { gsap.fromTo(pageRef.value?.children || [], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out' }) })
})
</script>
