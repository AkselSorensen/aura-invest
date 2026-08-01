<template>
  <div class="min-h-screen bg-dark flex items-center justify-center p-4">
    <!-- Background glow -->
    <div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

    <div class="glass-lg p-8 w-full max-w-md relative z-10" ref="formRef">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 mb-2">
          <Icon icon="lucide:sparkles" class="w-7 h-7 text-gold" />
          <span class="text-2xl font-bold text-text">Aura<span class="text-gold">Invest</span></span>
        </div>
        <p class="text-text-600 text-sm">Connectez-vous à votre espace</p>
      </div>

      <!-- Error -->
      <div v-if="error" class="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-3 mb-4">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
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
            placeholder="••••••••"
            class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-3 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors"
          />
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-gold text-dark font-semibold rounded-lg py-3 hover:bg-gold-400 transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>

      <p class="text-center text-text-600 text-sm mt-6">
        Pas encore de compte ?
        <NuxtLink to="/register" class="text-gold hover:text-gold-400 transition-colors">S'inscrire</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'

definePageMeta({ layout: false })

useSeoMeta({
  title: 'Connexion',
  description: 'Connectez-vous à AuraInvest pour piloter votre patrimoine en toute simplicité.',
})

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

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const res = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
      credentials: 'include'
    })
    if (res.success) {
      window.location.href = '/profile'
    }
  } catch (e: any) {
    error.value = e.statusMessage || 'Erreur de connexion'
  } finally {
    loading.value = false
  }
}
</script>
