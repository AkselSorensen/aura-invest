<template>
  <div class="glass p-5">
    <div class="flex items-center gap-2 mb-3">
      <Icon icon="lucide:sparkles" class="w-4 h-4 text-gold" />
      <h3 class="text-sm font-semibold text-text">Ajout rapide</h3>
    </div>

    <form @submit.prevent="handleSubmit" class="relative">
      <input
        v-model="input"
        placeholder="Ex: 10 actions Apple achetées à 150€"
        class="w-full bg-surface-600 border border-surface-500 rounded-lg pl-10 pr-12 py-3 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm"
        ref="inputRef"
      />
      <Icon icon="lucide:wand-2" class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/60" />
      <button type="submit" :disabled="!input.trim() || submitting" class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-gold/10 text-gold hover:bg-gold/20 transition-colors disabled:opacity-30">
        <Icon icon="lucide:send" class="w-4 h-4" />
      </button>
    </form>

    <!-- Parsed preview -->
    <div v-if="parsed && parsed.confidence > 0.4" class="mt-3 p-3 rounded-lg bg-surface-500/50 border border-surface-500">
      <div class="flex items-center gap-2 mb-2">
        <Icon icon="lucide:check-circle" class="w-4 h-4 text-green-400" />
        <span class="text-xs text-green-400 font-medium">Détecté ({{ Math.round(parsed.confidence * 100) }}%)</span>
      </div>
      <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
        <span class="text-text-600">Nom : <span class="text-text">{{ parsed.name }}</span></span>
        <span class="text-text-600">Qté : <span class="text-text">{{ parsed.quantity }}</span></span>
        <span class="text-text-600">Prix : <span class="text-text">{{ formatCurrency(parsed.purchasePrice) }}</span></span>
        <span class="text-text-600">Cat. : <span class="text-text">{{ parsed.category || 'Auto' }}</span></span>
      </div>
    </div>

    <!-- Result -->
    <div v-if="result" class="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs flex items-center gap-2">
      <Icon icon="lucide:check-circle" class="w-4 h-4" /> {{ result }}
    </div>
    <div v-if="error" class="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
      <Icon icon="lucide:alert-circle" class="w-4 h-4" /> {{ error }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { parseNaturalLanguage } from '~/utils/nlParser'

const emit = defineEmits(['added'])
const input = ref('')
const parsed = ref<any>(null)
const result = ref('')
const error = ref('')
const submitting = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

function formatCurrency(v: number) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v) }

// Live parsing as user types
let parseTimeout: any
watch(input, (val) => {
  clearTimeout(parseTimeout)
  result.value = ''; error.value = ''
  if (val.length > 5) {
    parseTimeout = setTimeout(() => { parsed.value = parseNaturalLanguage(val) }, 300)
  } else {
    parsed.value = null
  }
})

async function handleSubmit() {
  if (!input.value.trim() || submitting.value) return
  const p = parseNaturalLanguage(input.value)
  if (!p || p.confidence < 0.3) { error.value = 'Je n\'ai pas compris. Essayez "10 actions Apple à 150€"' ; return }

  submitting.value = true; error.value = ''; result.value = ''
  try {
    const cats = await $fetch('/api/categories', { credentials: 'include' }) as any[]
    let categoryId = null
    if (p.category) {
      const cat = cats.find((c: any) => c.slug === p.category)
      if (cat) categoryId = cat.id
    }

    await $fetch('/api/investments', {
      method: 'POST',
      body: {
        name: p.name,
        category_id: categoryId,
        type: p.type || 'financial',
        quantity: p.quantity,
        purchase_price: p.purchasePrice,
        current_value: p.currentValue || p.purchasePrice,
        ticker: p.ticker || null,
        purchase_date: p.date || new Date().toISOString().split('T')[0],
      },
      credentials: 'include'
    })
    result.value = `"${p.name}" ajouté !`
    input.value = ''; parsed.value = null
    emit('added')
  } catch (e: any) { error.value = e.statusMessage || 'Erreur' }
  finally { submitting.value = false }
}
</script>
