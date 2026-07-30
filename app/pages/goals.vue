<template>
  <NuxtLayout name="dashboard">
    <div ref="pageRef">
      <div class="mb-8">
        <div class="flex items-center gap-2 text-text-700 text-xs mb-2">
          <Icon icon="lucide:home" class="w-3.5 h-3.5" /> <Icon icon="lucide:chevron-right" class="w-3 h-3" />
          <Icon icon="lucide:target" class="w-3.5 h-3.5 text-green-400" /> <span class="text-text-600">Objectifs</span>
        </div>
        <h1 class="text-2xl font-bold text-text">Objectifs & FIRE</h1>
        <p class="text-text-600 mt-1">Définissez vos cibles et suivez votre progression</p>
      </div>

      <!-- FIRE Calculator -->
      <div class="glass-lg p-6 mb-6">
        <h3 class="text-lg font-bold text-text flex items-center gap-2 mb-1">
          <Icon icon="lucide:flame" class="w-5 h-5 text-orange-400" /> Calculateur FIRE
        </h3>
        <p class="text-text-600 text-sm mb-5">Financial Independence, Retire Early</p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Dépenses annuelles (€)</label>
              <input v-model.number="fire.annualExpenses" type="number" min="0" step="1000" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Taux de retrait (%) — règle des 4%</label>
              <input v-model.number="fire.withdrawalRate" type="number" min="1" max="10" step="0.1" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Rendement annuel espéré (%)</label>
              <input v-model.number="fire.expectedReturn" type="number" min="0" max="30" step="0.5" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
          </div>
          <div class="space-y-3">
            <div class="glass p-4">
              <div class="text-text-600 text-xs uppercase tracking-wider mb-1">Capital FIRE nécessaire</div>
              <div class="text-2xl font-bold text-gold">{{ formatCurrency(fireTarget) }}</div>
              <div class="text-xs text-text-700 mt-1">{{ fire.withdrawalRate }}% de retrait annuel</div>
            </div>
            <div class="glass p-4">
              <div class="text-text-600 text-xs uppercase tracking-wider mb-1">Progression</div>
              <div class="text-2xl font-bold text-text">{{ firePercent.toFixed(1) }}%</div>
              <div class="w-full h-2 bg-surface-500 rounded-full mt-2 overflow-hidden">
                <div class="h-full bg-gold rounded-full transition-all duration-1000" :style="{ width: Math.min(firePercent, 100) + '%' }" />
              </div>
            </div>
            <div class="glass p-4">
              <div class="text-text-600 text-xs uppercase tracking-wider mb-1">Années restantes (estimé)</div>
              <div class="text-2xl font-bold text-text">{{ yearsToFire }}</div>
              <div class="text-xs text-text-700 mt-1">Avec {{ fire.expectedReturn }}% de rendement/an</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Goals Grid -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-text flex items-center gap-2">
          <Icon icon="lucide:flag" class="w-5 h-5 text-green-400" /> Mes objectifs
        </h3>
        <button @click="showAddGoal = true" class="flex items-center gap-1.5 text-sm text-gold hover:text-gold-400 transition-colors">
          <Icon icon="lucide:plus" class="w-4 h-4" /> Ajouter
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div v-for="goal in goals" :key="goal.id" class="glass p-5 hover:border-gold/20 transition-all group">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <Icon :icon="goal.icon || 'lucide:target'" class="w-5 h-5" :style="{ color: goal.color || '#C9A84C' }" />
              <h4 class="font-semibold text-text">{{ goal.name }}</h4>
            </div>
            <button @click="deleteGoal(goal.id)" class="text-text-700 hover:text-danger transition-colors opacity-0 group-hover:opacity-100">
              <Icon icon="lucide:x" class="w-4 h-4" />
            </button>
          </div>

          <div class="flex items-end justify-between mb-2">
            <span class="text-lg font-bold text-text tabular-nums">{{ formatCurrency(goal.current) }}</span>
            <span class="text-sm text-text-700 tabular-nums">/ {{ formatCurrency(goal.target) }}</span>
          </div>

          <div class="w-full h-2 bg-surface-500 rounded-full overflow-hidden mb-2">
            <div class="h-full rounded-full transition-all duration-1000" :style="{ width: Math.min(goalPercent(goal), 100) + '%', backgroundColor: goal.color || '#C9A84C' }" />
          </div>
          <div class="flex items-center justify-between text-xs text-text-700">
            <span>{{ goalPercent(goal).toFixed(1) }}%</span>
            <span v-if="goal.deadline">Échéance : {{ formatDate(goal.deadline) }}</span>
          </div>
        </div>
      </div>

      <!-- Net Worth Projection Chart -->
      <div class="glass p-5">
        <h3 class="text-sm font-semibold text-text flex items-center gap-2 mb-4">
          <Icon icon="lucide:chart-line" class="w-4 h-4 text-gold" /> Projection du patrimoine
        </h3>
        <div ref="chartRef" class="flex items-end gap-1 h-40">
          <div v-for="(val, i) in projection" :key="i" class="flex-1 flex flex-col justify-end items-center group relative" :style="{ height: '100%' }">
            <div class="w-full bg-gold/20 group-hover:bg-gold/40 transition-colors rounded-t"
              :style="{ height: Math.min((val / projectionMax) * 100, 100) + '%' }" />
            <span v-if="i % 5 === 0" class="text-[9px] text-text-700 mt-1 absolute -bottom-4">{{ i }}a</span>
          </div>
        </div>
        <div class="mt-6 text-xs text-text-700 text-center">
          Projection sur {{ projection.length }} ans avec {{ fire.expectedReturn }}% de rendement et un apport mensuel moyen de {{ formatCurrency(monthlySavings) }}
        </div>
      </div>

      <!-- Add Goal Modal -->
      <Teleport to="body" v-if="showAddGoal">
        <div class="fixed inset-0 z-[100] flex items-center justify-center p-4" @click.self="showAddGoal = false">
          <div class="absolute inset-0 bg-dark/80 backdrop-blur-sm" />
          <div class="glass-lg w-full max-w-md relative z-10 p-6">
            <h3 class="text-lg font-semibold text-text mb-4">Nouvel objectif</h3>
            <form @submit.prevent="addGoal" class="space-y-3">
              <div><label class="block text-sm text-text-600 mb-1">Nom</label>
                <input v-model="newGoal.name" required placeholder="Ex: 100k€ en PE" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 text-sm" /></div>
              <div class="grid grid-cols-2 gap-3">
                <div><label class="block text-sm text-text-600 mb-1">Montant actuel (€)</label>
                  <input v-model.number="newGoal.current" type="number" min="0" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-gold/40 text-sm" /></div>
                <div><label class="block text-sm text-text-600 mb-1">Objectif (€)</label>
                  <input v-model.number="newGoal.target" type="number" min="0" required class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-gold/40 text-sm" /></div>
              </div>
              <div><label class="block text-sm text-text-600 mb-1">Date d'échéance</label>
                <input v-model="newGoal.deadline" type="date" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-gold/40 text-sm" /></div>
              <div class="flex gap-3 pt-2">
                <button type="button" @click="showAddGoal = false" class="flex-1 py-2.5 border border-surface-500 text-text-600 rounded-lg hover:text-text text-sm">Annuler</button>
                <button type="submit" class="flex-1 py-2.5 bg-gold text-dark font-semibold rounded-lg hover:bg-gold-400 text-sm">Créer</button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'

definePageMeta({ middleware: 'auth', layout: false })

const pageRef = ref<HTMLElement | null>(null)
const chartRef = ref<HTMLElement | null>(null)
const showAddGoal = ref(false)
const goals = ref<any[]>([])
const totalNetWorth = ref(0)

const fire = ref({ annualExpenses: 40000, withdrawalRate: 4, expectedReturn: 7 })

const newGoal = ref({ name: '', current: 0, target: 100000, deadline: '', icon: 'lucide:target', color: '#C9A84C' })

const fireTarget = computed(() => fire.value.annualExpenses / (fire.value.withdrawalRate / 100))
const firePercent = computed(() => totalNetWorth.value > 0 ? (totalNetWorth.value / fireTarget.value) * 100 : 0)
const monthlySavings = computed(() => totalNetWorth.value > 0 ? Math.round(totalNetWorth.value * 0.05 / 12) : 1000)

const yearsToFire = computed(() => {
  if (totalNetWorth.value >= fireTarget.value) return 'FI ! 🎉'
  const r = fire.value.expectedReturn / 100
  const pmt = monthlySavings.value * 12
  if (r === 0) return Math.ceil((fireTarget.value - totalNetWorth.value) / pmt)
  // FV = PV*(1+r)^n + PMT*((1+r)^n - 1)/r
  // Solve for n using log
  const fv = fireTarget.value
  const pv = totalNetWorth.value
  const n = Math.log((fv * r + pmt) / (pv * r + pmt)) / Math.log(1 + r)
  return Math.max(0, Math.round(n))
})

const projection = computed(() => {
  const r = fire.value.expectedReturn / 100
  const pmt = monthlySavings.value * 12
  const years = 30
  const data: number[] = []
  let val = totalNetWorth.value
  for (let i = 0; i <= years; i++) {
    data.push(Math.round(val))
    val = val * (1 + r) + pmt
  }
  return data
})

const projectionMax = computed(() => Math.max(...projection.value, 1))

function goalPercent(goal: any) { return goal.target > 0 ? (goal.current / goal.target) * 100 : 0 }
function formatCurrency(v: number) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v) }
function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('fr-FR') : '' }

async function addGoal() {
  goals.value.push({ ...newGoal.value, id: Date.now() })
  showAddGoal.value = false
  newGoal.value = { name: '', current: 0, target: 100000, deadline: '', icon: 'lucide:target', color: '#C9A84C' }
}
function deleteGoal(id: number) { goals.value = goals.value.filter(g => g.id !== id) }

onMounted(async () => {
  try {
    const inv = await $fetch('/api/investments', { credentials: 'include' }) as any[]
    totalNetWorth.value = inv.reduce((s: number, i: any) => s + Number(i.current_value || 0), 0)

    // Auto-goals from categories
    const byCat: Record<string, number> = {}
    inv.forEach((i: any) => { const k = i.category_name || 'Autre'; byCat[k] = (byCat[k] || 0) + Number(i.current_value || 0) })
    goals.value = Object.entries(byCat).map(([name, val], idx) => ({
      id: idx + 1, name, current: val, target: Math.round(val * 1.5),
      icon: ['lucide:trending-up', 'lucide:bitcoin', 'lucide:building', 'lucide:coins', 'lucide:gem', 'lucide:briefcase', 'lucide:piggy-bank'][idx] || 'lucide:target',
      color: ['#3B82F6', '#F7931A', '#22C55E', '#C9A84C', '#A855F7', '#EC4899', '#14B8A6'][idx] || '#C9A84C',
    }))
  } catch {}

  nextTick(() => { gsap.fromTo(pageRef.value?.children || [], { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out' }) })
})
</script>
