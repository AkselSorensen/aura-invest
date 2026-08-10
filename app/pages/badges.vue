<template>
  <NuxtLayout name="dashboard">
    <div ref="pageRef">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-text flex items-center gap-2.5"><Icon icon="lucide:trophy" class="w-6 h-6 text-gold" /> Badges & Niveau</h1>
        <p class="text-text-600 mt-1">Votre progression d'investisseur</p>
      </div>

      <!-- DNA Level -->
      <div class="glass-lg p-6 mb-6 text-center">
        <div class="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl" :style="{ background: `conic-gradient(#C9A84C ${levelProgress}%, #252533 0)` }"><div class="w-[68px] h-[68px] rounded-full bg-dark flex items-center justify-center"><Icon :icon="currentLevel.icon" class="w-8 h-8 text-gold" /></div></div>
        <h2 class="text-xl font-bold text-text">{{ currentLevel.name }}</h2>
        <p class="text-text-600 text-sm mt-1">{{ currentLevel.desc }}</p>
        <div class="w-48 h-2 bg-surface-500 rounded-full mx-auto mt-3 overflow-hidden"><div class="h-full bg-gold rounded-full transition-all" :style="{ width: levelProgress + '%' }" /></div>
        <p class="text-text-700 text-xs mt-1.5">{{ formatCurrency(stats.totalValue) }} / {{ formatCurrency(nextLevel.threshold) }} pour {{ nextLevel.name }}</p>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div class="glass p-3 text-center"><div class="text-2xl font-bold text-text">{{ stats.count }}</div><div class="text-text-600 text-[10px] uppercase mt-0.5">Investissements</div></div>
        <div class="glass p-3 text-center"><div class="text-2xl font-bold text-text">{{ stats.categories }}</div><div class="text-text-600 text-[10px] uppercase mt-0.5">Catégories</div></div>
        <div class="glass p-3 text-center"><div class="text-2xl font-bold text-text">{{ stats.vaultCount }}</div><div class="text-text-600 text-[10px] uppercase mt-0.5">Objets coffre</div></div>
        <div class="glass p-3 text-center"><div class="text-2xl font-bold text-text">{{ unlockedCount }}/{{ badges.length }}</div><div class="text-text-600 text-[10px] uppercase mt-0.5">Badges</div></div>
      </div>

      <!-- Unlocked Badges -->
      <h3 class="text-lg font-bold text-text flex items-center gap-2 mb-4"><Icon icon="lucide:award" class="w-5 h-5 text-gold" /> Badges débloqués</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div v-for="badge in unlockedBadges" :key="badge.id" class="glass p-4 text-center border border-gold/20 bg-gold/5">
          <Icon :icon="badge.icon" class="w-8 h-8 mx-auto mb-2 text-gold" />
          <div class="text-sm font-semibold text-text">{{ badge.name }}</div>
          <div class="text-[10px] text-gold/60 mt-0.5">Débloqué ✨</div>
        </div>
        <div v-if="unlockedBadges.length === 0" class="col-span-4 glass p-8 text-center"><Icon icon="lucide:sparkles" class="w-10 h-10 mx-auto mb-2 text-text-700 opacity-30" /><p class="text-text-600 text-sm">Aucun badge pour le moment</p><p class="text-text-700 text-xs mt-1">Continuez à investir pour débloquer des badges</p></div>
      </div>

      <!-- Locked Badges -->
      <h3 class="text-sm font-semibold text-text-600 uppercase tracking-wider mb-3">En progression</h3>
      <div class="space-y-2">
        <div v-for="badge in lockedBadges" :key="badge.id" class="flex items-center gap-3 p-3 rounded-lg bg-surface-500/30">
          <Icon :icon="badge.icon" class="w-6 h-6 text-text-700" />
          <div class="flex-1">
            <div class="flex justify-between"><span class="text-sm text-text-600">{{ badge.name }}</span><span class="text-xs text-text-700">{{ badge.progressText }}</span></div>
            <div class="w-full h-1.5 bg-surface-500 rounded-full mt-1 overflow-hidden"><div class="h-full bg-gold/30 rounded-full" :style="{ width: badge.progress + '%' }" /></div>
          </div>
          <span class="text-xs text-text-700 w-10 text-right">{{ badge.progress }}%</span>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({ middleware: 'auth', layout: false })

const pageRef = ref<HTMLElement | null>(null)
const stats = ref({ totalValue: 0, totalCost: 0, count: 0, categories: 0, peCount: 0, vaultCount: 0, dividendTotal: 0, oldestDate: '' })

const levels = [
  { name: 'Débutant', icon: 'lucide:seedling', threshold: 0, desc: 'Chaque grand voyage commence par un premier pas' },
  { name: 'Averti', icon: 'lucide:sprout', threshold: 10000, desc: 'Vous construisez votre patrimoine' },
  { name: 'Stratège', icon: 'lucide:tree-pine', threshold: 50000, desc: 'Votre stratégie prend forme' },
  { name: 'Shark', icon: 'lucide:fish', threshold: 250000, desc: 'Vous nagez avec les grands' },
  { name: 'Whale', icon: 'lucide:waves', threshold: 1000000, desc: 'Une force de la nature' },
  { name: 'Légende', icon: 'lucide:crown', threshold: 5000000, desc: 'Votre nom résonne dans la légende' },
]

const currentLevel = computed(() => { let lvl = levels[0]; for (const l of levels) { if (stats.value.totalValue >= l.threshold) lvl = l }; return lvl })
const nextLevel = computed(() => { const idx = levels.indexOf(currentLevel.value); return levels[idx + 1] || levels[levels.length - 1] })
const levelProgress = computed(() => { if (currentLevel.value.threshold === nextLevel.value.threshold) return 100; return ((stats.value.totalValue - currentLevel.value.threshold) / (nextLevel.value.threshold - currentLevel.value.threshold)) * 100 })

const badgeDefs = [
  { id: 'first', icon: 'lucide:star', name: 'Premier pas', desc: '1er investissement', check: (s: any) => s.count >= 1, progress: (s: any) => Math.min((s.count / 1) * 100, 99) },
  { id: 'ten', icon: 'lucide:stars', name: 'Diversifié', desc: '10 investissements', check: (s: any) => s.count >= 10, progress: (s: any) => Math.min((s.count / 10) * 100, 99) },
  { id: 'fifty', icon: 'lucide:gallery-horizontal-end', name: 'Portfolio Pro', desc: '50 investissements', check: (s: any) => s.count >= 50, progress: (s: any) => Math.min((s.count / 50) * 100, 99) },
  { id: 'cats3', icon: 'lucide:layers', name: 'Explorateur', desc: '3 catégories', check: (s: any) => s.categories >= 3, progress: (s: any) => Math.min((s.categories / 3) * 100, 99) },
  { id: 'cats7', icon: 'lucide:grid-3x3', name: 'Omni-investisseur', desc: '7 catégories', check: (s: any) => s.categories >= 7, progress: (s: any) => Math.min((s.categories / 7) * 100, 99) },
  { id: '100k', icon: 'lucide:banknote', name: '100K', desc: '100 000€ de patrimoine', check: (s: any) => s.totalValue >= 100000, progress: (s: any) => Math.min((s.totalValue / 100000) * 100, 99) },
  { id: '1m', icon: 'lucide:landmark', name: 'Millionnaire', desc: '1 000 000€', check: (s: any) => s.totalValue >= 1000000, progress: (s: any) => Math.min((s.totalValue / 1000000) * 100, 99) },
  { id: 'diamond', icon: 'lucide:gem', name: 'Diamond Hands', desc: 'Plus-value > +50% sur un actif', check: (s: any) => s.gainPct >= 50, progress: (s: any) => Math.min((s.gainPct / 50) * 100, 99) },
  { id: 'pe', icon: 'lucide:briefcase', name: 'Business Angel', desc: '1 deal Private Equity', check: (s: any) => s.peCount >= 1, progress: (s: any) => Math.min((s.peCount / 1) * 100, 99) },
  { id: 'pe5', icon: 'lucide:rocket', name: 'VC Partner', desc: '5 deals PE', check: (s: any) => s.peCount >= 5, progress: (s: any) => Math.min((s.peCount / 5) * 100, 99) },
  { id: 'vault5', icon: 'lucide:vault', name: 'Collectionneur', desc: '5 objets coffre-fort', check: (s: any) => s.vaultCount >= 5, progress: (s: any) => Math.min((s.vaultCount / 5) * 100, 99) },
  { id: 'div', icon: 'lucide:hand-coins', name: 'Rentier', desc: '500€ de dividendes/an', check: (s: any) => s.dividendTotal >= 500, progress: (s: any) => Math.min((s.dividendTotal / 500) * 100, 99) },
]

const badges = computed(() => badgeDefs.map(b => ({ ...b, unlocked: b.check(stats.value) })))
const unlockedBadges = computed(() => badges.value.filter(b => b.unlocked))
const unlockedCount = computed(() => unlockedBadges.value.length)
const lockedBadges = computed(() => badges.value.filter(b => !b.unlocked).map(b => ({ ...b, progress: b.progress(stats.value), progressText: b.desc })))

function formatCurrency(v: number): string { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v || 0) }

onMounted(async () => {
  try {
    const inv = await $fetch('/api/investments', { credentials: 'include' }) as any[]
    const vault = await $fetch('/api/vault/items', { credentials: 'include' }).catch(() => []) as any[]
    const cats = [...new Set(inv.map((i: any) => i.category_slug).filter(Boolean))]
    const totalCost = inv.reduce((s: number, i: any) => s + Number(i.purchase_price || 0), 0)
    const totalValue = inv.reduce((s: number, i: any) => s + Number(i.current_value || 0), 0) + (Array.isArray(vault) ? vault.reduce((s: number, i: any) => s + Number(i.current_value || 0), 0) : 0)
    const gainPct = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0
    const divTotal = inv.reduce((s: number, i: any) => s + Number(i.dividend_amount || (Number(i.current_value) * (i.dividend_yield || 0) / 100)), 0)
    stats.value = { totalValue, totalCost, count: inv.length, categories: cats.length, peCount: inv.filter((i: any) => i.category_slug === 'private-equity').length, vaultCount: Array.isArray(vault) ? vault.length : 0, dividendTotal: divTotal, gainPct, oldestDate: '' }
    stats.value = { ...stats.value, totalValue } // ensure totalValue includes vault
  } catch {}
})
</script>
