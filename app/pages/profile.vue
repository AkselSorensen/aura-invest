<template>
  <NuxtLayout name="dashboard">
    <div class="max-w-2xl mx-auto" ref="pageRef">
      <!-- Header -->
      <div class="text-center mb-10">
        <div class="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
          <Icon icon="lucide:user-circle" class="w-8 h-8 text-gold" />
        </div>
        <h1 class="text-2xl font-bold text-text">Profil investisseur</h1>
        <p class="text-text-600 mt-1">Complétez votre profil pour accéder à toutes les fonctionnalités</p>
      </div>

      <!-- Already completed -->
      <div v-if="isCompleted && !editing" class="glass-lg p-8 text-center">
        <div class="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <Icon icon="lucide:check" class="w-8 h-8 text-success" />
        </div>
        <h2 class="text-xl font-bold text-text mb-2">Profil complété</h2>
        <p class="text-text-600 mb-6">Votre profil investisseur est configuré. Vous pouvez maintenant gérer vos investissements.</p>
        <div class="flex gap-3 justify-center">
          <button @click="editing = true" class="px-5 py-2.5 border border-surface-500 text-text-600 rounded-lg hover:text-text transition-colors text-sm">
            <Icon icon="lucide:pencil" class="w-4 h-4 inline mr-1.5" />Modifier
          </button>
          <NuxtLink to="/investments" class="px-5 py-2.5 bg-gold text-dark font-semibold rounded-lg hover:bg-gold-400 transition-colors text-sm">
            Mes investissements
          </NuxtLink>
        </div>
      </div>

      <!-- Form -->
      <div v-else class="glass-lg p-8">
        <div v-if="error" class="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-3 mb-6">{{ error }}</div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Full name -->
          <div>
            <label class="block text-sm font-medium text-text-600 mb-1.5">
              Nom complet <span class="text-gold">*</span>
            </label>
            <input v-model="form.full_name" required placeholder="Jean Dupont"
              class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-3 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors" />
          </div>

          <!-- Bio -->
          <div>
            <label class="block text-sm font-medium text-text-600 mb-1.5">Bio</label>
            <textarea v-model="form.bio" rows="2" placeholder="Investisseur particulier passionné par..."
              class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-3 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors resize-none" />
          </div>

          <!-- Investment horizon -->
          <div>
            <label class="block text-sm font-medium text-text-600 mb-1.5">
              Horizon d'investissement <span class="text-gold">*</span>
            </label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="h in horizons" :key="h.value" type="button"
                @click="form.investment_horizon = h.value"
                class="py-2.5 rounded-lg text-xs font-medium transition-all border"
                :class="form.investment_horizon === h.value
                  ? 'border-gold/40 bg-gold/10 text-gold'
                  : 'border-surface-500 bg-surface text-text-600 hover:border-surface-400'"
              >{{ h.label }}</button>
            </div>
          </div>

          <!-- Risk tolerance -->
          <div>
            <label class="block text-sm font-medium text-text-600 mb-1.5">
              Tolérance au risque <span class="text-gold">*</span>
            </label>
            <div class="space-y-2">
              <button
                v-for="r in risks" :key="r.value" type="button"
                @click="form.risk_tolerance = r.value"
                class="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all border text-sm"
                :class="form.risk_tolerance === r.value
                  ? 'border-gold/40 bg-gold/10 text-text'
                  : 'border-surface-500 bg-surface text-text-600 hover:border-surface-400'"
              >
                <Icon :icon="r.icon" class="w-5 h-5 shrink-0" :class="form.risk_tolerance === r.value ? 'text-gold' : 'text-text-700'" />
                <div>
                  <div class="font-medium">{{ r.label }}</div>
                  <div class="text-xs text-text-700">{{ r.desc }}</div>
                </div>
              </button>
            </div>
          </div>

          <!-- Preferred categories -->
          <div>
            <label class="block text-sm font-medium text-text-600 mb-1.5">Catégories préférées</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="cat in categories" :key="cat.slug" type="button"
                @click="toggleCategory(cat.slug)"
                class="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
                :class="form.preferred_categories.includes(cat.slug)
                  ? 'border-gold/40 bg-gold/10 text-gold'
                  : 'border-surface-500 text-text-600 hover:border-surface-400'"
              >{{ cat.name }}</button>
            </div>
          </div>

          <!-- Goal description -->
          <div>
            <label class="block text-sm font-medium text-text-600 mb-1.5">Objectif patrimonial</label>
            <textarea v-model="form.goal_description" rows="2" placeholder="Ex: Constituer un patrimoine de 500k€ d'ici 10 ans..."
              class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-3 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors resize-none" />
          </div>

          <!-- Submit -->
          <button
            type="submit" :disabled="submitting"
            class="w-full py-3.5 bg-gold text-dark font-bold rounded-xl hover:bg-gold-400 transition-all text-base disabled:opacity-50 shadow-lg shadow-gold/10"
          >
            {{ submitting ? 'Enregistrement...' : (isCompleted ? 'Mettre à jour mon profil' : 'Finaliser mon profil') }}
          </button>
        </form>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'

definePageMeta({ middleware: 'auth', layout: false })

const pageRef = ref<HTMLElement | null>(null)
const error = ref('')
const submitting = ref(false)
const isCompleted = ref(false)
const editing = ref(false)
const categories = ref<any[]>([])

const form = ref({
  full_name: '',
  bio: '',
  investment_horizon: '',
  risk_tolerance: '',
  goal_description: '',
  preferred_categories: [] as string[]
})

const horizons = [
  { value: 'short', label: 'Court terme' },
  { value: 'medium', label: 'Moyen terme' },
  { value: 'long', label: 'Long terme' },
  { value: 'very_long', label: 'Très long' },
]

const risks = [
  { value: 'low', label: 'Prudent', icon: 'lucide:shield', desc: 'Vous privilégiez la sécurité du capital' },
  { value: 'moderate', label: 'Équilibré', icon: 'lucide:scale', desc: 'Un mix entre sécurité et performance' },
  { value: 'high', label: 'Dynamique', icon: 'lucide:trending-up', desc: 'Vous acceptez la volatilité pour plus de rendement' },
  { value: 'aggressive', label: 'Offensif', icon: 'lucide:rocket', desc: 'Rendement maximum, risque élevé assumé' },
]

function toggleCategory(slug: string) {
  const idx = form.value.preferred_categories.indexOf(slug)
  if (idx >= 0) form.value.preferred_categories.splice(idx, 1)
  else form.value.preferred_categories.push(slug)
}

async function handleSubmit() {
  error.value = ''
  submitting.value = true
  try {
    await $fetch('/api/profile', {
      method: 'POST',
      body: form.value,
      credentials: 'include'
    })
    isCompleted.value = true
    editing.value = false
  } catch (e: any) {
    error.value = e.statusMessage || 'Erreur'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    await $fetch('/api/profile/setup', { method: 'POST' })
  } catch {}

  // Load profile
  try {
    const res = await $fetch('/api/profile', { credentials: 'include' }) as any
    if (res.profile) {
      form.value = {
        full_name: res.profile.full_name || '',
        bio: res.profile.bio || '',
        investment_horizon: res.profile.investment_horizon || '',
        risk_tolerance: res.profile.risk_tolerance || '',
        goal_description: res.profile.goal_description || '',
        preferred_categories: res.profile.preferred_categories || []
      }
      isCompleted.value = res.profile.completed
    }
  } catch {}

  // Load categories
  try {
    categories.value = await $fetch('/api/categories', { credentials: 'include' }) as any[]
  } catch {}

  nextTick(() => {
    gsap.fromTo(pageRef.value, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' })
  })
})
</script>
