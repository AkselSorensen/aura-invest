<template>
  <ClientOnly>
    <div v-if="showInstall" class="fixed bottom-4 right-4 z-[300] glass p-4 max-w-sm shadow-xl border border-gold/20 animate-in" ref="installRef">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
          <Icon icon="lucide:download" class="w-5 h-5 text-gold" />
        </div>
        <div class="flex-1">
          <div class="text-sm font-semibold text-text">Installer AuraInvest</div>
          <div class="text-xs text-text-600 mt-0.5">Ajoutez l'app sur votre écran d'accueil</div>
          <div class="flex gap-2 mt-3">
            <button @click="installPWA" class="px-4 py-1.5 bg-gold text-dark text-xs font-semibold rounded-lg hover:bg-gold-400 transition-colors">Installer</button>
            <button @click="showInstall = false" class="px-3 py-1.5 text-text-600 text-xs hover:text-text transition-colors">Plus tard</button>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'

const showInstall = ref(false)
const deferredPrompt = ref<any>(null)
const installRef = ref<HTMLElement | null>(null)

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault()
    deferredPrompt.value = e
    setTimeout(() => { showInstall.value = true }, 3000)
    nextTick(() => {
      gsap.fromTo(installRef.value, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out' })
    })
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt.value = null
    showInstall.value = false
  })
})

async function installPWA() {
  if (!deferredPrompt.value) {
    // iOS fallback: show instructions
    showInstall.value = false
    return
  }
  deferredPrompt.value.prompt()
  const result = await deferredPrompt.value.userChoice
  if (result.outcome === 'accepted') {
    deferredPrompt.value = null
    showInstall.value = false
  }
}
</script>

<style scoped>
.animate-in {
  animation: slideUp 0.4s ease-out;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
