<template>
  <NuxtLayout name="dashboard">
    <!-- Profile gate -->
    <ProfileGate v-if="!profileCompleted" />

    <div v-if="profileCompleted" ref="pageRef">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <div class="flex items-center gap-2 text-text-700 text-xs mb-2">
            <Icon icon="lucide:home" class="w-3.5 h-3.5" />
            <Icon icon="lucide:chevron-right" class="w-3 h-3" />
            <Icon icon="lucide:briefcase" class="w-3.5 h-3.5" />
            <span class="text-text-600">Mes investissements</span>
          </div>
          <h1 class="text-2xl font-bold text-text">Mes investissements</h1>
          <p class="text-text-600 mt-1 flex items-center gap-1.5">
            <Icon icon="lucide:wallet" class="w-3.5 h-3.5" />
            {{ investments.length }} investissement{{ investments.length > 1 ? 's' : '' }} · {{ formatCurrency(totalValue) }}
          </p>
        </div>
        <button @click="showForm = true" class="flex items-center gap-2 px-4 py-2.5 bg-gold text-dark font-semibold rounded-lg hover:bg-gold-400 transition-colors text-sm shadow-lg shadow-gold/10">
          <Icon icon="lucide:plus-circle" class="w-4.5 h-4.5" />
          Ajouter
        </button>
      </div>

      <!-- Dividend KPIs -->
      <div v-if="dividendStocks.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div class="glass p-3">
          <div class="text-text-600 text-[10px] uppercase tracking-wider mb-0.5">Revenu annuel</div>
          <div class="text-lg font-bold text-green-400">{{ formatCurrency(totalDividends) }}</div>
        </div>
        <div class="glass p-3">
          <div class="text-text-600 text-[10px] uppercase tracking-wider mb-0.5">Rendement moyen</div>
          <div class="text-lg font-bold text-text">{{ avgYield.toFixed(2) }}%</div>
        </div>
        <div class="glass p-3">
          <div class="text-text-600 text-[10px] uppercase tracking-wider mb-0.5">Mensuel</div>
          <div class="text-lg font-bold text-text">{{ formatCurrency(totalDividends / 12) }}</div>
        </div>
        <div class="glass p-3">
          <div class="text-text-600 text-[10px] uppercase tracking-wider mb-0.5">Positions</div>
          <div class="text-lg font-bold text-text">{{ dividendStocks.length }}</div>
        </div>
      </div>

      <!-- Category filters -->
      <div class="flex gap-2 mb-6 overflow-x-auto pb-1" v-if="categories.length > 0">
        <button
          @click="activeCategory = ''"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap"
          :class="activeCategory === '' ? 'bg-gold text-dark' : 'bg-surface-500 text-text-600 hover:text-text'"
        >
          <Icon icon="lucide:grid-3x3" class="w-3.5 h-3.5" />
          Tout
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          @click="activeCategory = activeCategory === cat.slug ? '' : cat.slug"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border"
          :class="activeCategory === cat.slug ? 'text-text border-current' : 'text-text-600 border-surface-500 hover:text-text hover:border-text-700'"
          :style="{ borderColor: activeCategory === cat.slug ? cat.color : undefined }"
        >
          <Icon :icon="cat.icon" class="w-3.5 h-3.5" :style="{ color: activeCategory === cat.slug ? cat.color : undefined }" />
          {{ cat.name }}
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="filteredInvestments.length === 0 && !activeCategory" class="glass p-14 text-center">
        <div class="w-20 h-20 rounded-2xl bg-surface-500 flex items-center justify-center mx-auto mb-5">
          <Icon icon="lucide:briefcase" class="w-10 h-10 text-text-700 opacity-30" />
        </div>
        <p class="text-text-600 text-lg font-medium mb-1">Aucun investissement</p>
        <p class="text-text-700 text-sm mb-6">Ajoutez votre premier actif pour commencer à suivre votre patrimoine.</p>
        <button @click="showForm = true" class="inline-flex items-center gap-2 px-5 py-3 bg-gold text-dark font-semibold rounded-xl hover:bg-gold-400 transition-colors text-sm">
          <Icon icon="lucide:plus-circle" class="w-4.5 h-4.5" />
          Ajouter un investissement
        </button>
      </div>

      <!-- Empty filter result -->
      <div v-else-if="filteredInvestments.length === 0 && activeCategory" class="glass p-12 text-center">
        <Icon icon="lucide:search-x" class="w-12 h-12 mx-auto mb-3 text-text-700 opacity-30" />
        <p class="text-text-600 text-sm">Aucun résultat pour cette catégorie</p>
        <button @click="activeCategory = ''" class="text-gold hover:text-gold-400 text-sm mt-2 inline-flex items-center gap-1">
          <Icon icon="lucide:arrow-left" class="w-3.5 h-3.5" /> Voir tout
        </button>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          v-for="(inv, i) in filteredInvestments"
          :key="inv.id"
          class="glass p-4 cursor-pointer hover:border-gold/20 transition-all group hover:-translate-y-0.5"
          :ref="el => { if (i < 6) cardRefs[i] = el }"
          @click="navigateTo(`/investments/${inv.id}`)"
        >
          <!-- Image or icon -->
          <div class="w-full h-40 rounded-xl bg-surface-500 mb-3.5 overflow-hidden flex items-center justify-center relative">
            <img v-if="inv.image_url" :src="inv.image_url" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div v-else class="flex flex-col items-center gap-2">
              <Icon :icon="inv.category_icon || 'lucide:folder'" class="w-12 h-12 opacity-20" :style="{ color: inv.category_color || '#C9A84C' }" />
            </div>
            <!-- Type badge -->
            <div class="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-md bg-dark/70 backdrop-blur-sm text-[10px] text-text-600">
              <Icon :icon="inv.type === 'physical' ? 'lucide:box' : 'lucide:bar-chart-3'" class="w-3 h-3" />
              {{ inv.type === 'physical' ? 'Physique' : 'Financier' }}
            </div>
          </div>

          <!-- Info -->
          <div>
            <div class="flex items-start justify-between gap-2 mb-1.5">
              <h3 class="font-semibold text-text truncate text-[15px]">{{ inv.name }}</h3>
              <span class="text-[10px] px-2 py-0.5 rounded-full shrink-0 font-medium" :style="{ backgroundColor: inv.category_color + '20', color: inv.category_color }">
                {{ inv.category_name }}
              </span>
            </div>

            <div class="flex items-center justify-between mb-2">
              <span class="text-lg font-bold text-text tabular-nums">{{ formatCurrency(inv.current_value) }}</span>
              <span class="text-xs flex items-center gap-0.5"
                :class="Number(inv.current_value) >= Number(inv.purchase_price) ? 'text-success' : 'text-danger'">
                <Icon :icon="Number(inv.current_value) >= Number(inv.purchase_price) ? 'lucide:arrow-up' : 'lucide:arrow-down'" class="w-3 h-3" />
                {{ Number(inv.current_value) >= Number(inv.purchase_price) ? '+' : '' }}{{ formatCurrency(Number(inv.current_value) - Number(inv.purchase_price)) }}
              </span>
            </div>

            <div class="flex items-center gap-3 text-[11px] text-text-700">
              <span class="flex items-center gap-1">
                <Icon icon="lucide:calendar" class="w-3 h-3" />
                {{ formatDate(inv.purchase_date) }}
              </span>
              <span class="flex items-center gap-1">
                <Icon icon="lucide:hash" class="w-3 h-3" />
                x{{ inv.quantity }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Form modal -->
      <InvestmentForm v-if="showForm" @close="showForm = false; refresh()" />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'

definePageMeta({ middleware: 'auth', layout: false })

const pageRef = ref<HTMLElement | null>(null)
const investments = ref<any[]>([])
const categories = ref<any[]>([])
const activeCategory = ref('')
const showForm = ref(false)
const cardRefs = ref<any[]>([])
const profileCompleted = ref(false)

const totalValue = computed(() => investments.value.reduce((sum, inv) => sum + Number(inv.current_value), 0))

const filteredInvestments = computed(() => {
  if (!activeCategory.value) return investments.value
  return investments.value.filter(inv => inv.category_slug === activeCategory.value)
})

const dividendStocks = computed(() => investments.value.filter((i: any) => i.category_slug === 'actions-etf'))
const totalDividends = computed(() => dividendStocks.value.reduce((s: number, i: any) => s + Number(i.dividend_amount || (Number(i.current_value) * (i.dividend_yield || 0) / 100)), 0))
const avgYield = computed(() => {
  const withYield = dividendStocks.value.filter((s: any) => (s.dividend_yield || 0) > 0)
  if (withYield.length === 0) return 0
  return withYield.reduce((s: number, i: any) => s + Number(i.dividend_yield || 0), 0) / withYield.length
})

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)
}
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR')
}

async function refresh() {
  try {
    const [invRes, catRes] = await Promise.all([
      $fetch('/api/investments', { credentials: 'include' }),
      $fetch('/api/categories', { credentials: 'include' })
    ])
    investments.value = invRes as any[]
    categories.value = catRes as any[]
  } catch {}
}

onMounted(async () => {
  try { await $fetch('/api/auth/setup', { method: 'POST' }) } catch {}
  try { await $fetch('/api/profile/setup', { method: 'POST' }) } catch {}

  try {
    const profileRes = await $fetch('/api/profile', { credentials: 'include' }) as any
    profileCompleted.value = profileRes.completed
    if (!profileRes.completed) return
  } catch { return }

  await refresh()
  nextTick(() => {
    gsap.fromTo(pageRef.value?.children || [], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' })
  })
})
</script>
