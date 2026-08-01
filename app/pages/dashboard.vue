<template>
  <NuxtLayout name="dashboard">
    <div ref="pageRef">
      <div class="mb-8">
        <div class="flex items-center gap-2 text-text-700 text-xs mb-2"><Icon icon="lucide:home" class="w-3.5 h-3.5" /><Icon icon="lucide:chevron-right" class="w-3 h-3" /><span class="text-text-600">Tableau de bord</span></div>
        <h1 class="text-2xl font-bold text-text">Tableau de bord</h1>
        <p class="text-text-600 mt-1">Vue d'ensemble de votre patrimoine</p>
      </div>

      <div v-if="!profileCompleted" class="glass p-4 mb-6 flex items-center gap-3 border border-gold/20 bg-gold/5">
        <div class="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center shrink-0"><Icon icon="lucide:alert-circle" class="w-5 h-5 text-gold" /></div>
        <div class="flex-1"><div class="text-sm font-medium text-text">Complétez votre profil investisseur</div><div class="text-xs text-text-600">Définissez vos objectifs pour une expérience personnalisée.</div></div>
        <NuxtLink to="/profile" class="flex items-center gap-1.5 px-4 py-2 bg-gold text-dark font-semibold rounded-lg hover:bg-gold-400 transition-colors text-sm shrink-0"><Icon icon="lucide:user-circle" class="w-4 h-4" /> Compléter</NuxtLink>
      </div>

      <!-- Insurance alerts -->
      <div v-if="expiringInsurance.length > 0" class="glass p-4 mb-6 flex items-center gap-3 border border-orange-500/30 bg-orange-500/5">
        <div class="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0"><Icon icon="lucide:shield-alert" class="w-5 h-5 text-orange-400" /></div>
        <div class="flex-1">
          <div class="text-sm font-medium text-text">Assurances à renouveler</div>
          <div class="text-xs text-text-600">{{ expiringInsurance.length }} objet{{ expiringInsurance.length > 1 ? 's' : '' }} — 
            <span v-for="(item, i) in expiringInsurance" :key="item.id">
              {{ item.name }} ({{ insuranceDaysLeft(item) }}j){{ i < expiringInsurance.length - 1 ? ', ' : '' }}
            </span>
          </div>
        </div>
        <NuxtLink to="/vault" class="text-xs text-orange-400 hover:text-orange-300 underline shrink-0">Voir</NuxtLink>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6"><SmartInput @added="refreshDashboard" /><SmartAlerts :investments="investments" /></div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="glass p-5"><div class="flex items-center justify-between mb-3"><div class="text-text-600 text-xs uppercase tracking-wider">Patrimoine total</div><div class="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center"><Icon icon="lucide:wallet" class="w-4.5 h-4.5 text-gold" /></div></div><div class="text-2xl font-bold text-text">{{ formatCurrency(totalValue) }}</div><div class="flex items-center gap-1.5 mt-2 text-text-700 text-xs"><Icon icon="lucide:briefcase" class="w-3.5 h-3.5" />{{ investments.length }} investissement{{ investments.length > 1 ? 's' : '' }}</div></div>
        <div class="glass p-5"><div class="flex items-center justify-between mb-3"><div class="text-text-600 text-xs uppercase tracking-wider">Plus-value latente</div><div class="w-9 h-9 rounded-lg flex items-center justify-center" :class="gain >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'"><Icon :icon="gain >= 0 ? 'lucide:trending-up' : 'lucide:trending-down'" class="w-4.5 h-4.5" :class="gain >= 0 ? 'text-green-400' : 'text-red-400'" /></div></div><div class="text-2xl font-bold" :class="gain >= 0 ? 'text-success' : 'text-danger'">{{ gain >= 0 ? '+' : '' }}{{ formatCurrency(gain) }}</div><div class="flex items-center gap-1.5 mt-2 text-xs" :class="gain >= 0 ? 'text-green-400/60' : 'text-red-400/60'"><Icon :icon="gainPercent >= 0 ? 'lucide:arrow-up-right' : 'lucide:arrow-down-right'" class="w-3.5 h-3.5" />{{ gainPercent >= 0 ? '+' : '' }}{{ gainPercent.toFixed(1) }}%</div></div>
        <div class="glass p-5"><div class="flex items-center justify-between mb-3"><div class="text-text-600 text-xs uppercase tracking-wider">Catégories</div><div class="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center"><Icon icon="lucide:layers" class="w-4.5 h-4.5 text-purple-400" /></div></div><div class="text-2xl font-bold text-text">{{ usedCategories.length }}</div><div class="flex items-center gap-1.5 mt-2 text-text-700 text-xs"><Icon icon="lucide:tags" class="w-3.5 h-3.5" />sur {{ categories.length }} disponibles</div></div>
        <div class="glass p-5"><div class="flex items-center justify-between mb-3"><div class="text-text-600 text-xs uppercase tracking-wider">vs CAC 40</div><div class="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center"><Icon icon="lucide:trending-up" class="w-4.5 h-4.5 text-blue-400" /></div></div><div class="text-2xl font-bold tabular-nums" :class="benchmark.vsMarket >= 0 ? 'text-green-400' : 'text-red-400'">{{ benchmark.portfolio.performance >= 0 ? '+' : '' }}{{ benchmark.portfolio.performance.toFixed(1) }}%</div><div class="flex items-center gap-2 mt-1.5 text-xs"><span class="text-text-600">Portefeuille</span><span class="w-1.5 h-1.5 rounded-full bg-text-600" /><span class="text-text-700">CAC 40 {{ benchmark.cac40.performance >= 0 ? '+' : '' }}{{ benchmark.cac40.performance.toFixed(1) }}%</span></div><div class="flex items-center gap-1.5 mt-1 text-xs" :class="benchmark.vsMarket >= 0 ? 'text-green-400/60' : 'text-red-400/60'"><Icon :icon="benchmark.vsMarket >= 0 ? 'lucide:trophy' : 'lucide:alert-triangle'" class="w-3 h-3" />{{ benchmark.vsMarket >= 0 ? '+' : '' }}{{ benchmark.vsMarket.toFixed(1) }}% vs marché</div></div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="glass p-5 lg:col-span-1"><div class="flex items-center gap-2 mb-4"><Icon icon="lucide:pie-chart" class="w-4 h-4 text-gold" /><h3 class="text-sm font-semibold text-text">Répartition</h3></div><div v-if="categoryData.length > 0" class="space-y-3"><div v-for="cat in categoryData" :key="cat.slug" class="flex items-center gap-3"><div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: cat.color }" /><span class="text-sm text-text-600 flex-1 truncate">{{ cat.name }}</span><span class="text-sm text-text font-medium tabular-nums">{{ formatCurrency(cat.total) }}</span><span class="text-xs text-text-700 w-10 text-right tabular-nums">{{ cat.percent.toFixed(0) }}%</span></div></div><div v-else class="text-text-700 text-sm py-10 text-center"><Icon icon="lucide:chart-no-axes-column" class="w-12 h-12 mx-auto mb-3 opacity-20" /><p>Aucune donnée</p></div></div>
        <div class="glass p-5 lg:col-span-2"><div class="flex items-center justify-between mb-4"><div class="flex items-center gap-2"><Icon icon="lucide:clock" class="w-4 h-4 text-gold" /><h3 class="text-sm font-semibold text-text">Derniers investissements</h3></div><div class="flex items-center gap-3"><ExportPDF :investments="investments" /><NuxtLink to="/investments" class="flex items-center gap-1 text-gold hover:text-gold-400 text-sm transition-colors">Voir tout <Icon icon="lucide:arrow-right" class="w-3.5 h-3.5" /></NuxtLink></div></div><div v-if="investments.length > 0" class="space-y-1.5"><div v-for="inv in recentInvestments" :key="inv.id" class="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-500 transition-colors cursor-pointer group" @click="navigateTo(`/investments/${inv.id}`)"><div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" :style="{ backgroundColor: (inv.category_color || '#C9A84C') + '15' }"><Icon :icon="inv.category_icon || 'lucide:folder'" class="w-5 h-5" :style="{ color: inv.category_color || '#C9A84C' }" /></div><div class="flex-1 min-w-0"><div class="text-sm text-text font-medium truncate">{{ inv.name }}</div><div class="flex items-center gap-1.5 text-xs text-text-700"><Icon icon="lucide:tag" class="w-3 h-3" />{{ inv.category_name }}</div></div><div class="text-right"><div class="text-sm text-text font-medium tabular-nums">{{ formatCurrency(inv.current_value) }}</div><div class="text-xs flex items-center gap-0.5 justify-end" :class="Number(inv.current_value) >= Number(inv.purchase_price) ? 'text-success' : 'text-danger'"><Icon :icon="Number(inv.current_value) >= Number(inv.purchase_price) ? 'lucide:arrow-up' : 'lucide:arrow-down'" class="w-3 h-3" />{{ Number(inv.current_value) >= Number(inv.purchase_price) ? '+' : '' }}{{ formatCurrency(Number(inv.current_value) - Number(inv.purchase_price)) }}</div></div></div></div><div v-else class="text-text-700 text-sm py-14 text-center"><div class="w-16 h-16 rounded-2xl bg-surface-500 flex items-center justify-center mx-auto mb-4"><Icon icon="lucide:briefcase" class="w-8 h-8 opacity-30" /></div><p class="font-medium text-text-600">Pas encore d'investissement</p><NuxtLink to="/investments" class="flex items-center gap-1.5 text-gold hover:text-gold-400 text-sm mt-3 inline-flex"><Icon icon="lucide:plus" class="w-4 h-4" />Ajouter un investissement</NuxtLink></div></div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({ middleware: 'auth', layout: false })

useSeoMeta({ title: 'Tableau de bord', description: 'Vue d\'ensemble de votre patrimoine.', robots: 'noindex, nofollow' })

const pageRef = ref<HTMLElement | null>(null)
const investments = ref<any[]>([])
const categories = ref<any[]>([])
const vaultItems = ref<any[]>([])
const profileCompleted = ref(true)
const benchmark = ref<any>({ portfolio: { performance: 0 }, cac40: { performance: 0 }, vsMarket: 0 })

const totalValue = computed(() => investments.value.reduce((sum, inv) => sum + Number(inv.current_value), 0))
const totalCost = computed(() => investments.value.reduce((sum, inv) => sum + Number(inv.purchase_price), 0))
const gain = computed(() => totalValue.value - totalCost.value)
const gainPercent = computed(() => totalCost.value > 0 ? (gain.value / totalCost.value) * 100 : 0)
const usedCategories = computed(() => { const slugs = new Set(investments.value.map(inv => inv.category_slug).filter(Boolean)); return Array.from(slugs) })
const categoryData = computed(() => { const map: Record<string, any> = {}; investments.value.forEach(inv => { const key = inv.category_name || 'Sans catégorie'; if (!map[key]) map[key] = { name: key, color: inv.category_color || '#71717A', slug: inv.category_slug || key, total: 0 }; map[key].total += Number(inv.current_value) }); return Object.values(map).map(c => ({ ...c, percent: totalValue.value > 0 ? (c.total / totalValue.value) * 100 : 0 })).sort((a: any, b: any) => b.total - a.total) })
const recentInvestments = computed(() => investments.value.slice(0, 5))

const expiringInsurance = computed(() => {
  const now = new Date()
  const in30days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  return vaultItems.value.filter(item => {
    if (!item.insurance_expiry) return false
    const expiry = new Date(item.insurance_expiry)
    return expiry <= in30days && expiry >= now
  }).sort((a, b) => new Date(a.insurance_expiry).getTime() - new Date(b.insurance_expiry).getTime())
})

function insuranceDaysLeft(item: any) {
  const expiry = new Date(item.insurance_expiry)
  const now = new Date()
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

async function refreshDashboard() {
  try { const [invRes, catRes] = await Promise.all([$fetch('/api/investments', { credentials: 'include' }), $fetch('/api/categories', { credentials: 'include' })]); investments.value = invRes as any[]; categories.value = catRes as any[] } catch {}
}

onMounted(async () => {
  try { await $fetch('/api/auth/setup', { method: 'POST' }) } catch {}
  try { await $fetch('/api/profile/setup', { method: 'POST' }) } catch {}
  try { await $fetch('/api/vault/setup', { method: 'POST' }) } catch {}
  try { const profileRes = await $fetch('/api/profile', { credentials: 'include' }) as any; profileCompleted.value = profileRes.completed } catch {}
  try { const [invRes, catRes] = await Promise.all([$fetch('/api/investments', { credentials: 'include' }), $fetch('/api/categories', { credentials: 'include' })]); investments.value = invRes as any[]; categories.value = catRes as any[] } catch {}
  try { vaultItems.value = await $fetch('/api/vault/items', { credentials: 'include' }) as any[] } catch {}
  try { benchmark.value = await $fetch('/api/market/benchmark', { credentials: 'include' }) } catch {}
})

function formatCurrency(val: number): string { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val) }
</script>
