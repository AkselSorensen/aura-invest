<template>
  <NuxtLayout name="dashboard">
    <div v-if="investment" ref="pageRef">
      <!-- Back -->
      <NuxtLink to="/investments" class="inline-flex items-center gap-1.5 text-text-600 hover:text-text transition-colors text-sm mb-6">
        <Icon icon="lucide:arrow-left" class="w-4 h-4" />
        Retour aux investissements
      </NuxtLink>

      <!-- Main card -->
      <div class="glass-lg p-6 mb-6">
        <div class="flex flex-col md:flex-row gap-6">
          <!-- Image -->
          <div class="w-full md:w-64 h-48 rounded-xl bg-surface-500 overflow-hidden shrink-0 flex items-center justify-center">
            <img v-if="investment.image_url" :src="investment.image_url" class="w-full h-full object-cover" />
            <Icon v-else :icon="investment.category_icon || 'lucide:folder'" class="w-16 h-16 opacity-30" :style="{ color: investment.category_color || '#71717A' }" />
          </div>

          <!-- Info -->
          <div class="flex-1">
            <div class="flex items-start justify-between gap-3 mb-2">
              <h1 class="text-xl font-bold text-text">{{ investment.name }}</h1>
              <span class="text-xs px-2.5 py-1 rounded-full shrink-0" :style="{ backgroundColor: investment.category_color + '20', color: investment.category_color }">
                {{ investment.category_name }}
              </span>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <div class="flex items-start gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon icon="lucide:wallet" class="w-4 h-4 text-gold" />
                </div>
                <div>
                  <div class="text-[10px] text-text-700 uppercase tracking-wider mb-0.5">Valeur actuelle</div>
                  <div class="text-lg font-bold text-text">{{ formatCurrency(investment.current_value) }}</div>
                </div>
              </div>
              <div class="flex items-start gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-surface-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon icon="lucide:shopping-cart" class="w-4 h-4 text-text-600" />
                </div>
                <div>
                  <div class="text-[10px] text-text-700 uppercase tracking-wider mb-0.5">Prix d'achat</div>
                  <div class="text-lg font-bold text-text">{{ formatCurrency(investment.purchase_price) }}</div>
                </div>
              </div>
              <div class="flex items-start gap-2.5">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" :class="gain >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'">
                  <Icon :icon="gain >= 0 ? 'lucide:trending-up' : 'lucide:trending-down'" class="w-4 h-4" :class="gain >= 0 ? 'text-green-400' : 'text-red-400'" />
                </div>
                <div>
                  <div class="text-[10px] text-text-700 uppercase tracking-wider mb-0.5">Plus-value</div>
                  <div class="text-lg font-bold" :class="gain >= 0 ? 'text-success' : 'text-danger'">
                    {{ gain >= 0 ? '+' : '' }}{{ formatCurrency(gain) }} ({{ gainPercent >= 0 ? '+' : '' }}{{ gainPercent.toFixed(1) }}%)
                  </div>
                </div>
              </div>
              <div class="flex items-start gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon icon="lucide:hash" class="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div class="text-[10px] text-text-700 uppercase tracking-wider mb-0.5">Quantité</div>
                  <div class="text-lg text-text">{{ investment.quantity }}</div>
                </div>
              </div>
              <div class="flex items-start gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon icon="lucide:calendar" class="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <div class="text-[10px] text-text-700 uppercase tracking-wider mb-0.5">Date d'achat</div>
                  <div class="text-lg text-text">{{ formatDate(investment.purchase_date) }}</div>
                </div>
              </div>
              <div class="flex items-start gap-2.5">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  :class="investment.type === 'physical' ? 'bg-pink-500/10' : 'bg-cyan-500/10'">
                  <Icon :icon="investment.type === 'physical' ? 'lucide:box' : 'lucide:bar-chart-3'" class="w-4 h-4"
                    :class="investment.type === 'physical' ? 'text-pink-400' : 'text-cyan-400'" />
                </div>
                <div>
                  <div class="text-[10px] text-text-700 uppercase tracking-wider mb-0.5">Type</div>
                  <div class="text-lg text-text capitalize">{{ investment.type === 'physical' ? 'Physique' : 'Financier' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Description & notes -->
        <div v-if="investment.description" class="mt-6 pt-5 border-t border-surface-500">
          <div class="flex items-center gap-1.5 text-xs text-text-700 uppercase tracking-wider mb-2">
            <Icon icon="lucide:file-text" class="w-3.5 h-3.5" /> Description
          </div>
          <p class="text-text-600 text-sm">{{ investment.description }}</p>
        </div>
        <div v-if="investment.notes" class="mt-4">
          <div class="flex items-center gap-1.5 text-xs text-text-700 uppercase tracking-wider mb-2">
            <Icon icon="lucide:sticky-note" class="w-3.5 h-3.5" /> Notes
          </div>
          <p class="text-text-600 text-sm">{{ investment.notes }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button @click="showEdit = true" class="flex items-center gap-2 px-4 py-2.5 bg-surface-500 text-text rounded-lg hover:bg-surface-600 transition-colors text-sm">
          <Icon icon="lucide:pencil" class="w-4 h-4" />
          Modifier
        </button>
        <button @click="confirmDelete" class="flex items-center gap-2 px-4 py-2.5 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors text-sm">
          <Icon icon="lucide:trash-2" class="w-4 h-4" />
          Supprimer
        </button>
      </div>

      <!-- Edit modal -->
      <InvestmentForm v-if="showEdit" :edit-data="investment" @close="showEdit = false; refresh()" />
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'

definePageMeta({ middleware: 'auth', layout: false })
const route = useRoute()

const pageRef = ref<HTMLElement | null>(null)
const investment = ref<any>(null)
const showEdit = ref(false)

const gain = computed(() => Number(investment.value?.current_value || 0) - Number(investment.value?.purchase_price || 0))
const gainPercent = computed(() => {
  const cost = Number(investment.value?.purchase_price || 0)
  return cost > 0 ? (gain.value / cost) * 100 : 0
})

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val)
}
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR')
}

async function refresh() {
  try {
    investment.value = await $fetch(`/api/investments/${route.params.id}`, { credentials: 'include' })
  } catch {
    navigateTo('/investments')
  }
}

async function confirmDelete() {
  if (confirm('Supprimer cet investissement ?')) {
    await $fetch(`/api/investments/${route.params.id}`, { method: 'DELETE', credentials: 'include' })
    navigateTo('/investments')
  }
}

onMounted(async () => {
  await refresh()
  nextTick(() => {
    gsap.fromTo(pageRef.value, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' })
  })
})
</script>
