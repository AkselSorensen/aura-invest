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
          class="glass overflow-hidden transition-all group hover:-translate-y-0.5 relative">
          <!-- Image -->
          <div class="w-full aspect-[4/3] bg-surface-500 overflow-hidden relative cursor-pointer" @click="navigateTo(`/vault/${item.id}`)">
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
            <!-- Sold badge -->
            <div v-if="item.sold" class="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/30 backdrop-blur-sm text-[10px] text-green-300 font-medium">
              <Icon icon="lucide:badge-check" class="w-3 h-3" /> Vendu
            </div>
            <!-- Quick actions overlay (appears on hover) -->
            <div class="absolute inset-0 bg-dark/0 group-hover:bg-dark/60 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100" @click.stop>
              <button v-if="!item.sold" @click="quickSell(item)" title="Vendre" class="w-9 h-9 rounded-full bg-green-500/80 flex items-center justify-center hover:bg-green-500 transition-colors">
                <Icon icon="lucide:hand-coins" class="w-4 h-4 text-white" />
              </button>
              <button v-if="!item.sold" @click="editItem(item)" title="Modifier" class="w-9 h-9 rounded-full bg-blue-500/80 flex items-center justify-center hover:bg-blue-500 transition-colors">
                <Icon icon="lucide:pencil" class="w-4 h-4 text-white" />
              </button>
              <button @click="deleteItem(item)" title="Supprimer" class="w-9 h-9 rounded-full bg-red-500/80 flex items-center justify-center hover:bg-red-500 transition-colors">
                <Icon icon="lucide:trash-2" class="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
          <!-- Info -->
          <div class="p-4 cursor-pointer" @click="navigateTo(`/vault/${item.id}`)">
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
      <VaultForm v-if="showForm" :edit-data="editData" @close="showForm = false; editData = null; refresh()" />

      <!-- Quick sell modal -->
      <Teleport to="body">
        <div v-if="sellTarget" class="fixed inset-0 z-[110] flex items-center justify-center p-4" @click.self="sellTarget = null">
          <div class="absolute inset-0 bg-dark/80 backdrop-blur-sm" />
          <div class="glass-lg w-full max-w-sm relative z-10 p-6">
            <h3 class="text-lg font-semibold text-text mb-1">Vendre {{ sellTarget.name }}</h3>
            <p class="text-text-600 text-sm mb-4">Prix d'achat : {{ formatCurrency(sellTarget.acquisition_price) }}</p>
            <div class="mb-4">
              <label class="block text-sm text-text-600 mb-1.5">Prix de vente (€)</label>
              <input v-model.number="quickSellPrice" type="number" min="0" step="any" placeholder="10 000"
                class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text text-lg focus:outline-none focus:border-green-400/40" />
            </div>
            <div v-if="quickSellPrice > 0 && sellTarget.acquisition_price" class="mb-4 p-3 rounded-lg bg-surface-500 text-sm">
              <span class="text-text-600">Plus-value : </span>
              <span class="font-bold" :class="quickSellPrice - Number(sellTarget.acquisition_price) >= 0 ? 'text-green-400' : 'text-red-400'">
                {{ formatCurrency(quickSellPrice - Number(sellTarget.acquisition_price)) }}
              </span>
            </div>
            <div class="flex gap-3">
              <button @click="sellTarget = null" class="flex-1 py-2.5 border border-surface-500 text-text-600 rounded-lg hover:text-text text-sm">Annuler</button>
              <button @click="confirmQuickSell" :disabled="!quickSellPrice" class="flex-1 py-2.5 bg-green-500/20 border border-green-500/30 text-green-400 font-semibold rounded-lg hover:bg-green-500/30 text-sm disabled:opacity-50">
                Confirmer la vente
              </button>
            </div>
          </div>
        </div>
      </Teleport>
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
const editData = ref<any>(null)
const sellTarget = ref<any>(null)
const quickSellPrice = ref(0)

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

function editItem(item: any) {
  editData.value = item
  showForm.value = true
}

function quickSell(item: any) {
  sellTarget.value = item
  quickSellPrice.value = item.current_value || item.acquisition_price || 0
}

async function confirmQuickSell() {
  if (!sellTarget.value || !quickSellPrice.value) return
  try {
    await $fetch(`/api/vault/items/${sellTarget.value.id}`, {
      method: 'PUT', body: { sold: true, sold_price: quickSellPrice.value, sold_date: new Date().toISOString().split('T')[0] },
      credentials: 'include'
    })
    sellTarget.value = null
    await refresh()
  } catch (e: any) { alert(e.statusMessage || 'Erreur') }
}

async function deleteItem(item: any) {
  if (confirm(`Supprimer "${item.name}" du coffre-fort ?`)) {
    await $fetch(`/api/vault/items/${item.id}`, { method: 'DELETE', credentials: 'include' })
    await refresh()
  }
}

onMounted(async () => {
  try { await $fetch('/api/vault/setup', { method: 'POST' }) } catch {}
  await refresh()
  nextTick(() => {
    gsap.fromTo(pageRef.value?.children || [], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power3.out' })
  })
})
</script>
