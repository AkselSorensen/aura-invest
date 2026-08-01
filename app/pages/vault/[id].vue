<template>
  <NuxtLayout name="dashboard">
    <div v-if="item" ref="pageRef">
      <NuxtLink to="/vault" class="inline-flex items-center gap-1.5 text-text-600 hover:text-text transition-colors text-sm mb-6">
        <Icon icon="lucide:arrow-left" class="w-4 h-4" /> Retour au coffre-fort
      </NuxtLink>

      <!-- Sold banner -->
      <div v-if="item.sold" class="glass-lg p-4 mb-6 border border-green-500/30 bg-green-500/5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Icon icon="lucide:badge-check" class="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div class="text-sm font-semibold text-green-400">Vendu le {{ formatDate(item.sold_date) }}</div>
              <div class="text-xs text-text-700">
                Prix de vente : {{ formatCurrency(item.sold_price) }}
                <span v-if="item.acquisition_price && item.sold_price" class="ml-1" :class="profitPercent >= 0 ? 'text-green-400' : 'text-red-400'">
                  (+{{ profitPercent.toFixed(1) }}%)
                </span>
              </div>
            </div>
          </div>
          <button @click="unsell" class="text-xs text-text-600 hover:text-text underline">Annuler la vente</button>
        </div>
      </div>

      <!-- Image carousel -->
      <div class="glass-lg overflow-hidden mb-6">
        <div v-if="item.images && item.images.length > 0" class="relative">
          <div class="aspect-[16/9] bg-surface-500 overflow-hidden">
            <img :src="item.images[currentImage].url" class="w-full h-full object-contain" />
          </div>
          <button v-if="item.images.length > 1" @click="prevImage"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dark/60 backdrop-blur-sm flex items-center justify-center hover:bg-dark/80 transition-colors">
            <Icon icon="lucide:chevron-left" class="w-5 h-5 text-text" />
          </button>
          <button v-if="item.images.length > 1" @click="nextImage"
            class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dark/60 backdrop-blur-sm flex items-center justify-center hover:bg-dark/80 transition-colors">
            <Icon icon="lucide:chevron-right" class="w-5 h-5 text-text" />
          </button>
          <div class="flex gap-2 p-3 justify-center">
            <button v-for="(img, i) in item.images" :key="img.id" @click="currentImage = i"
              class="w-14 h-14 rounded-lg overflow-hidden border-2 transition-colors shrink-0"
              :class="i === currentImage ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'">
              <img :src="img.url" class="w-full h-full object-cover" />
            </button>
          </div>
        </div>
        <div v-else class="aspect-[16/9] bg-surface-500 flex items-center justify-center">
          <Icon :icon="getCatIcon(item.category)" class="w-20 h-20 opacity-15" :style="{ color: getCatColor(item.category) }" />
        </div>
      </div>

      <!-- Main card -->
      <div class="glass-lg p-6 mb-6">
        <div class="flex items-start justify-between gap-3 mb-6">
          <div>
            <h1 class="text-xl font-bold text-text">{{ item.name }}</h1>
            <div class="flex items-center gap-2 mt-1.5">
              <Icon :icon="getCatIcon(item.category)" class="w-4 h-4" :style="{ color: getCatColor(item.category) }" />
              <span class="text-sm text-text-600">{{ getCatName(item.category) }}</span>
              <span class="text-text-700">·</span>
              <span class="flex items-center gap-1 text-sm text-text-700">
                <span class="w-2 h-2 rounded-full" :class="getConditionColor(item.condition)" />
                {{ getConditionLabel(item.condition) }}
              </span>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div class="glass rounded-lg p-3.5">
            <div class="text-text-600 text-xs uppercase tracking-wider mb-1">Prix d'achat</div>
            <div class="text-lg font-bold text-text tabular-nums">{{ formatCurrency(item.acquisition_price) }}</div>
          </div>
          <div class="glass rounded-lg p-3.5">
            <div class="text-text-600 text-xs uppercase tracking-wider mb-1">Valeur actuelle</div>
            <div class="text-lg font-bold text-text tabular-nums">{{ formatCurrency(item.current_value) }}</div>
          </div>
          <div class="glass rounded-lg p-3.5">
            <div class="text-text-600 text-xs uppercase tracking-wider mb-1">Valeur assurée</div>
            <div class="text-lg font-bold text-text tabular-nums">{{ formatCurrency(item.insured_value) }}</div>
          </div>
          <div class="glass rounded-lg p-3.5">
            <div class="text-text-600 text-xs uppercase tracking-wider mb-1">Plus-value latente</div>
            <div class="text-lg font-bold tabular-nums" :class="Number(item.current_value) >= Number(item.acquisition_price) ? 'text-green-400' : 'text-red-400'">
              {{ formatCurrency(Number(item.current_value) - Number(item.acquisition_price)) }}
            </div>
          </div>
          <div v-if="item.acquisition_date" class="glass rounded-lg p-3.5">
            <div class="text-text-600 text-xs uppercase tracking-wider mb-1">Date d'acquisition</div>
            <div class="text-lg font-bold text-text tabular-nums">{{ formatDate(item.acquisition_date) }}</div>
          </div>
          <div v-if="item.location" class="glass rounded-lg p-3.5">
            <div class="text-text-600 text-xs uppercase tracking-wider mb-1">Localisation</div>
            <div class="text-lg font-bold text-text tabular-nums">{{ item.location }}</div>
          </div>
        </div>
        <div v-if="item.serial_number || item.dimensions || item.weight" class="flex items-center gap-4 mt-5 pt-4 border-t border-surface-500">
          <div v-if="item.serial_number" class="flex items-center gap-1.5 text-sm text-text-700"><Icon icon="lucide:barcode" class="w-3.5 h-3.5" />{{ item.serial_number }}</div>
          <div v-if="item.dimensions" class="flex items-center gap-1.5 text-sm text-text-700"><Icon icon="lucide:ruler" class="w-3.5 h-3.5" />{{ item.dimensions }}</div>
          <div v-if="item.weight" class="flex items-center gap-1.5 text-sm text-text-700"><Icon icon="lucide:weight" class="w-3.5 h-3.5" />{{ item.weight }}</div>
        </div>
        <div v-if="item.description" class="mt-4">
          <div class="text-text-600 text-xs uppercase tracking-wider mb-1.5">Description</div>
          <p class="text-text-600 text-sm">{{ item.description }}</p>
        </div>
        <div v-if="item.notes" class="mt-3">
          <div class="text-text-600 text-xs uppercase tracking-wider mb-1.5">Notes</div>
          <p class="text-text-600 text-sm">{{ item.notes }}</p>
        </div>
      </div>

      <!-- Upload images (when not sold) -->
      <div v-if="!item.sold" class="glass p-5 mb-6">
        <h3 class="text-sm font-semibold text-text flex items-center gap-2 mb-3">
          <Icon icon="lucide:camera" class="w-4 h-4 text-gold" /> Ajouter des photos
        </h3>
        <div @click="fileInput?.click()" @dragover.prevent @drop.prevent="onDrop"
          class="border-2 border-dashed border-surface-500 rounded-lg p-6 text-center hover:border-gold/30 transition-colors cursor-pointer">
          <Icon icon="lucide:upload" class="w-6 h-6 text-text-700 mx-auto mb-1.5" />
          <p class="text-text-700 text-xs">Glissez des photos ou cliquez</p>
          <p class="text-text-700 text-[10px] mt-0.5">JPG, PNG, WebP — max 5MB</p>
        </div>
        <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" multiple class="hidden" @change="onFileChange" />
        <div v-if="uploading" class="text-xs text-text-700 mt-1.5 flex items-center gap-1.5">
          <Icon icon="lucide:loader" class="w-3 h-3 animate-spin" /> Upload en cours...
        </div>
        <div v-if="uploadError" class="text-xs text-red-400 mt-1.5">{{ uploadError }}</div>
      </div>

      <!-- QR Code -->
      <div class="glass p-5 text-center mb-6">
        <h3 class="text-sm font-semibold text-text mb-3 flex items-center justify-center gap-2"><Icon icon="lucide:qr-code" class="w-4 h-4 text-gold" />QR Code</h3>
        <canvas ref="qrCanvas" class="w-36 h-36 mx-auto rounded-lg bg-white p-2" />
        <p class="text-text-700 text-[10px] mt-2">Scannez pour voir les infos de l'objet</p>
        <button @click="downloadQr" class="mt-2 text-xs text-gold hover:text-gold-400 flex items-center gap-1 mx-auto">
          <Icon icon="lucide:download" class="w-3 h-3" /> Télécharger
        </button>
      </div>

      <!-- Documents -->
      <div v-if="item.documents && item.documents.length > 0" class="glass p-5 mb-6">
        <h3 class="text-sm font-semibold text-text flex items-center gap-2 mb-3"><Icon icon="lucide:file-text" class="w-4 h-4 text-gold" />Documents</h3>
        <div class="space-y-2">
          <a v-for="doc in item.documents" :key="doc.id" :href="doc.url" target="_blank"
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-500 transition-colors group">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" :class="getDocBg(doc.doc_type)">
              <Icon :icon="getDocIcon(doc.doc_type)" class="w-4 h-4" :class="getDocColor(doc.doc_type)" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm text-text truncate">{{ doc.name }}</div>
              <div class="text-xs text-text-700">{{ getDocTypeLabel(doc.doc_type) }}</div>
            </div>
            <Icon icon="lucide:external-link" class="w-4 h-4 text-text-700 group-hover:text-text transition-colors" />
          </a>
        </div>
      </div>

      <!-- Sell section -->
      <div v-if="!item.sold" class="glass p-5 mb-6">
        <h3 class="text-sm font-semibold text-text flex items-center gap-2 mb-4">
          <Icon icon="lucide:hand-coins" class="w-4 h-4 text-green-400" /> Vendre cet objet
        </h3>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm text-text-600 mb-1.5">Prix de vente (€)</label>
            <input v-model.number="sellPrice" type="number" min="0" step="any" placeholder="10 000"
              class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-green-400/40 transition-colors text-sm" />
          </div>
          <div>
            <label class="block text-sm text-text-600 mb-1.5">Date de vente</label>
            <input v-model="sellDate" type="date"
              class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-green-400/40 transition-colors text-sm" />
          </div>
        </div>
        <div v-if="sellPrice > 0 && item.acquisition_price" class="mt-3 p-3 rounded-lg bg-surface-500 text-sm">
          <span class="text-text-600">Plus-value : </span>
          <span class="font-bold" :class="sellPrice - Number(item.acquisition_price) >= 0 ? 'text-green-400' : 'text-red-400'">
            {{ formatCurrency(sellPrice - Number(item.acquisition_price)) }}
            ({{ (((sellPrice - Number(item.acquisition_price)) / Number(item.acquisition_price)) * 100).toFixed(1) }}%)
          </span>
        </div>
        <button @click="sellItem" :disabled="selling || !sellPrice" class="mt-4 w-full py-2.5 bg-green-500/20 border border-green-500/30 text-green-400 font-semibold rounded-lg hover:bg-green-500/30 transition-colors text-sm disabled:opacity-50">
          {{ selling ? 'Vente en cours...' : 'Marquer comme vendu' }}
        </button>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button v-if="!item.sold" @click="showEdit = true" class="flex items-center gap-2 px-4 py-2.5 bg-surface-500 text-text rounded-lg hover:bg-surface-600 transition-colors text-sm">
          <Icon icon="lucide:pencil" class="w-4 h-4" /> Modifier
        </button>
        <button @click="confirmDelete" class="flex items-center gap-2 px-4 py-2.5 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors text-sm">
          <Icon icon="lucide:trash-2" class="w-4 h-4" /> Supprimer
        </button>
      </div>

      <VaultForm v-if="showEdit" :edit-data="item" @close="showEdit = false; refresh()" />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'

definePageMeta({ middleware: 'auth', layout: false })
const route = useRoute()

const pageRef = ref<HTMLElement | null>(null)
const qrCanvas = ref<HTMLCanvasElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const item = ref<any>(null)
const currentImage = ref(0)
const showEdit = ref(false)
const sellPrice = ref(0)
const sellDate = ref('')
const selling = ref(false)
const uploading = ref(false)
const uploadError = ref('')

const profitPercent = computed(() => {
  if (!item.value?.acquisition_price || !item.value?.sold_price) return 0
  return ((Number(item.value.sold_price) - Number(item.value.acquisition_price)) / Number(item.value.acquisition_price)) * 100
})

const categories: Record<string, { name: string; icon: string; color: string }> = {
  watches: { name: 'Montres', icon: 'lucide:watch', color: '#C9A84C' },
  art: { name: 'Art', icon: 'lucide:palette', color: '#A855F7' },
  wine: { name: 'Vins', icon: 'lucide:wine', color: '#DC2626' },
  cars: { name: 'Voitures', icon: 'lucide:car', color: '#3B82F6' },
  jewelry: { name: 'Bijoux', icon: 'lucide:gem', color: '#EC4899' },
  furniture: { name: 'Mobilier', icon: 'lucide:armchair', color: '#F97316' },
  books: { name: 'Livres', icon: 'lucide:book-open', color: '#8B5CF6' },
  sneakers: { name: 'Sneakers', icon: 'lucide:footprints', color: '#14B8A6' },
  cards: { name: 'Cartes', icon: 'lucide:credit-card', color: '#F59E0B' },
  other: { name: 'Autre', icon: 'lucide:archive', color: '#71717A' },
}

function getCatIcon(slug: string) { return categories[slug]?.icon || 'lucide:archive' }
function getCatColor(slug: string) { return categories[slug]?.color || '#71717A' }
function getCatName(slug: string) { return categories[slug]?.name || slug }
function getConditionColor(c: string) { const m: Record<string, string> = { excellent: 'bg-green-400', good: 'bg-blue-400', fair: 'bg-yellow-400', poor: 'bg-red-400' }; return m[c] || 'bg-surface-500' }
function getConditionLabel(c: string) { const m: Record<string, string> = { excellent: 'Excellent', good: 'Bon', fair: 'Moyen', poor: 'À restaurer' }; return m[c] || c }
function getDocIcon(t: string) { const m: Record<string, string> = { certificate: 'lucide:award', invoice: 'lucide:receipt', insurance: 'lucide:shield-check', other: 'lucide:file' }; return m[t] || 'lucide:file' }
function getDocTypeLabel(t: string) { const m: Record<string, string> = { certificate: 'Certificat', invoice: 'Facture', insurance: 'Assurance', other: 'Document' }; return m[t] || t }
function getDocBg(t: string) { const m: Record<string, string> = { certificate: 'bg-gold/10', invoice: 'bg-blue-500/10', insurance: 'bg-green-500/10', other: 'bg-surface-500' }; return m[t] || 'bg-surface-500' }
function getDocColor(t: string) { const m: Record<string, string> = { certificate: 'text-gold', invoice: 'text-blue-400', insurance: 'text-green-400', other: 'text-text-600' }; return m[t] || 'text-text-600' }

function formatCurrency(v: number) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v || 0) }
function formatDate(d: string) { if (!d) return ''; return new Date(d).toLocaleDateString('fr-FR') }
function prevImage() { if (item.value) currentImage.value = (currentImage.value - 1 + item.value.images.length) % item.value.images.length }
function nextImage() { if (item.value) currentImage.value = (currentImage.value + 1) % item.value.images.length }

async function downloadQr() {
  if (!qrCanvas.value) return
  const link = document.createElement('a')
  link.download = `aurainvest-qr-${item.value?.id || 'item'}.png`
  link.href = qrCanvas.value.toDataURL('image/png')
  link.click()
}

async function refresh() {
  try { item.value = await $fetch(`/api/vault/items/${route.params.id}`, { credentials: 'include' }) } catch { navigateTo('/vault') }
}
async function confirmDelete() {
  if (confirm('Supprimer cet objet du coffre-fort ?')) {
    await $fetch(`/api/vault/items/${route.params.id}`, { method: 'DELETE', credentials: 'include' })
    navigateTo('/vault')
  }
}

// Upload images
function onFileChange(e: Event) { const files = (e.target as HTMLInputElement).files; if (files) uploadImages(Array.from(files)) }
function onDrop(e: DragEvent) { const files = e.dataTransfer?.files; if (files) uploadImages(Array.from(files)) }
async function uploadImages(files: File[]) {
  uploading.value = true; uploadError.value = ''
  try {
    const data = new FormData()
    for (const f of files.slice(0, 5)) { if (f.type.startsWith('image/') && f.size < 5 * 1024 * 1024) data.append('files', f) }
    await $fetch(`/api/vault/items/${route.params.id}/images`, { method: 'POST', body: data, credentials: 'include' })
    await refresh()
  } catch (e: any) { uploadError.value = e.statusMessage || 'Erreur upload' }
  finally { uploading.value = false }
}

// Sell item
async function sellItem() {
  if (!sellPrice.value) return
  selling.value = true
  try {
    await $fetch(`/api/vault/items/${route.params.id}`, {
      method: 'PUT', body: { sold: true, sold_price: sellPrice.value, sold_date: sellDate.value || new Date().toISOString().split('T')[0] }, credentials: 'include'
    })
    await refresh()
  } catch (e: any) { alert(e.statusMessage || 'Erreur') }
  finally { selling.value = false }
}
async function unsell() {
  try {
    await $fetch(`/api/vault/items/${route.params.id}`, { method: 'PUT', body: { sold: false, sold_price: null, sold_date: null }, credentials: 'include' })
    await refresh()
  } catch (e: any) { alert(e.statusMessage || 'Erreur') }
}

onMounted(async () => {
  await refresh()
  if (item.value && qrCanvas.value) {
    try {
      const QRCode = (await import('qrcode')).default
      const data = JSON.stringify({ id: item.value.id, name: item.value.name, location: item.value.location, serial: item.value.serial_number })
      await QRCode.toCanvas(qrCanvas.value, data, { width: 200, margin: 2, color: { dark: '#0A0A0F', light: '#FFFFFF' } })
    } catch { /* qrcode not installed yet */ }
  }
})
</script>
