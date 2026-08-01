<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4" @click.self="$emit('close')">
      <div class="absolute inset-0 bg-dark/80 backdrop-blur-sm" />
      <div class="glass-lg w-full max-w-xl max-h-[90vh] overflow-y-auto relative z-10" ref="formRef">
        <div class="flex items-center justify-between p-5 border-b border-surface-500 sticky top-0 bg-surface/95 backdrop-blur-sm z-10">
          <h2 class="text-lg font-semibold text-text flex items-center gap-2">
            <Icon icon="lucide:plus-circle" class="w-5 h-5 text-gold" />
            {{ editData ? 'Modifier' : 'Ajouter un investissement' }}
          </h2>
          <button @click="$emit('close')" class="text-text-600 hover:text-text transition-colors"><Icon icon="lucide:x" class="w-5 h-5" /></button>
        </div>

        <div v-if="error" class="mx-5 mt-4 bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-3">{{ error }}</div>

        <form @submit.prevent="handleSubmit" class="p-5 space-y-4">
          <!-- Nom + Catégorie -->
          <div class="grid grid-cols-2 gap-3">
            <div class="relative">
              <label class="block text-sm text-text-600 mb-1.5">Nom *</label>
              <input v-model="form.name" required placeholder="Apple, Appartement Paris, Bitcoin..."
                class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm"
                @input="onNameInput" />
              <!-- Autocomplete dropdown -->
              <div v-if="showAutocomplete && searchResults.length > 0" class="absolute top-full left-0 right-0 z-50 mt-1 bg-surface-600 border border-surface-500 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                <button v-for="r in searchResults" :key="r.symbol" type="button"
                  @click="selectStock(r)"
                  class="w-full text-left px-4 py-2.5 hover:bg-surface-500 transition-colors flex items-center justify-between text-sm border-b border-surface-500 last:border-0">
                  <div class="min-w-0 flex-1">
                    <div class="text-text font-medium truncate">{{ r.name }}</div>
                    <div class="flex items-center gap-2 text-xs text-text-700 mt-0.5">
                      <span>{{ r.symbol }} · {{ r.exchange }}</span>
                      <span v-if="r.isin" class="text-text-700/60">{{ r.isin }}</span>
                      <span v-if="r.dividendYield" class="text-green-400 font-medium">Rend. {{ r.dividendYield.toFixed(2) }}%</span>
                    </div>
                  </div>
                  <div class="text-right shrink-0 ml-3">
                    <div v-if="r.price" class="text-text text-sm">{{ r.price.toFixed(2) }} {{ r.currency }}</div>
                    <div v-if="r.changePercent" class="text-xs" :class="r.changePercent >= 0 ? 'text-green-400' : 'text-red-400'">{{ r.changePercent >= 0 ? '+' : '' }}{{ r.changePercent.toFixed(2) }}%</div>
                  </div>
                </button>
              </div>
              <div v-if="searching" class="absolute top-full left-0 right-0 z-50 mt-1 bg-surface-600 border border-surface-500 rounded-lg p-3 text-center text-text-700 text-xs">
                <Icon icon="lucide:loader" class="w-3 h-3 animate-spin inline mr-1" /> Recherche...
              </div>
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Catégorie</label>
              <select v-model="form.category_id" @change="onCategoryChange"
                class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-gold/40 transition-colors text-sm">
                <option :value="null">Sélectionner...</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
          </div>

          <!-- Type -->
          <div>
            <label class="block text-sm text-text-600 mb-1.5">Type</label>
            <div class="flex gap-2">
              <button type="button" @click="form.type = 'financial'" class="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                :class="form.type === 'financial' ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-surface-600 text-text-600 border border-surface-500'">
                <Icon icon="lucide:bar-chart-3" class="w-4 h-4" /> Financier
              </button>
              <button type="button" @click="form.type = 'physical'" class="flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                :class="form.type === 'physical' ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-surface-600 text-text-600 border border-surface-500'">
                <Icon icon="lucide:box" class="w-4 h-4" /> Physique
              </button>
            </div>
          </div>

          <!-- Quantité, Date, Prix, Valeur -->
          <div class="grid grid-cols-2 gap-3">
            <div><label class="block text-sm text-text-600 mb-1.5">Quantité</label>
              <input v-model.number="form.quantity" type="number" step="any" min="0" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-gold/40 transition-colors text-sm" /></div>
            <div><label class="block text-sm text-text-600 mb-1.5">Date d'achat</label>
              <input v-model="form.purchase_date" type="date" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-gold/40 transition-colors text-sm" /></div>
            <div><label class="block text-sm text-text-600 mb-1.5">Prix d'achat (€)</label>
              <input v-model.number="form.purchase_price" type="number" step="any" min="0" placeholder="0" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" /></div>
            <div><label class="block text-sm text-text-600 mb-1.5">Valeur actuelle (€)</label>
              <input v-model.number="form.current_value" type="number" step="any" min="0" placeholder="0" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" /></div>
          </div>

          <!-- ═══ DYNAMIC METADATA FIELDS ═══ -->
          <div v-if="activeSchema && activeSchema.fields.length > 0" class="border-t border-surface-500 pt-4 mt-2">
            <h3 class="text-sm font-semibold text-text mb-3 flex items-center gap-2">
              <Icon :icon="activeSchema.icon" class="w-4 h-4" :style="{ color: activeSchema.color }" />
              Détails {{ activeSchema.name }}
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <template v-for="field in activeSchema.fields" :key="field.key">
                <!-- Text -->
                <div v-if="field.type === 'text'" :class="field.colSpan === 2 ? 'col-span-2' : ''">
                  <label class="block text-sm text-text-600 mb-1.5">{{ field.label }}{{ field.required ? ' *' : '' }}</label>
                  <input v-model="metadata[field.key]" :placeholder="field.placeholder" :required="field.required"
                    class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
                  <p v-if="field.hint" class="text-text-700 text-[10px] mt-0.5">{{ field.hint }}</p>
                </div>

                <!-- Select -->
                <div v-else-if="field.type === 'select'" :class="field.colSpan === 2 ? 'col-span-2' : ''">
                  <label class="block text-sm text-text-600 mb-1.5">{{ field.label }}{{ field.required ? ' *' : '' }}</label>
                  <select v-model="metadata[field.key]" :required="field.required"
                    class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-gold/40 transition-colors text-sm">
                    <option value="">--</option>
                    <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                </div>

                <!-- Number -->
                <div v-else-if="field.type === 'number'">
                  <label class="block text-sm text-text-600 mb-1.5">{{ field.label }}</label>
                  <input v-model.number="metadata[field.key]" type="number" step="any" :placeholder="field.placeholder"
                    class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
                  <p v-if="field.hint" class="text-text-700 text-[10px] mt-0.5">{{ field.hint }}</p>
                </div>

                <!-- Currency -->
                <div v-else-if="field.type === 'currency'">
                  <label class="block text-sm text-text-600 mb-1.5">{{ field.label }}</label>
                  <input v-model.number="metadata[field.key]" type="number" step="any" min="0" :placeholder="field.placeholder"
                    class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
                </div>

                <!-- Percent -->
                <div v-else-if="field.type === 'percent'">
                  <label class="block text-sm text-text-600 mb-1.5">{{ field.label }}</label>
                  <div class="relative">
                    <input v-model.number="metadata[field.key]" type="number" step="0.1" :placeholder="field.placeholder"
                      class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 pr-10 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-text-700 text-sm">%</span>
                  </div>
                  <p v-if="field.hint" class="text-text-700 text-[10px] mt-0.5">{{ field.hint }}</p>
                </div>

                <!-- Date -->
                <div v-else-if="field.type === 'date'">
                  <label class="block text-sm text-text-600 mb-1.5">{{ field.label }}</label>
                  <input v-model="metadata[field.key]" type="date"
                    class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-gold/40 transition-colors text-sm" />
                </div>

                <!-- Textarea -->
                <div v-else-if="field.type === 'textarea'" :class="field.colSpan === 2 ? 'col-span-2' : ''">
                  <label class="block text-sm text-text-600 mb-1.5">{{ field.label }}</label>
                  <textarea v-model="metadata[field.key]" :placeholder="field.placeholder" rows="2"
                    class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm resize-none" />
                </div>
              </template>
            </div>
          </div>

          <!-- Image upload (physical) -->
          <div v-if="form.type === 'physical'">
            <label class="block text-sm text-text-600 mb-1.5">Image</label>
            <div @click="fileInput?.click()" @dragover.prevent @drop.prevent="onDrop"
              class="border-2 border-dashed border-surface-500 rounded-lg p-6 text-center hover:border-gold/30 transition-colors cursor-pointer">
              <img v-if="previewUrl" :src="previewUrl" class="max-h-32 mx-auto mb-2 rounded-lg" />
              <Icon v-else icon="lucide:upload" class="w-8 h-8 text-text-700 mx-auto mb-2" />
              <p class="text-text-700 text-xs">{{ uploading ? 'Upload en cours...' : 'Glissez une image ou cliquez' }}</p>
            </div>
            <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="onFileChange" />
          </div>

          <!-- Description + Notes -->
          <div><label class="block text-sm text-text-600 mb-1.5">Description</label>
            <textarea v-model="form.description" rows="2" placeholder="Brève description..." class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm resize-none" /></div>
          <div><label class="block text-sm text-text-600 mb-1.5">Notes</label>
            <textarea v-model="form.notes" rows="2" placeholder="Notes personnelles..." class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm resize-none" /></div>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="$emit('close')" class="flex-1 py-2.5 border border-surface-500 text-text-600 rounded-lg hover:text-text transition-colors text-sm">Annuler</button>
            <button type="submit" :disabled="submitting" class="flex-1 py-2.5 bg-gold text-dark font-semibold rounded-lg hover:bg-gold-400 transition-colors text-sm disabled:opacity-50">
              {{ submitting ? 'Création...' : (editData ? 'Modifier' : 'Créer') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { gsap } from 'gsap'
import { CATEGORY_SCHEMAS, getDefaultMetadata } from '~/data/categorySchemas'

const emit = defineEmits(['close'])
const props = defineProps<{ editData?: any }>()

const formRef = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const categories = ref<any[]>([])
const uploadFiles = ref<File[]>([])
const previewUrl = ref<string | null>(null)
const uploading = ref(false)
const submitting = ref(false)
const error = ref('')
const metadata = ref<Record<string, any>>({})
const searchResults = ref<any[]>([])
const showAutocomplete = ref(false)
const searching = ref(false)
let searchTimer: any = null

const form = ref({
  name: props.editData?.name || '',
  category_id: props.editData?.category_id || null,
  type: props.editData?.type || 'financial',
  quantity: props.editData?.quantity || 1,
  purchase_price: props.editData?.purchase_price || 0,
  current_value: props.editData?.current_value || 0,
  purchase_date: props.editData?.purchase_date || new Date().toISOString().split('T')[0],
  description: props.editData?.description || '',
  notes: props.editData?.notes || '',
  image_url: props.editData?.image_url || null,
})

const activeCategorySlug = ref<string | null>(null)
const activeSchema = computed(() => {
  if (!activeCategorySlug.value) return null
  return CATEGORY_SCHEMAS[activeCategorySlug.value] || null
})

function onNameInput() {
  const val = form.value.name?.trim()
  if (!val || val.length < 2) { showAutocomplete.value = false; return }
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    searching.value = true
    try {
      const res = await $fetch(`/api/search/stock?q=${encodeURIComponent(val)}`)
      searchResults.value = (res as any).results || []
      showAutocomplete.value = searchResults.value.length > 0
    } catch { searchResults.value = [] }
    finally { searching.value = false }
  }, 300)
}

function selectStock(r: any) {
  form.value.name = r.name
  showAutocomplete.value = false
  if (r.price) form.value.current_value = (r.price * (form.value.quantity || 1))
  metadata.value = {
    ...metadata.value,
    ticker: r.symbol,
    isin: r.isin || metadata.value.isin || '',
    market: r.exchange,
    dividend_yield: r.dividendYield || metadata.value.dividend_yield || null,
    current_price: r.price,
  }
}

function onCategoryChange() {
  const cat = categories.value.find(c => c.id === parseInt(String(form.value.category_id)))
  activeCategorySlug.value = cat?.slug || null
  if (activeCategorySlug.value) {
    // Merge existing metadata into new defaults
    const defaults = getDefaultMetadata(activeCategorySlug.value)
    const existing = props.editData?.metadata || {}
    metadata.value = { ...defaults, ...existing }
  } else {
    metadata.value = {}
  }
}

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files && files[0]) { uploadFiles.value = [files[0]]; previewUrl.value = URL.createObjectURL(files[0]) }
}
function onDrop(e: DragEvent) {
  const files = e.dataTransfer?.files
  if (files && files[0]) { uploadFiles.value = [files[0]]; previewUrl.value = URL.createObjectURL(files[0]) }
}

async function handleSubmit() {
  error.value = ''
  submitting.value = true
  try {
    let imageUrl = form.value.image_url
    if (uploadFiles.value.length > 0) {
      uploading.value = true
      const data = new FormData(); data.append('file', uploadFiles.value[0])
      const uploadRes = await $fetch('/api/upload', { method: 'POST', body: data, credentials: 'include' }) as any
      imageUrl = uploadRes.url; uploading.value = false
    }

    const payload = { ...form.value, image_url: imageUrl, metadata: metadata.value }
    const method = props.editData ? 'PUT' : 'POST'
    const url = props.editData ? `/api/investments/${props.editData.id}` : '/api/investments'
    await $fetch(url, { method, body: payload, credentials: 'include' })
    emit('close')
  } catch (e: any) { error.value = e.statusMessage || 'Erreur' }
  finally { submitting.value = false }
}

onMounted(async () => {
  try { categories.value = await $fetch('/api/categories', { credentials: 'include' }) as any[] } catch {}

  // Init from edit data
  if (props.editData) {
    const cat = categories.value.find(c => c.id === parseInt(String(props.editData!.category_id)))
    activeCategorySlug.value = cat?.slug || null
    metadata.value = props.editData.metadata || {}
    if (props.editData.image_url) previewUrl.value = props.editData.image_url
  }

  nextTick(() => {
    gsap.fromTo(formRef.value, { autoAlpha: 0, y: 16, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'power3.out' })
  })
})
</script>
