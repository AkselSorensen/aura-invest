<template>
  <NuxtLayout name="dashboard">
    <div ref="pageRef">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-text flex items-center gap-2.5"><Icon icon="lucide:wrench" class="w-6 h-6 text-gold" />Outils</h1>
        <p class="text-text-600 mt-1">Simulateurs et utilitaires pour vos investissements</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Tax Simulator -->
        <div class="glass p-6">
          <h2 class="text-lg font-semibold text-text flex items-center gap-2 mb-4"><Icon icon="lucide:calculator" class="w-5 h-5 text-gold" />Simulateur fiscal</h2>
          <p class="text-text-600 text-sm mb-4">Comparez l'impact fiscal France vs Suisse</p>
          
          <div class="space-y-3">
            <div><label class="block text-sm text-text-600 mb-1">Prix d'achat (€)</label><input v-model.number="taxInput.cost" type="number" min="0" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text text-sm focus:outline-none focus:border-gold/40" /></div>
            <div><label class="block text-sm text-text-600 mb-1">Prix de vente (€)</label><input v-model.number="taxInput.sell" type="number" min="0" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text text-sm focus:outline-none focus:border-gold/40" /></div>
            <div><label class="block text-sm text-text-600 mb-1">Type d'actif</label>
              <select v-model="taxInput.type" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text text-sm focus:outline-none focus:border-gold/40">
                <option value="stocks">Actions / ETF</option>
                <option value="crypto">Crypto</option>
                <option value="realestate">Immobilier (hors RP)</option>
                <option value="collectible">Objet de collection</option>
                <option value="gold">Or physique</option>
              </select>
            </div>
          </div>

          <div v-if="taxResult" class="mt-5 p-4 bg-surface-500 rounded-lg space-y-2">
            <div class="text-sm font-semibold text-text mb-2">Plus-value brute : <span class="text-gold">{{ formatCurrency(taxResult.gain) }}</span></div>
            <div class="flex items-center justify-between text-sm"><span class="text-text-600">🇫🇷 France</span><span class="text-red-400">-{{ formatCurrency(taxResult.franceTax) }} ({{ taxResult.franceRate }}%)</span><span class="text-green-400 font-medium">{{ formatCurrency(taxResult.franceNet) }}</span></div>
            <div class="flex items-center justify-between text-sm"><span class="text-text-600">🇨🇭 Suisse</span><span class="text-red-400">-{{ formatCurrency(taxResult.swissTax) }} ({{ taxResult.swissRate }}%)</span><span class="text-green-400 font-medium">{{ formatCurrency(taxResult.swissNet) }}</span></div>
            <div class="pt-2 border-t border-surface-400 text-sm font-medium" :class="taxResult.diff > 0 ? 'text-green-400' : 'text-text'">
              💰 Gain en Suisse : +{{ formatCurrency(taxResult.diff) }}
            </div>
          </div>
        </div>

        <!-- Quick Scan -->
        <div class="glass p-6">
          <h2 class="text-lg font-semibold text-text flex items-center gap-2 mb-4"><Icon icon="lucide:camera" class="w-5 h-5 text-gold" />Scan rapide</h2>
          <p class="text-text-600 text-sm mb-4">Prenez une photo et saisissez les infos</p>

          <div class="space-y-3">
            <div @click="fileInput?.click()" class="border-2 border-dashed border-surface-500 rounded-xl p-8 text-center hover:border-gold/30 transition-colors cursor-pointer">
              <Icon icon="lucide:camera" class="w-10 h-10 text-text-700 mx-auto mb-2" />
              <p class="text-text-600 text-sm">Prendre une photo du ticket</p>
              <p class="text-text-700 text-xs mt-1">Ou scannez un document</p>
            </div>
            <input ref="fileInput" type="file" accept="image/*" capture="environment" class="hidden" @change="onScanFile" />
            <div v-if="scanPreview" class="relative rounded-lg overflow-hidden bg-surface-500">
              <img :src="scanPreview" class="w-full max-h-48 object-contain" />
            </div>

            <div><label class="block text-sm text-text-600 mb-1">Nom de l'objet</label><input v-model="scanForm.name" placeholder="Ex: Rolex Submariner" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text text-sm focus:outline-none focus:border-gold/40" /></div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="block text-sm text-text-600 mb-1">Prix (€)</label><input v-model.number="scanForm.price" type="number" min="0" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text text-sm focus:outline-none focus:border-gold/40" /></div>
              <div><label class="block text-sm text-text-600 mb-1">Catégorie</label><select v-model="scanForm.category" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text text-sm focus:outline-none focus:border-gold/40">
                <option value="watches">Montres</option><option value="art">Art</option><option value="wine">Vins</option><option value="jewelry">Bijoux</option><option value="other">Autre</option></select></div>
            </div>
            <button @click="quickCreate" :disabled="!scanForm.name || !scanForm.price" class="w-full py-2.5 bg-gold text-dark font-semibold rounded-lg hover:bg-gold-400 transition-colors text-sm disabled:opacity-50">Ajouter au coffre-fort</button>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

definePageMeta({ middleware: 'auth', layout: false })

const pageRef = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const scanPreview = ref<string | null>(null)
const scanForm = ref({ name: '', price: 0, category: 'other' })

const taxInput = ref({ cost: 0, sell: 0, type: 'stocks' })

const taxResult = computed(() => {
  const { cost, sell, type } = taxInput.value
  if (!cost || !sell || sell <= cost) return null
  const gain = sell - cost

  // France: Flat tax 30% (12.8% IR + 17.2% PS) sur actions/crypto
  // Or: 36.2% (19% + 17.2%) sur objets précieux
  // Immobilier: 19% IR + 17.2% PS = 36.2%
  const franceRates: Record<string, number> = { stocks: 30, crypto: 30, realestate: 36.2, collectible: 36.2, gold: 36.2 }
  const franceRate = franceRates[type] || 30
  const franceTax = Math.round(gain * franceRate / 100 * 100) / 100
  const franceNet = Math.round((gain - franceTax) * 100) / 100

  // Switzerland: no capital gains tax for individuals (on movable assets)
  // But wealth tax applies (not calculated here). Real estate gains are taxed.
  const swissRates: Record<string, number> = { stocks: 0, crypto: 0, realestate: 15, collectible: 0, gold: 0 }
  const swissRate = swissRates[type] || 0
  const swissTax = Math.round(gain * swissRate / 100 * 100) / 100
  const swissNet = Math.round((gain - swissTax) * 100) / 100

  return { gain, franceTax, franceRate, franceNet, swissTax, swissRate, swissNet, diff: Math.round((swissNet - franceNet) * 100) / 100 }
})

function formatCurrency(v: number) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v) }

function onScanFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) { scanPreview.value = URL.createObjectURL(file) }
}

async function quickCreate() {
  try {
    const res = await $fetch('/api/vault/items', {
      method: 'POST', body: { name: scanForm.value.name, category: scanForm.value.category, current_value: scanForm.value.price, acquisition_price: scanForm.value.price, condition: 'good' }, credentials: 'include'
    }) as any
    // Upload photo if taken
    if (scanPreview.value && res.item) {
      const blob = await fetch(scanPreview.value).then(r => r.blob())
      const data = new FormData(); data.append('files', blob, 'scan.jpg')
      await $fetch(`/api/vault/items/${res.item.id}/images`, { method: 'POST', body: data, credentials: 'include' })
    }
    scanForm.value = { name: '', price: 0, category: 'other' }
    scanPreview.value = null
    alert('Objet ajouté au coffre-fort !')
  } catch (e: any) { alert(e.statusMessage || 'Erreur') }
}

onMounted(() => { try { $fetch('/api/vault/setup', { method: 'POST' }) } catch {} })
</script>
