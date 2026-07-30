<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4" @click.self="$emit('close')">
      <div class="absolute inset-0 bg-dark/80 backdrop-blur-sm" />
      <div class="glass-lg w-full max-w-lg max-h-[90vh] overflow-y-auto relative z-10" ref="formRef">
        <div class="flex items-center justify-between p-5 border-b border-surface-500 sticky top-0 bg-surface/95 z-10">
          <h2 class="text-lg font-semibold text-text flex items-center gap-2">
            <Icon icon="lucide:briefcase" class="w-5 h-5 text-pink-400" /> Nouveau deal PE
          </h2>
          <button @click="$emit('close')" class="text-text-600 hover:text-text"><Icon icon="lucide:x" class="w-5 h-5" /></button>
        </div>
        <div v-if="error" class="mx-5 mt-4 bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-3">{{ error }}</div>
        <form @submit.prevent="handleSubmit" class="p-5 space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Nom de l'investissement *</label>
              <input v-model="form.name" required placeholder="Ex: Mistral AI Series B" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Société</label>
              <input v-model="form.company_name" placeholder="Ex: Doctolib" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Stade</label>
              <select v-model="form.stage" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-gold/40 transition-colors text-sm">
                <option value="seed">Seed</option><option value="series_a">Série A</option><option value="series_b">Série B</option>
                <option value="series_c">Série C+</option><option value="growth">Growth</option><option value="pre_ipo">Pré-IPO</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">% Equity</label>
              <div class="relative">
                <input v-model.number="form.equity_pct" type="number" step="0.01" min="0" max="100" placeholder="5.0" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 pr-8 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-text-700 text-sm">%</span>
              </div>
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Secteur</label>
              <select v-model="form.sector" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-gold/40 transition-colors text-sm">
                <option value="saas">SaaS</option><option value="fintech">Fintech</option><option value="deeptech">DeepTech/AI</option>
                <option value="health">HealthTech</option><option value="climate">ClimateTech</option><option value="consumer">Consumer</option>
                <option value="enterprise">Enterprise</option><option value="other">Autre</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Montant investi (€)</label>
              <input v-model.number="form.invested_amount" type="number" step="any" min="0" placeholder="50 000" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Valorisation actuelle (€)</label>
              <input v-model.number="form.current_value" type="number" step="any" min="0" placeholder="200 000" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Prix d'achat total (€)</label>
              <input v-model.number="form.purchase_price" type="number" step="any" min="0" placeholder="50 000" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Date d'investissement</label>
              <input v-model="form.purchase_date" type="date" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-sm text-text-600 mb-1.5">MOIC</label>
              <input v-model.number="form.moic" type="number" step="0.1" min="0" placeholder="2.5" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">IRR (%)</label>
              <div class="relative">
                <input v-model.number="form.irr" type="number" step="0.1" placeholder="25" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 pr-8 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-text-700 text-sm">%</span>
              </div>
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Pipeline</label>
              <select v-model="form.pipeline_status" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-gold/40 transition-colors text-sm">
                <option value="sourcing">Sourcing</option><option value="due_dil">Due Diligence</option>
                <option value="negotiation">Négociation</option><option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Statut de sortie</label>
              <select v-model="form.exit_status" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-gold/40 transition-colors text-sm">
                <option value="active">Actif</option><option value="exited">Sorti (IPO/M&A)</option>
                <option value="written_off">Pertes</option><option value="secondary">Secondary</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Valeur de sortie (€)</label>
              <input v-model.number="form.exit_value" type="number" step="any" min="0" placeholder="500 000" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
          </div>

          <div>
            <label class="block text-sm text-text-600 mb-1.5">Fonds / Véhicule</label>
            <input v-model="form.fund_name" placeholder="Holding perso, FCPI..." class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
          </div>
          <div>
            <label class="block text-sm text-text-600 mb-1.5">Co-investisseurs</label>
            <textarea v-model="form.co_investors" rows="2" placeholder="Business Angels, VCs..." class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm resize-none" />
          </div>
          <div>
            <label class="block text-sm text-text-600 mb-1.5">Description / Thèse d'investissement</label>
            <textarea v-model="form.description" rows="3" placeholder="Pourquoi ce deal ? Marché, équipe, traction..." class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm resize-none" />
          </div>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="$emit('close')" class="flex-1 py-2.5 border border-surface-500 text-text-600 rounded-lg hover:text-text text-sm">Annuler</button>
            <button type="submit" :disabled="submitting" class="flex-1 py-2.5 bg-gold text-dark font-semibold rounded-lg hover:bg-gold-400 text-sm disabled:opacity-50">
              {{ submitting ? 'Création...' : 'Ajouter le deal' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'

const emit = defineEmits(['close'])
const formRef = ref<HTMLElement | null>(null)
const error = ref('')
const submitting = ref(false)

const form = ref({
  name: '', company_name: '', stage: 'seed', sector: 'saas',
  equity_pct: 0, invested_amount: 0, current_value: 0,
  purchase_price: 0, purchase_date: new Date().toISOString().split('T')[0],
  moic: 0, irr: 0, pipeline_status: 'closed', exit_status: 'active', exit_value: 0,
  fund_name: '', co_investors: '', description: '', type: 'financial',
  category_id: null as number | null,
})

onMounted(async () => {
  try {
    const cats = await $fetch('/api/categories', { credentials: 'include' }) as any[]
    const peCat = cats.find((c: any) => c.slug === 'private-equity')
    if (peCat) form.value.category_id = peCat.id
  } catch {}
  nextTick(() => { gsap.fromTo(formRef.value, { autoAlpha: 0, y: 16, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'power3.out' }) })
})

async function handleSubmit() {
  error.value = ''; submitting.value = true
  try {
    await $fetch('/api/investments', { method: 'POST', body: form.value, credentials: 'include' })
    emit('close')
  } catch (e: any) { error.value = e.statusMessage || 'Erreur' }
  finally { submitting.value = false }
}
</script>
