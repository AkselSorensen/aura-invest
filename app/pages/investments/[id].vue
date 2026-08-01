<template>
  <NuxtLayout name="dashboard">
    <div v-if="investment" ref="pageRef">
      <NuxtLink to="/investments" class="inline-flex items-center gap-1.5 text-text-600 hover:text-text transition-colors text-sm mb-6">
        <Icon icon="lucide:arrow-left" class="w-4 h-4" /> Retour aux investissements
      </NuxtLink>

      <!-- Header -->
      <div class="glass-lg p-6 mb-6">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h1 class="text-xl font-bold text-text">{{ investment.name }}</h1>
            <div class="flex items-center gap-2 mt-1.5">
              <span class="text-xs px-2 py-0.5 rounded-full" :style="{ backgroundColor: investment.category_color + '20', color: investment.category_color }">{{ investment.category_name }}</span>
              <span v-if="stockData?.symbol" class="text-xs text-text-700">{{ stockData.symbol }}</span>
            </div>
          </div>
          <div class="text-right" v-if="stockData?.currentPrice">
            <div class="text-2xl font-bold text-text">{{ formatPrice(stockData.currentPrice) }}</div>
            <div class="text-xs text-text-600">{{ stockData.currency }}</div>
          </div>
        </div>
      </div>

      <!-- KPIs row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div class="glass p-3"><div class="text-text-600 text-[10px] uppercase tracking-wider">Valeur actuelle</div><div class="text-lg font-bold text-text">{{ formatCurrency(investment.current_value) }}</div></div>
        <div class="glass p-3"><div class="text-text-600 text-[10px] uppercase tracking-wider">Prix d'achat / PRU</div><div class="text-lg font-bold text-text">{{ formatCurrency(investment.purchase_price) }}</div></div>
        <div class="glass p-3"><div class="text-text-600 text-[10px] uppercase tracking-wider">Plus-value</div><div class="text-lg font-bold" :class="gain >= 0 ? 'text-green-400' : 'text-red-400'">{{ gain >= 0 ? '+' : '' }}{{ formatCurrency(gain) }} ({{ gainPercent >= 0 ? '+' : '' }}{{ gainPercent.toFixed(1) }}%)</div></div>
        <div class="glass p-3"><div class="text-text-600 text-[10px] uppercase tracking-wider">Quantité</div><div class="text-lg font-bold text-text">{{ investment.quantity }}</div></div>
      </div>

      <!-- Yahoo Finance Data (when stock) -->
      <template v-if="stockData">
        <!-- Price chart (simple bar visualization) -->
        <div class="glass p-5 mb-6">
          <h3 class="text-sm font-semibold text-text flex items-center gap-2 mb-4"><Icon icon="lucide:chart-line" class="w-4 h-4 text-gold" />Historique 6 mois</h3>
          <div class="flex items-end gap-[2px] h-32">
            <div v-for="(h, i) in stockData.history" :key="i" class="flex-1 rounded-t-[1px] transition-all"
              :style="{ height: historyHeight(h, stockData.history) + '%', backgroundColor: h.close >= (stockData.history[0]?.close || 0) ? '#22C55E30' : '#EF444430' }" :title="h.date + ': ' + h.close" />
          </div>
          <div class="flex justify-between text-[10px] text-text-700 mt-1.5">
            <span>{{ stockData.history[0]?.date }}</span>
            <span>{{ stockData.history[stockData.history.length - 1]?.date }}</span>
          </div>
        </div>

        <!-- Market data -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div class="glass p-3" v-if="stockData.marketCap"><div class="text-text-600 text-[10px] uppercase tracking-wider">Market Cap</div><div class="text-sm font-bold text-text">{{ formatLarge(stockData.marketCap) }}</div></div>
          <div class="glass p-3" v-if="stockData.peRatio"><div class="text-text-600 text-[10px] uppercase tracking-wider">P/E Ratio</div><div class="text-sm font-bold text-text">{{ stockData.peRatio?.toFixed(2) }}</div></div>
          <div class="glass p-3" v-if="stockData.forwardPE"><div class="text-text-600 text-[10px] uppercase tracking-wider">Forward P/E</div><div class="text-sm font-bold text-text">{{ stockData.forwardPE?.toFixed(2) }}</div></div>
          <div class="glass p-3" v-if="stockData.beta"><div class="text-text-600 text-[10px] uppercase tracking-wider">Beta</div><div class="text-sm font-bold text-text">{{ stockData.beta?.toFixed(2) }}</div></div>
          <div class="glass p-3" v-if="stockData.eps"><div class="text-text-600 text-[10px] uppercase tracking-wider">EPS</div><div class="text-sm font-bold text-text">{{ formatPrice(stockData.eps) }}</div></div>
          <div class="glass p-3" v-if="stockData.fiftyTwoWeekHigh"><div class="text-text-600 text-[10px] uppercase tracking-wider">52w High</div><div class="text-sm font-bold text-text">{{ formatPrice(stockData.fiftyTwoWeekHigh) }}</div></div>
          <div class="glass p-3" v-if="stockData.fiftyTwoWeekLow"><div class="text-text-600 text-[10px] uppercase tracking-wider">52w Low</div><div class="text-sm font-bold text-text">{{ formatPrice(stockData.fiftyTwoWeekLow) }}</div></div>
          <div class="glass p-3" v-if="stockData.avgVolume"><div class="text-text-600 text-[10px] uppercase tracking-wider">Vol. moyen</div><div class="text-sm font-bold text-text">{{ formatLarge(stockData.avgVolume) }}</div></div>
        </div>

        <!-- Dividends + Earnings -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="glass p-5" v-if="stockData.dividendYield || stockData.exDividendDate">
            <h3 class="text-sm font-semibold text-text flex items-center gap-2 mb-3"><Icon icon="lucide:hand-coins" class="w-4 h-4 text-green-400" />Dividendes</h3>
            <div class="space-y-2 text-sm">
              <div v-if="stockData.dividendYield" class="flex justify-between"><span class="text-text-600">Rendement</span><span class="text-green-400 font-bold">{{ stockData.dividendYield.toFixed(2) }}%</span></div>
              <div v-if="stockData.dividendRate" class="flex justify-between"><span class="text-text-600">Dividende / action</span><span class="text-text">{{ formatPrice(stockData.dividendRate) }}</span></div>
              <div v-if="stockData.exDividendDate" class="flex justify-between"><span class="text-text-600">Prochain détachement</span><span class="text-text">{{ formatDate(stockData.exDividendDate) }}</span></div>
              <div v-if="stockData.nextEarningsDate" class="flex justify-between"><span class="text-text-600">Prochains résultats</span><span class="text-text">{{ formatDate(stockData.nextEarningsDate) }}</span></div>
            </div>
          </div>

          <!-- Analysts -->
          <div class="glass p-5" v-if="stockData.analystConsensus">
            <h3 class="text-sm font-semibold text-text flex items-center gap-2 mb-3"><Icon icon="lucide:users" class="w-4 h-4 text-blue-400" />Analystes</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-text-600">Consensus</span><span class="font-bold" :class="consensusColor(stockData.analystConsensus)">{{ stockData.analystConsensus }}</span></div>
              <div v-if="stockData.analystTargetMean" class="flex justify-between"><span class="text-text-600">Objectif moyen</span><span class="text-text font-bold">{{ formatPrice(stockData.analystTargetMean) }}</span></div>
              <div v-if="stockData.analystTargetHigh" class="flex justify-between"><span class="text-text-600">Objectif haut</span><span class="text-text">{{ formatPrice(stockData.analystTargetHigh) }}</span></div>
              <div v-if="stockData.analystTargetLow" class="flex justify-between"><span class="text-text-600">Objectif bas</span><span class="text-text">{{ formatPrice(stockData.analystTargetLow) }}</span></div>
              <div v-if="stockData.totalAnalysts" class="flex justify-between"><span class="text-text-600">Nombre d'analystes</span><span class="text-text">{{ stockData.totalAnalysts }}</span></div>
            </div>
            <!-- Breakdown bars -->
            <div v-if="stockData.analystBreakdown" class="mt-3 space-y-1">
              <div class="flex items-center gap-2 text-xs"><span class="w-16 text-text-700">Strong Buy</span><div class="flex-1 h-2 bg-surface-500 rounded-full overflow-hidden"><div class="h-full bg-green-500 rounded-full" :style="{ width: analystBar(stockData.analystBreakdown.strongBuy) + '%' }" /></div><span class="w-6 text-right text-text">{{ stockData.analystBreakdown.strongBuy }}</span></div>
              <div class="flex items-center gap-2 text-xs"><span class="w-16 text-text-700">Buy</span><div class="flex-1 h-2 bg-surface-500 rounded-full overflow-hidden"><div class="h-full bg-green-400 rounded-full" :style="{ width: analystBar(stockData.analystBreakdown.buy) + '%' }" /></div><span class="w-6 text-right text-text">{{ stockData.analystBreakdown.buy }}</span></div>
              <div class="flex items-center gap-2 text-xs"><span class="w-16 text-text-700">Hold</span><div class="flex-1 h-2 bg-surface-500 rounded-full overflow-hidden"><div class="h-full bg-yellow-400 rounded-full" :style="{ width: analystBar(stockData.analystBreakdown.hold) + '%' }" /></div><span class="w-6 text-right text-text">{{ stockData.analystBreakdown.hold }}</span></div>
              <div class="flex items-center gap-2 text-xs"><span class="w-16 text-text-700">Sell</span><div class="flex-1 h-2 bg-surface-500 rounded-full overflow-hidden"><div class="h-full bg-orange-400 rounded-full" :style="{ width: analystBar(stockData.analystBreakdown.sell) + '%' }" /></div><span class="w-6 text-right text-text">{{ stockData.analystBreakdown.sell }}</span></div>
              <div class="flex items-center gap-2 text-xs"><span class="w-16 text-text-700">Strong Sell</span><div class="flex-1 h-2 bg-surface-500 rounded-full overflow-hidden"><div class="h-full bg-red-400 rounded-full" :style="{ width: analystBar(stockData.analystBreakdown.strongSell) + '%' }" /></div><span class="w-6 text-right text-text">{{ stockData.analystBreakdown.strongSell }}</span></div>
            </div>
          </div>
        </div>

        <!-- Company profile -->
        <div class="glass p-5 mb-6" v-if="stockData.description">
          <h3 class="text-sm font-semibold text-text flex items-center gap-2 mb-3"><Icon icon="lucide:building-2" class="w-4 h-4 text-gold" />Profil</h3>
          <div class="flex flex-wrap gap-3 mb-3 text-xs">
            <span v-if="stockData.sector" class="px-2 py-1 rounded bg-surface-500 text-text-600"><Icon icon="lucide:layers" class="w-3 h-3 inline mr-1" />{{ stockData.sector }}</span>
            <span v-if="stockData.industry" class="px-2 py-1 rounded bg-surface-500 text-text-600">{{ stockData.industry }}</span>
            <a v-if="stockData.website" :href="stockData.website" target="_blank" class="px-2 py-1 rounded bg-surface-500 text-blue-400 hover:underline">{{ stockData.website }}</a>
          </div>
          <p class="text-text-600 text-xs leading-relaxed line-clamp-5">{{ stockData.description }}</p>
        </div>
      </template>

      <!-- Actions -->
      <div class="flex gap-3">
        <button @click="showEdit = true" class="flex items-center gap-2 px-4 py-2.5 bg-surface-500 text-text rounded-lg hover:bg-surface-600 transition-colors text-sm"><Icon icon="lucide:pencil" class="w-4 h-4" />Modifier</button>
        <button @click="confirmDelete" class="flex items-center gap-2 px-4 py-2.5 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors text-sm"><Icon icon="lucide:trash-2" class="w-4 h-4" />Supprimer</button>
      </div>

      <InvestmentForm v-if="showEdit" :edit-data="investment" @close="showEdit = false; refresh()" />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({ middleware: 'auth', layout: false })
const route = useRoute()

const pageRef = ref<HTMLElement | null>(null)
const investment = ref<any>(null)
const stockData = ref<any>(null)
const showEdit = ref(false)

const gain = computed(() => Number(investment.value?.current_value || 0) - Number(investment.value?.purchase_price || 0))
const gainPercent = computed(() => { const cost = Number(investment.value?.purchase_price || 0); return cost > 0 ? (gain.value / cost) * 100 : 0 })

function formatCurrency(v: number) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v || 0) }
function formatPrice(v: number) { if (!v) return '-'; return v > 100 ? v.toFixed(0) : v > 1 ? v.toFixed(2) : v.toFixed(4) }
function formatDate(d: string) { if (!d) return ''; return new Date(d).toLocaleDateString('fr-FR') }
function formatLarge(v: number) { if (!v) return '-'; if (v >= 1e12) return (v / 1e12).toFixed(1) + 'T'; if (v >= 1e9) return (v / 1e9).toFixed(1) + 'B'; if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M'; return v.toLocaleString('fr-FR') }
function consensusColor(c: string) { return c?.includes('Buy') ? 'text-green-400' : c?.includes('Sell') ? 'text-red-400' : 'text-yellow-400' }
function analystBar(v: number) { return Math.min(v * 10, 100) }
function historyHeight(h: any, arr: any[]) {
  const min = Math.min(...arr.map((x: any) => x.close))
  const max = Math.max(...arr.map((x: any) => x.close))
  if (max === min) return 50
  return 10 + ((h.close - min) / (max - min)) * 80
}

async function refresh() {
  try { investment.value = await $fetch(`/api/investments/${route.params.id}`, { credentials: 'include' }) } catch { navigateTo('/investments') }
}

async function confirmDelete() {
  if (confirm('Supprimer cet investissement ?')) {
    await $fetch(`/api/investments/${route.params.id}`, { method: 'DELETE', credentials: 'include' })
    navigateTo('/investments')
  }
}

onMounted(async () => {
  await refresh()

  // Fetch Yahoo Finance data if stock/ETF
  const meta = investment.value?.metadata || {}
  const ticker = investment.value?.ticker || meta?.ticker
  if (ticker) {
    try { stockData.value = await $fetch(`/api/stock/detail?symbol=${encodeURIComponent(ticker)}`) } catch {}
  }
})
</script>
