<template>
  <NuxtLayout name="dashboard">
    <div v-if="item" ref="pageRef">
      <NuxtLink to="/vault" class="inline-flex items-center gap-1.5 text-text-600 hover:text-text transition-colors text-sm mb-6">
        <Icon icon="lucide:arrow-left" class="w-4 h-4" /> Retour au coffre-fort
      </NuxtLink>

      <!-- Image carousel -->
      <div class="glass-lg overflow-hidden mb-6">
        <div v-if="item.images && item.images.length > 0" class="relative">
          <div class="aspect-[16/9] bg-surface-500 overflow-hidden">
            <img :src="item.images[currentImage].url" class="w-full h-full object-contain" />
          </div>
          <!-- Nav arrows -->
          <button v-if="item.images.length > 1" @click="prevImage"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dark/60 backdrop-blur-sm flex items-center justify-center hover:bg-dark/80 transition-colors">
            <Icon icon="lucide:chevron-left" class="w-5 h-5 text-text" />
          </button>
          <button v-if="item.images.length > 1" @click="nextImage"
            class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-dark/60 backdrop-blur-sm flex items-center justify-center hover:bg-dark/80 transition-colors">
            <Icon icon="lucide:chevron-right" class="w-5 h-5 text-text" />
          </button>
          <!-- Thumbnails -->
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
          <span class="text-xl font-bold text-text tabular-nums">{{ formatCurrency(item.current_value) }}</span>
        </div>

        <!-- Stats grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="flex items-start gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0"><Icon icon="lucide:shopping-cart" class="w-4 h-4 text-gold" /></div>
            <div><div class="text-[10px] text-text-700 uppercase tracking-wider">Prix d'achat</div><div class="text-text font-semibold">{{ formatCurrency(item.acquisition_price) }}</div></div>
          </div>
          <div class="flex items-start gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0"><Icon icon="lucide:shield-check" class="w-4 h-4 text-green-400" /></div>
            <div><div class="text-[10px] text-text-700 uppercase tracking-wider">Valeur assurée</div><div class="text-text font-semibold">{{ formatCurrency(item.insured_value) }}</div></div>
          </div>
          <div class="flex items-start gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0"><Icon icon="lucide:map-pin" class="w-4 h-4 text-blue-400" /></div>
            <div><div class="text-[10px] text-text-700 uppercase tracking-wider">Localisation</div><div class="text-text font-semibold">{{ item.location || '-' }}</div></div>
          </div>
          <div class="flex items-start gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0"><Icon icon="lucide:calendar" class="w-4 h-4 text-purple-400" /></div>
            <div><div class="text-[10px] text-text-700 uppercase tracking-wider">Acquisition</div><div class="text-text font-semibold">{{ formatDate(item.acquisition_date) || '-' }}</div></div>
          </div>
        </div>
      </div>

      <!-- Details + QR -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Details -->
        <div class="glass p-5 lg:col-span-2 space-y-3">
          <h3 class="text-sm font-semibold text-text flex items-center gap-2 mb-1"><Icon icon="lucide:info" class="w-4 h-4 text-gold" />Détails</h3>
          <div v-if="item.serial_number" class="flex justify-between text-sm"><span class="text-text-600">N° de série</span><span class="text-text font-mono">{{ item.serial_number }}</span></div>
          <div v-if="item.dimensions" class="flex justify-between text-sm"><span class="text-text-600">Dimensions</span><span class="text-text">{{ item.dimensions }}</span></div>
          <div v-if="item.weight" class="flex justify-between text-sm"><span class="text-text-600">Poids</span><span class="text-text">{{ item.weight }}</span></div>
          <div v-if="item.description" class="pt-2 border-t border-surface-500">
            <div class="text-xs text-text-700 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Icon icon="lucide:file-text" class="w-3 h-3" /> Description</div>
            <p class="text-text-600 text-sm">{{ item.description }}</p>
          </div>
          <div v-if="item.notes" class="pt-2 border-t border-surface-500">
            <div class="text-xs text-text-700 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Icon icon="lucide:sticky-note" class="w-3 h-3" /> Notes</div>
            <p class="text-text-600 text-sm">{{ item.notes }}</p>
          </div>
        </div>

        <!-- QR Code -->
        <div class="glass p-5 text-center">
          <h3 class="text-sm font-semibold text-text mb-3 flex items-center justify-center gap-2"><Icon icon="lucide:qr-code" class="w-4 h-4 text-gold" />QR Code</h3>
          <canvas ref="qrCanvas" class="w-36 h-36 mx-auto rounded-lg bg-white p-2" />
          <p class="text-text-700 text-[10px] mt-2">Scannez pour voir les infos de l'objet</p>
          <button @click="downloadQr" class="mt-2 text-xs text-gold hover:text-gold-400 flex items-center gap-1 mx-auto">
            <Icon icon="lucide:download" class="w-3 h-3" /> Télécharger
          </button>
        </div>
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

      <!-- Actions -->
      <div class="flex gap-3">
        <button @click="showEdit = true" class="flex items-center gap-2 px-4 py-2.5 bg-surface-500 text-text rounded-lg hover:bg-surface-600 transition-colors text-sm">
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
import { ref, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'

definePageMeta({ middleware: 'auth', layout: false })
const route = useRoute()

const pageRef = ref<HTMLElement | null>(null)
const qrCanvas = ref<HTMLCanvasElement | null>(null)
const item = ref<any>(null)
const currentImage = ref(0)
const showEdit = ref(false)

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

function formatCurrency(v: number) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v) }
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

onMounted(async () => {
  await refresh()
  // Generate QR
  if (item.value && qrCanvas.value) {
    try {
      const QRCode = (await import('qrcode')).default
      const data = JSON.stringify({ id: item.value.id, name: item.value.name, location: item.value.location, serial: item.value.serial_number })
      await QRCode.toCanvas(qrCanvas.value, data, { width: 200, margin: 2, color: { dark: '#0A0A0F', light: '#FFFFFF' } })
    } catch { /* qrcode not installed yet */ }
  }
  nextTick(() => { gsap.fromTo(pageRef.value, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }) })
})
</script>
