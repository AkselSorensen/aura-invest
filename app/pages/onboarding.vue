<template>
  <div class="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Background effects -->
    <div class="absolute top-0 left-0 w-[500px] h-[500px] bg-gold/3 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
    <div class="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/3 rounded-full blur-[150px] translate-x-1/2 translate-y-1/2" />

    <div class="w-full max-w-2xl relative z-10" ref="containerRef">
      <!-- Step indicator -->
      <div class="flex items-center justify-center gap-2 mb-10">
        <div
          v-for="i in 4" :key="i"
          class="w-2.5 h-2.5 rounded-full transition-all duration-500"
          :class="i <= step ? 'bg-gold scale-110' : 'bg-surface-500'"
        />
      </div>

      <!-- Progress bar -->
      <div class="w-full h-0.5 bg-surface-500 rounded-full mb-10 overflow-hidden">
        <div class="h-full bg-gold rounded-full transition-all duration-700 ease-out" :style="{ width: `${(step / 4) * 100}%` }" />
      </div>

      <!-- STEP 1: Welcome -->
      <div v-if="step === 1" class="glass-lg p-8 md:p-12 text-center" ref="step1Ref">
        <div class="w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-6">
          <Icon icon="lucide:sparkles" class="w-10 h-10 text-gold" />
        </div>
        <h1 class="text-3xl md:text-4xl font-bold text-text mb-3">
          Bienvenue, <span class="text-gold">{{ userName }}</span> !
        </h1>
        <p class="text-text-600 text-lg max-w-md mx-auto mb-2">
          Votre espace investisseur est prêt. Configurons-le ensemble en 2 minutes.
        </p>
        <p class="text-text-700 text-sm mb-8">Vous pourrez toujours modifier ces paramètres plus tard.</p>

        <button @click="nextStep" class="px-8 py-3.5 bg-gold text-dark font-semibold rounded-xl hover:bg-gold-400 transition-all text-base shadow-lg shadow-gold/20">
          Commencer la configuration
        </button>
      </div>

      <!-- STEP 2: Categories interests -->
      <div v-if="step === 2" class="glass-lg p-8 md:p-10" ref="step2Ref">
        <h2 class="text-2xl font-bold text-text mb-2">Vos centres d'intérêt</h2>
        <p class="text-text-600 mb-8">Sélectionnez les types d'investissements qui vous concernent.</p>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <button
            v-for="cat in categories"
            :key="cat.slug"
            @click="toggleCategory(cat.slug)"
            class="p-4 rounded-xl border text-center transition-all"
            :class="selectedCategories.includes(cat.slug)
              ? 'border-gold/40 bg-gold/10 text-text'
              : 'border-surface-500 bg-surface text-text-600 hover:border-surface-400'"
          >
            <Icon :icon="cat.icon" class="w-8 h-8 mx-auto mb-2" :style="{ color: selectedCategories.includes(cat.slug) ? '#C9A84C' : '#71717A' }" />
            <span class="text-xs font-medium block">{{ cat.name }}</span>
          </button>
        </div>

        <div class="flex gap-3">
          <button @click="step = 1" class="px-6 py-3 border border-surface-500 text-text-600 rounded-xl hover:text-text transition-colors text-sm">
            Retour
          </button>
          <button @click="nextStep" class="flex-1 px-6 py-3 bg-gold text-dark font-semibold rounded-xl hover:bg-gold-400 transition-all text-sm">
            Continuer
          </button>
        </div>
      </div>

      <!-- STEP 3: First investment -->
      <div v-if="step === 3" class="glass-lg p-8 md:p-10" ref="step3Ref">
        <h2 class="text-2xl font-bold text-text mb-2">Premier investissement</h2>
        <p class="text-text-600 mb-8">Ajoutez votre premier investissement ou passez cette étape.</p>

        <form @submit.prevent="addFirstInvestment" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm text-text-600 mb-1.5">Nom</label>
              <input v-model="firstInv.name" placeholder="Ex: Bitcoin, Appartement Paris, Apple Inc."
                class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-3 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Catégorie</label>
              <select v-model="firstInv.category_id"
                class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-3 text-text focus:outline-none focus:border-gold/40 transition-colors text-sm">
                <option :value="null">Choisir...</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Valeur actuelle (€)</label>
              <input v-model.number="firstInv.current_value" type="number" min="0" step="any" placeholder="10000"
                class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-3 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Prix d'achat (€)</label>
              <input v-model.number="firstInv.purchase_price" type="number" min="0" step="any" placeholder="8000"
                class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-3 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Quantité</label>
              <input v-model.number="firstInv.quantity" type="number" min="0" step="any" placeholder="1"
                class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-3 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="step = 2" class="px-6 py-3 border border-surface-500 text-text-600 rounded-xl hover:text-text transition-colors text-sm">Retour</button>
            <button v-if="firstInv.name" type="submit" class="flex-1 px-6 py-3 bg-gold text-dark font-semibold rounded-xl hover:bg-gold-400 transition-all text-sm">
              Ajouter et terminer
            </button>
            <button type="button" @click="finishOnboarding" class="flex-1 px-6 py-3 border border-surface-500 text-text-600 rounded-xl hover:text-text hover:border-text-700 transition-all text-sm">
              Passer cette étape
            </button>
          </div>
        </form>
      </div>

      <!-- STEP 4: Done -->
      <div v-if="step === 4" class="glass-lg p-8 md:p-12 text-center" ref="step4Ref">
        <div class="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
          <Icon icon="lucide:check" class="w-12 h-12 text-success" />
        </div>
        <h2 class="text-3xl font-bold text-text mb-3">Vous êtes prêt !</h2>
        <p class="text-text-600 text-lg max-w-md mx-auto mb-8">
          Votre espace AuraInvest est configuré. Suivez votre patrimoine, ajoutez des investissements et optimisez vos performances.
        </p>

        <div class="flex items-center justify-center gap-3 mb-8">
          <div v-for="cat in selectedCategories.slice(0, 4)" :key="cat" class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-500 text-xs text-text-600">
            <Icon :icon="getCatIcon(cat)" class="w-3.5 h-3.5 text-gold" />
            {{ getCatName(cat) }}
          </div>
          <span v-if="selectedCategories.length > 4" class="text-xs text-text-700">+{{ selectedCategories.length - 4 }}</span>
        </div>

        <button @click="finishOnboarding" class="px-10 py-4 bg-gold text-dark font-bold rounded-xl hover:bg-gold-400 transition-all text-base shadow-lg shadow-gold/20">
          Accéder à mon dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'

definePageMeta({ layout: false })

const containerRef = ref<HTMLElement | null>(null)
const step1Ref = ref<HTMLElement | null>(null)
const step2Ref = ref<HTMLElement | null>(null)
const step3Ref = ref<HTMLElement | null>(null)
const step4Ref = ref<HTMLElement | null>(null)

const step = ref(1)
const categories = ref<any[]>([])
const selectedCategories = ref<string[]>([])
const firstInv = ref({ name: '', category_id: null, current_value: 0, purchase_price: 0, quantity: 1 })
const userName = ref('')

const stepRefs = computed(() => [null, step1Ref, step2Ref, step3Ref, step4Ref])

function toggleCategory(slug: string) {
  const idx = selectedCategories.value.indexOf(slug)
  if (idx >= 0) selectedCategories.value.splice(idx, 1)
  else selectedCategories.value.push(slug)
}

function getCatIcon(slug: string) {
  return categories.value.find(c => c.slug === slug)?.icon || 'lucide:folder'
}
function getCatName(slug: string) {
  return categories.value.find(c => c.slug === slug)?.name || slug
}

function nextStep() {
  step.value++
  animateStep()
}

function animateStep() {
  nextTick(() => {
    const el = stepRefs.value[step.value]?.value
    if (el) {
      gsap.fromTo(el, { autoAlpha: 0, y: 24, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' })
    }
  })
}

async function addFirstInvestment() {
  if (!firstInv.value.name) return
  try {
    await $fetch('/api/investments', {
      method: 'POST',
      body: { ...firstInv.value, type: 'financial' },
      credentials: 'include'
    })
  } catch {}
  step.value = 4
  animateStep()
}

async function finishOnboarding() {
  window.location.href = '/dashboard'
}

onMounted(async () => {
  // Get user info
  try {
    const me = await $fetch('/api/auth/me', { credentials: 'include' })
    userName.value = (me as any).user?.name || ''
    // If no user, redirect to login
    if (!(me as any).user) { window.location.href = '/login'; return }
  } catch { window.location.href = '/login'; return }

  // Get categories
  try { categories.value = await $fetch('/api/categories', { credentials: 'include' }) as any[] } catch {}

  // Initial animation
  nextTick(() => {
    gsap.fromTo(containerRef.value, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
    animateStep()
  })
})
</script>
