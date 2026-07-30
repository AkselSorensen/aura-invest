<template>
  <div class="min-h-screen bg-dark flex items-center justify-center p-4">
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

    <div class="glass-lg p-8 w-full max-w-md relative z-10" ref="formRef">
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 mb-2">
          <Icon icon="lucide:sparkles" class="w-7 h-7 text-gold" />
          <span class="text-2xl font-bold text-text">Aura<span class="text-gold">Invest</span></span>
        </div>
        <p class="text-text-600 text-sm">Créez votre compte investisseur</p>
      </div>

      <div v-if="error" class="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-3 mb-4">
        {{ error }}
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm text-text-600 mb-1.5">Nom</label>
          <input
            v-model="name"
            type="text"
            required
            placeholder="John Doe"
            class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-3 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors"
          />
        </div>
        <div>
          <label class="block text-sm text-text-600 mb-1.5">Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="vous@email.com"
            class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-3 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors"
          />
        </div>
        <div>
          <label class="block text-sm text-text-600 mb-1.5">Mot de passe</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="8 caractères minimum"
            class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-3 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors"
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-gold text-dark font-semibold rounded-lg py-3 hover:bg-gold-400 transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Création...' : 'Créer mon compte' }}
        </button>
      </form>

      <p class="text-center text-text-600 text-sm mt-6">
        Déjà un compte ?
        <NuxtLink to="/login" class="text-gold hover:text-gold-400 transition-colors">Se connecter</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'

definePageMeta({ layout: false })

const name = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const formRef = ref<HTMLElement | null>(null)

onMounted(() => {
  nextTick(() => {
    gsap.fromTo(formRef.value, { autoAlpha: 0, y: 30, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' })
  })
})

async function handleRegister() {
  error.value = ''
  loading.value = true
  try {
    const res = await $fetch('/api/auth/register', {
      method: 'POST',
      body: { name: name.value, email: email.value, password: password.value },
      credentials: 'include'
    })
    if (res.success) {
      window.location.href = '/profile'
    }
  } catch (e: any) {
    error.value = e.statusMessage || 'Erreur d\'inscription'
  } finally {
    loading.value = false
  }
}
</script>
