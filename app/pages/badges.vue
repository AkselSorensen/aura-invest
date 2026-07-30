<template>
  <NuxtLayout name="dashboard">
    <div ref="pageRef">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-text flex items-center gap-2.5"><Icon icon="lucide:trophy" class="w-6 h-6 text-gold" /> Badges & Niveau</h1>
        <p class="text-text-600 mt-1">Votre progression d'investisseur</p>
      </div>

      <!-- DNA Level -->
      <div class="glass-lg p-6 mb-6 text-center">
        <div class="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
          :style="{ background: `conic-gradient(#C9A84C ${levelProgress}%, #252533 0)` }">
          <div class="w-[68px] h-[68px] rounded-full bg-dark flex items-center justify-center">
            <Icon :icon="currentLevel.icon" class="w-8 h-8 text-gold" />
          </div>
        </div>
        <h2 class="text-xl font-bold text-text">{{ currentLevel.name }}</h2>
        <p class="text-text-600 text-sm mt-1">{{ currentLevel.desc }}</p>
        <div class="w-48 h-2 bg-surface-500 rounded-full mx-auto mt-3 overflow-hidden">
          <div class="h-full bg-gold rounded-full transition-all" :style="{ width: levelProgress + '%' }" />
        </div>
        <p class="text-text-700 text-xs mt-1.5">{{ stats.totalValue | formatCurrency }} / {{ nextLevel.threshold | formatCurrency }} pour {{ nextLevel.name }}</p>
      </div>

      <!-- Badges -->
      <h3 class="text-lg font-bold text-text flex items-center gap-2 mb-4">
        <Icon icon="lucide:award" class="w-5 h-5 text-gold" /> Badges débloqués
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div v-for="badge in badges" :key="badge.id" class="glass p-4 text-center"
          :class="badge.unlocked ? '' : 'opacity-30 grayscale'">
          <Icon :icon="badge.icon" class="w-8 h-8 mx-auto mb-2" :class="badge.unlocked ? 'text-gold' : 'text-text-700'" />
          <div class="text-sm font-semibold text-text">{{ badge.name }}</div>
          <div class="text-[10px] text-text-700 mt-0.5">{{ badge.unlocked ? 'Débloqué' : badge.requirement }}</div>
        </div>
      </div>

      <!-- Next badges -->
      <h3 class="text-sm font-semibold text-text-600 uppercase tracking-wider mb-3">Prochains badges</h3>
      <div class="space-y-2">
        <div v-for="badge in lockedBadges" :key="badge.id" class="flex items-center gap-3 p-3 rounded-lg bg-surface-500/30">
          <Icon :icon="badge.icon" class="w-6 h-6 text-text-700" />
          <div class="flex-1">
            <div class="text-sm text-text-600">{{ badge.name }}</div>
            <div class="w-full h-1.5 bg-surface-500 rounded-full mt-1 overflow-hidden">
              <div class="h-full bg-gold/30 rounded-full" :style="{ width: badge.progress + '%' }" />
            </div>
          </div>
          <span class="text-xs text-text-700">{{ badge.progress }}%</span>
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
const stats = ref({ totalValue: 0, count: 0, categories: 0, peCount: 0, vaultCount: 0 })

const levels = [
  { name: 'Débutant', icon: 'lucide:seedling', threshold: 0, desc: 'Chaque grand voyage commence par un premier pas' },
  { name: 'Averti', icon: 'lucide:sprout', threshold: 10000, desc: 'Vous construisez votre patrimoine' },
  { name: 'Stratège', icon: 'lucide:tree-pine', threshold: 50000, desc: 'Votre stratégie prend forme' },
  { name: 'Shark', icon: 'lucide:fish', threshold: 250000, desc: 'Vous nagez avec les grands' },
  { name: 'Whale', icon: 'lucide:waves', threshold: 1000000, desc: 'Une force de la nature' },
  { name: 'Légende', icon: 'lucide:crown', threshold: 5000000, desc: 'Votre nom résonne dans la légende' },
]

const currentLevel = computed(() => {
  let lvl = levels[0]
  for (const l of levels) { if (stats.value.totalValue >= l.threshold) lvl = l }
  return lvl
})
const nextLevel = computed(() => {
  const idx = levels.indexOf(currentLevel.value)
  return levels[idx + 1] || levels[levels.length - 1]
})
const levelProgress = computed(() => {
  if (currentLevel.value.threshold === nextLevel.value.threshold) return 100
  return ((stats.value.totalValue - currentLevel.value.threshold) / (nextLevel.value.threshold - currentLevel.value.threshold)) * 100
})

const badgeDefs = [
  { id: 'first_inv', icon: 'lucide:star', name: 'Premier pas', requirement: '1er investissement', check: (s: any) => s.count >= 1 },
  { id: 'ten_inv', icon: 'lucide:stars', name: 'Diversifié', requirement: '10 investissements', check: (s: any) => s.count >= 10 },
  { id: 'five_cats', icon: 'lucide:layers', name: 'Explorateur', requirement: '5 catégories', check: (s: any) => s.categories >= 5 },
  { id: '100k', icon: 'lucide:banknote', name: '100K', requirement: '100 000€ de patrimoine', check: (s: any) => s.totalValue >= 100000 },
  { id: '1m', icon: 'lucide:landmark', name: 'Millionnaire', requirement: '1 000 000€', check: (s: any) => s.totalValue >= 1000000 },
  { id: 'pe_deal', icon: 'lucide:briefcase', name: 'Business Angel', requirement: '1 deal PE', check: (s: any) => s.peCount >= 1 },
  { id: 'vault5', icon: 'lucide:vault', name: 'Collectionneur', requirement: '5 objets coffre-fort', check: (s: any) => s.vaultCount >= 5 },
  { id: 'pe_king', icon: 'lucide:crown', name: 'PE King', requirement: '10 deals PE', check: (s: any) => s.peCount >= 10 },
]

const badges = computed(() => badgeDefs.map(b => ({ ...b, unlocked: b.check(stats.value) })))
const lockedBadges = computed(() => badges.value.filter(b => !b.unlocked).map(b => ({
  ...b,
  progress: b.id === '100k' ? Math.min((stats.value.totalValue / 100000) * 100, 99) :
           b.id === '1m' ? Math.min((stats.value.totalValue / 1000000) * 100, 99) :
           b.id === 'ten_inv' ? Math.min((stats.value.count / 10) * 100, 99) :
           b.id === 'five_cats' ? Math.min((stats.value.categories / 5) * 100, 99) :
           b.id === 'pe_deal' ? Math.min((stats.value.peCount / 1) * 100, 99) :
           b.id === 'vault5' ? Math.min((stats.value.vaultCount / 5) * 100, 99) :
           b.id === 'pe_king' ? Math.min((stats.value.peCount / 10) * 100, 99) : 0
})))

onMounted(async () => {
  try {
    const inv = await $fetch('/api/investments', { credentials: 'include' }) as any[]
    const vault = await $fetch('/api/vault/items', { credentials: 'include' }).catch(() => []) as any[]
    const cats = [...new Set(inv.map((i: any) => i.category_slug).filter(Boolean))]
    stats.value = {
      totalValue: inv.reduce((s: number, i: any) => s + Number(i.current_value || 0), 0) + (Array.isArray(vault) ? vault.reduce((s: number, i: any) => s + Number(i.current_value || 0), 0) : 0),
      count: inv.length,
      categories: cats.length,
      peCount: inv.filter((i: any) => i.category_slug === 'private-equity').length,
      vaultCount: Array.isArray(vault) ? vault.length : 0,
    }
  } catch {}
  nextTick(() => { gsap.fromTo(pageRef.value?.children || [], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out' }) })
})
</script>
