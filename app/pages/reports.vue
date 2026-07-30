<template>
  <NuxtLayout name="dashboard">
    <div ref="pageRef">
      <div class="mb-8">
        <div class="flex items-center gap-2 text-text-700 text-xs mb-2">
          <Icon icon="lucide:home" class="w-3.5 h-3.5" /> <Icon icon="lucide:chevron-right" class="w-3 h-3" />
          <Icon icon="lucide:bar-chart-3" class="w-3.5 h-3.5 text-gold" /> <span class="text-text-600">Rapports</span>
        </div>
        <h1 class="text-2xl font-bold text-text">Rapports</h1>
      </div>

      <!-- Allocation -->
      <div class="glass-lg p-6 mb-6">
        <h3 class="text-sm font-semibold text-text flex items-center gap-2 mb-5">
          <Icon icon="lucide:pie-chart" class="w-4 h-4 text-gold" /> Allocation d'actifs
        </h3>
        <div class="flex flex-col md:flex-row gap-6">
          <!-- Donut -->
          <div class="relative w-48 h-48 shrink-0 mx-auto" ref="donutRef">
            <svg viewBox="0 0 200 200" class="w-full h-full -rotate-90">
              <circle cx="100" cy="100" r="80" fill="none" stroke="#252533" stroke-width="30" />
              <template v-for="(slice, i) in allocationSlices" :key="i">
                <circle cx="100" cy="100" r="80" fill="none" :stroke="slice.color" stroke-width="30"
                  :stroke-dasharray="slice.dashArray + ' ' + (502.65 - slice.dashArray)"
                  :stroke-dashoffset="slice.offset"
                  class="transition-all duration-1000" />
              </template>
              <text x="100" y="95" text-anchor="middle" fill="#F1F1F3" font-size="16" font-weight="bold" transform="rotate(90 100 100)">{{ formatCurrency(totalValue) }}</text>
              <text x="100" y="115" text-anchor="middle" fill="#71717A" font-size="11" transform="rotate(90 100 100)">Patrimoine total</text>
            </svg>
          </div>
          <!-- Legend -->
          <div class="flex-1 space-y-2">
            <div v-for="(slice, i) in allocationData" :key="i" class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: slice.color }" />
                <span class="text-text-600">{{ slice.name }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-text font-medium tabular-nums">{{ formatCurrency(slice.value) }}</span>
                <span class="text-text-700 text-xs tabular-nums w-10 text-right">{{ slice.percent.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top / Flop -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div class="glass p-5">
          <h3 class="text-sm font-semibold text-text flex items-center gap-2 mb-4">
            <Icon icon="lucide:arrow-up-circle" class="w-4 h-4 text-green-400" /> Top performers
          </h3>
          <div v-if="topPerformers.length === 0" class="text-text-700 text-sm text-center py-6">—</div>
          <div v-else class="space-y-2">
            <div v-for="(inv, i) in topPerformers" :key="inv.id" class="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-500 transition-colors">
              <span class="text-xs text-text-700 w-5">{{ i + 1 }}</span>
              <span class="text-sm text-text flex-1 truncate">{{ inv.name }}</span>
              <span class="text-sm text-green-400 font-medium tabular-nums">+{{ formatCurrency(gain(inv)) }}</span>
              <span class="text-xs text-green-400/70 tabular-nums">+{{ gainPct(inv).toFixed(1) }}%</span>
            </div>
          </div>
        </div>
        <div class="glass p-5">
          <h3 class="text-sm font-semibold text-text flex items-center gap-2 mb-4">
            <Icon icon="lucide:arrow-down-circle" class="w-4 h-4 text-red-400" /> À surveiller
          </h3>
          <div v-if="flopPerformers.length === 0" class="text-text-700 text-sm text-center py-6">—</div>
          <div v-else class="space-y-2">
            <div v-for="(inv, i) in flopPerformers" :key="inv.id" class="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-500 transition-colors">
              <span class="text-xs text-text-700 w-5">{{ i + 1 }}</span>
              <span class="text-sm text-text flex-1 truncate">{{ inv.name }}</span>
              <span class="text-sm text-red-400 font-medium tabular-nums">{{ formatCurrency(gain(inv)) }}</span>
              <span class="text-xs text-red-400/70 tabular-nums">{{ gainPct(inv).toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="glass p-4"><div class="text-text-600 text-xs uppercase tracking-wider mb-1">Total investi</div><div class="text-lg font-bold text-text">{{ formatCurrency(totalCost) }}</div></div>
        <div class="glass p-4"><div class="text-text-600 text-xs uppercase tracking-wider mb-1">Plus-value</div><div class="text-lg font-bold" :class="totalGain >= 0 ? 'text-green-400' : 'text-red-400'">{{ formatCurrency(totalGain) }}</div></div>
        <div class="glass p-4"><div class="text-text-600 text-xs uppercase tracking-wider mb-1">Nombre</div><div class="text-lg font-bold text-text">{{ investments.length }}</div></div>
        <div class="glass p-4"><div class="text-text-600 text-xs uppercase tracking-wider mb-1">Perf. globale</div><div class="text-lg font-bold" :class="totalGain >= 0 ? 'text-green-400' : 'text-red-400'">{{ totalGainPct >= 0 ? '+' : '' }}{{ totalGainPct.toFixed(1) }}%</div></div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'

definePageMeta({ middleware: 'auth', layout: false })

const pageRef = ref<HTMLElement | null>(null)
const donutRef = ref<HTMLElement | null>(null)
const investments = ref<any[]>([])

const totalValue = computed(() => investments.value.reduce((s, i) => s + Number(i.current_value), 0))
const totalCost = computed(() => investments.value.reduce((s, i) => s + Number(i.purchase_price), 0))
const totalGain = computed(() => totalValue.value - totalCost.value)
const totalGainPct = computed(() => totalCost.value > 0 ? (totalGain.value / totalCost.value) * 100 : 0)

const allocationData = computed(() => {
  const map: Record<string, { name: string; color: string; value: number }> = {}
  investments.value.forEach(i => {
    const key = i.category_name || 'Sans catégorie'
    if (!map[key]) map[key] = { name: key, color: i.category_color || '#71717A', value: 0 }
    map[key].value += Number(i.current_value)
  })
  return Object.values(map).map(c => ({
    ...c,
    percent: totalValue.value > 0 ? (c.value / totalValue.value) * 100 : 0
  })).sort((a, b) => b.value - a.value)
})

const CIRCUMFERENCE = 2 * Math.PI * 80 // r=80

const allocationSlices = computed(() => {
  let offset = 0
  return allocationData.value.map(slice => {
    const dashArray = (slice.percent / 100) * CIRCUMFERENCE
    const result = { color: slice.color, dashArray, offset: -offset }
    offset += dashArray
    return result
  })
})

const sortedByGain = computed(() =>
  [...investments.value].sort((a, b) => (Number(b.current_value) - Number(b.purchase_price)) - (Number(a.current_value) - Number(a.purchase_price)))
)
const topPerformers = computed(() => sortedByGain.value.filter(i => Number(i.current_value) > Number(i.purchase_price)).slice(0, 5))
const flopPerformers = computed(() => sortedByGain.value.filter(i => Number(i.current_value) <= Number(i.purchase_price)).slice(0, 5))

function gain(i: any) { return Number(i.current_value) - Number(i.purchase_price) }
function gainPct(i: any) { return Number(i.purchase_price) > 0 ? ((Number(i.current_value) - Number(i.purchase_price)) / Number(i.purchase_price)) * 100 : 0 }

function formatCurrency(v: number) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v) }

onMounted(async () => {
  try {
    investments.value = await $fetch('/api/investments', { credentials: 'include' }) as any[]
  } catch {}
  nextTick(() => { gsap.fromTo(pageRef.value?.children || [], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out' }) })
})
</script>
