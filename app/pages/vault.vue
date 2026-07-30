<template>
  <NuxtLayout name="dashboard">
    <div ref="pageRef">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-text flex items-center gap-2.5">
            <Icon icon="lucide:vault" class="w-6 h-6 text-gold" />
            Coffre-fort
          </h1>
          <p class="text-text-600 mt-1 flex items-center gap-1.5">
            <Icon icon="lucide:archive" class="w-3.5 h-3.5" />
            {{ items.length }} objet{{ items.length > 1 ? 's' : '' }} · {{ formatCurrency(totalValue) }}
          </p>
        </div>
        <button @click="showForm = true" class="flex items-center gap-2 px-4 py-2.5 bg-gold text-dark font-semibold rounded-lg hover:bg-gold-400 transition-colors text-sm shadow-lg shadow-gold/10">
          <Icon icon="lucide:plus-circle" class="w-4.5 h-4.5" />
          Ajouter un objet
        </button>
      </div>

      <!-- Category filters -->
      <div class="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button @click="activeCategory = ''"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap"
          :class="activeCategory === '' ? 'bg-gold text-dark' : 'bg-surface-500 text-text-600 hover:text-text'">
          <Icon icon="lucide:grid-3x3" class="w-3.5 h-3.5" /> Tout
        </button>
        <button v-for="cat in categories" :key="cat.slug" @click="activeCategory = activeCategory === cat.slug ? '' : cat.slug"
          class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border"
          :class="activeCategory === cat.slug ? 'text-text border-current' : 'text-text-600 border-surface-500 hover:text-text hover:border-text-700'"
          :style="{ borderColor: activeCategory === cat.slug ? cat.color : undefined }">
          <Icon :icon="cat.icon" class="w-3.5 h-3.5" :style="{ color: activeCategory === cat.slug ? cat.color : undefined }" />
          {{ cat.name }}
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="filteredItems.length === 0 && !activeCategory" class="glass p-16 text-center">
        <div class="w-24 h-24 rounded-3xl bg-surface-500 flex items-center justify-center mx-auto mb-6">
          <Icon icon="lucide:vault" class="w-12 h-12 text-text-700 opacity-25" />
        </div>
        <p class="text-text-600 text-lg font-medium mb-1">Coffre-fort vide</p>
        <p class="text-text-700 text-sm mb-6">Ajoutez vos objets de valeur : montres, art, vins, bijoux...</p>
        <button @click="showForm = true" class="inline-flex items-center gap-2 px-5 py-3 bg-gold text-dark font-semibold rounded-xl hover:bg-gold-400 transition-colors text-sm">
          <Icon icon="lucide:plus-circle" class="w-4.5 h-4.5" /> Ajouter un objet
        </button>
      </div>

      <div v-else-if="filteredItems.length === 0 && activeCategory" class="glass p-12 text-center">
        <Icon icon="lucide:search-x" class="w-12 h-12 mx-auto mb-3 text-text-700 opacity-30" />
        <p class="text-text-600 text-sm">Aucun objet dans cette catégorie</p>
        <button @click="activeCategory = ''" class="text-gold hover:text-gold-400 text-sm mt-2 inline-flex items-center gap-1">
          <Icon icon="lucide:arrow-left" class="w-3.5 h-3.5" /> Voir tout
        </button>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="(item, i) in filteredItems" :key="item.id"
          class="glass overflow-hidden cursor-pointer hover:border-gold/20 transition-all group hover:-translate-y-0.5"
          @click="navigateTo(`/vault/${item.id}`)">
          <!-- Image -->
          <div class="w-full aspect-[4/3] bg-surface-500 overflow-hidden relative">
            <img v-if="item.images && item.images.length > 0" :src="item.images[0].url" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <Icon v-else :icon="getCatIcon(item.category)" class="w-12 h-12 absolute inset-0 m-auto opacity-15" :style="{ color: getCatColor(item.category) }" />
            <!-- Image count badge -->
            <div v-if="item.images && item.images.length > 1" class="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md bg-dark/70 backdrop-blur-sm text-[10px] text-text-600">
              <Icon icon="lucide:images" class="w-3 h-3" /> {{ item.images.length }}
            </div>
            <!-- Condition dot -->
            <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-md bg-dark/70 backdrop-blur-sm text-[10px] text-text-600">
              <span class="w-2 h-2 rounded-full" :class="getConditionColor(item.condition)" />
              {{ getConditionLabel(item.condition) }}
            </div>
          </div>
          <!-- Info -->
          <div class="p-4">
            <div class="flex items-start justify-between gap-2 mb-1">
              <h3 class="font-semibold text-text truncate text-[15px]">{{ item.name }}</h3>
            </div>
            <div class="flex items-center gap-2 mb-2">
              <Icon :icon="getCatIcon(item.category)" class="w-3.5 h-3.5" :style="{ color: getCatColor(item.category) }" />
              <span class="text-xs text-text-600">{{ getCatName(item.category) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-lg font-bold text-text tabular-nums">{{ formatCurrency(item.current_value) }}</span>
              <span v-if="item.location" class="text-[11px] text-text-700 flex items-center gap-1">
                <Icon icon="lucide:map-pin" class="w-3 h-3" /> {{ item.location }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Form modal -->
      <VaultForm v-if="showForm" @close="showForm = false; refresh()" />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'

definePageMeta({ middleware: 'auth', layout: false })

const pageRef = ref<HTMLElement | null>(null)
const items = ref<any[]>([])
const activeCategory = ref('')
const showForm = ref(false)

const categories = [
  { name: 'Montres', slug: 'watches', icon: 'lucide:watch', color: '#C9A84C' },
  { name: 'Art', slug: 'art', icon: 'lucide:palette', color: '#A855F7' },
  { name: 'Vins', slug: 'wine', icon: 'lucide:wine', color: '#DC2626' },
  { name: 'Voitures', slug: 'cars', icon: 'lucide:car', color: '#3B82F6' },
  { name: 'Bijoux', slug: 'jewelry', icon: 'lucide:gem', color: '#EC4899' },
  { name: 'Mobilier', slug: 'furniture', icon: 'lucide:armchair', color: '#F97316' },
  { name: 'Livres', slug: 'books', icon: 'lucide:book-open', color: '#8B5CF6' },
  { name: 'Sneakers', slug: 'sneakers', icon: 'lucide:footprints', color: '#14B8A6' },
  { name: 'Cartes', slug: 'cards', icon: 'lucide:credit-card', color: '#F59E0B' },
  { name: 'Autre', slug: 'other', icon: 'lucide:archive', color: '#71717A' },
]

const filteredItems = computed(() => {
  if (!activeCategory.value) return items.value
  return items.value.filter(i => i.category === activeCategory.value)
})
const totalValue = computed(() => items.value.reduce((sum, i) => sum + Number(i.current_value), 0))

function getCatIcon(slug: string) { return categories.find(c => c.slug === slug)?.icon || 'lucide:archive' }
function getCatColor(slug: string) { return categories.find(c => c.slug === slug)?.color || '#71717A' }
function getCatName(slug: string) { return categories.find(c => c.slug === slug)?.name || slug }

function getConditionColor(cond: string) {
  const map: Record<string, string> = { excellent: 'bg-green-400', good: 'bg-blue-400', fair: 'bg-yellow-400', poor: 'bg-red-400' }
  return map[cond] || 'bg-surface-500'
}
function getConditionLabel(cond: string) {
  const map: Record<string, string> = { excellent: 'Excellent', good: 'Bon', fair: 'Moyen', poor: 'À restaurer' }
  return map[cond] || cond
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)
}

async function refresh() {
  try {
    items.value = await $fetch('/api/vault/items', { credentials: 'include' }) as any[]
  } catch {}
}

onMounted(async () => {
  try { await $fetch('/api/vault/setup', { method: 'POST' }) } catch {}
  await refresh()
  nextTick(() => {
    gsap.fromTo(pageRef.value?.children || [], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power3.out' })
  })
})
</script>
