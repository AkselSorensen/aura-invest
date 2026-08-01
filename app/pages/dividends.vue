<template>
  <NuxtLayout name="dashboard">
    <div ref="pageRef">
      <div class="mb-8">
        <div class="flex items-center gap-2 text-text-700 text-xs mb-2">
          <Icon icon="lucide:home" class="w-3.5 h-3.5" /> <Icon icon="lucide:chevron-right" class="w-3 h-3" />
          <Icon icon="lucide:hand-coins" class="w-3.5 h-3.5 text-green-400" /> <span class="text-text-600">Dividendes</span>
        </div>
        <h1 class="text-2xl font-bold text-text">Dividendes</h1>
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div class="glass p-4">
          <div class="text-text-600 text-xs uppercase tracking-wider mb-1">Revenu annuel</div>
          <div class="text-xl font-bold text-green-400">{{ formatCurrency(totalDividends) }}</div>
        </div>
        <div class="glass p-4">
          <div class="text-text-600 text-xs uppercase tracking-wider mb-1">Rendement moyen</div>
          <div class="text-xl font-bold text-text">{{ avgYield.toFixed(2) }}%</div>
        </div>
        <div class="glass p-4">
          <div class="text-text-600 text-xs uppercase tracking-wider mb-1">Mensuel</div>
          <div class="text-xl font-bold text-text">{{ formatCurrency(totalDividends / 12) }}</div>
        </div>
        <div class="glass p-4">
          <div class="text-text-600 text-xs uppercase tracking-wider mb-1">Positions</div>
          <div class="text-xl font-bold text-text">{{ stocks.length }}</div>
        </div>
      </div>

      <!-- Dividend yield by position -->
      <div class="glass p-5 mb-6">
        <h3 class="text-sm font-semibold text-text flex items-center gap-2 mb-4">
          <Icon icon="lucide:bar-chart-3" class="w-4 h-4 text-gold" /> Rendement par position
        </h3>
        <div v-if="stocks.length === 0" class="text-center py-8 text-text-700 text-sm">
          <Icon icon="lucide:trending-up" class="w-10 h-10 mx-auto mb-2 opacity-20" />
          Ajoutez des actions/ETF avec dividendes pour voir vos stats.
        </div>
        <div v-else class="space-y-3">
          <div v-for="s in stocks" :key="s.id" class="flex items-center gap-3">
            <span class="text-sm text-text font-medium w-24 truncate">{{ s.ticker || s.name }}</span>
            <div class="flex-1 h-2 bg-surface-500 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all" :style="{ width: Math.min(divYieldPct(s), 100) + '%', backgroundColor: s.category_color || '#C9A84C' }" />
            </div>
            <span class="text-sm text-text font-medium w-16 text-right tabular-nums">{{ formatCurrency(s.dividend_amount || (Number(s.current_value) * (s.dividend_yield || 0) / 100)) }}</span>
            <span class="text-xs text-green-400 w-14 text-right tabular-nums">{{ (s.dividend_yield || 0).toFixed(1) }}%</span>
          </div>
        </div>
      </div>

      <!-- Calendar placeholder -->
      <div class="glass p-5">
        <h3 class="text-sm font-semibold text-text flex items-center gap-2 mb-4">
          <Icon icon="lucide:calendar" class="w-4 h-4 text-gold" /> Prochains dividendes
        </h3>
        <div class="text-center py-10 text-text-700 text-sm">
          <Icon icon="lucide:calendar-clock" class="w-10 h-10 mx-auto mb-2 opacity-20" />
          <p class="font-medium">Calendrier à venir</p>
          <p class="text-xs mt-1">Les dates de détachement seront synchronisées automatiquement</p>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'

definePageMeta({ middleware: 'auth', layout: false })

const pageRef = ref<HTMLElement | null>(null)
const stocks = ref<any[]>([])

const totalDividends = computed(() => stocks.value.reduce((s, i) => s + Number(i.dividend_amount || (Number(i.current_value) * (i.dividend_yield || 0) / 100)), 0))
const avgYield = computed(() => {
  const withYield = stocks.value.filter(s => (s.dividend_yield || 0) > 0)
  if (withYield.length === 0) return 0
  return withYield.reduce((s, i) => s + Number(i.dividend_yield || 0), 0) / withYield.length
})

function divYieldPct(s: any) {
  if (totalDividends.value === 0) return 0
  const div = Number(s.dividend_amount || (Number(s.current_value) * (s.dividend_yield || 0) / 100))
  return (div / totalDividends.value) * 100
}

function formatCurrency(v: number) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v) }

onMounted(async () => {
  try {
    const all = await $fetch('/api/investments', { credentials: 'include' }) as any[]
    stocks.value = all.filter((i: any) => i.category_slug === 'actions-etf')
  } catch {}
  await nextTick()
  // Attendre que le DOM soit stable avant GSAP (évite écran noir sur mobile/PWA)
  if (pageRef.value?.children?.length) {
    gsap.fromTo(pageRef.value.children, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out' })
  }
})
</script>
