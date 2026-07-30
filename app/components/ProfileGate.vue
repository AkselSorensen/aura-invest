<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-dark/90 backdrop-blur-sm" />
      <div class="glass-lg w-full max-w-md relative z-10 p-8 text-center" ref="modalRef">
        <!-- Icon -->
        <div class="w-20 h-20 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-6">
          <Icon icon="lucide:user-circle" class="w-10 h-10 text-gold" />
        </div>

        <h2 class="text-xl font-bold text-text mb-2">Profil incomplet</h2>
        <p class="text-text-600 text-sm mb-2">
          Vous devez compléter votre profil investisseur avant de pouvoir gérer vos investissements.
        </p>
        <p class="text-text-700 text-xs mb-8">
          Cela nous permet de personnaliser votre expérience et vos recommandations.
        </p>

        <!-- What you'll configure -->
        <div class="grid grid-cols-2 gap-3 mb-8 text-left">
          <div class="flex items-start gap-2 p-3 rounded-lg bg-surface-500/50">
            <Icon icon="lucide:target" class="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <div>
              <div class="text-xs font-medium text-text">Horizon</div>
              <div class="text-[10px] text-text-700">Court, moyen ou long terme</div>
            </div>
          </div>
          <div class="flex items-start gap-2 p-3 rounded-lg bg-surface-500/50">
            <Icon icon="lucide:shield" class="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <div>
              <div class="text-xs font-medium text-text">Risque</div>
              <div class="text-[10px] text-text-700">Prudent à offensif</div>
            </div>
          </div>
          <div class="flex items-start gap-2 p-3 rounded-lg bg-surface-500/50">
            <Icon icon="lucide:layers" class="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <div>
              <div class="text-xs font-medium text-text">Catégories</div>
              <div class="text-[10px] text-text-700">Vos classes d'actifs préférées</div>
            </div>
          </div>
          <div class="flex items-start gap-2 p-3 rounded-lg bg-surface-500/50">
            <Icon icon="lucide:flag" class="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <div>
              <div class="text-xs font-medium text-text">Objectifs</div>
              <div class="text-[10px] text-text-700">Vos ambitions patrimoniales</div>
            </div>
          </div>
        </div>

        <NuxtLink to="/profile" class="block w-full py-3 bg-gold text-dark font-bold rounded-xl hover:bg-gold-400 transition-all text-sm mb-2">
          Compléter mon profil
        </NuxtLink>
        <NuxtLink to="/dashboard" class="block w-full py-2.5 text-text-600 hover:text-text transition-colors text-xs">
          Retour au dashboard
        </NuxtLink>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'

const modalRef = ref<HTMLElement | null>(null)

onMounted(() => {
  nextTick(() => {
    gsap.fromTo(modalRef.value, { autoAlpha: 0, y: 20, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' })
  })
})
</script>
