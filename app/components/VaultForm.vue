<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4" @click.self="$emit('close')">
      <div class="absolute inset-0 bg-dark/80 backdrop-blur-sm" />
      <div class="glass-lg w-full max-w-xl max-h-[90vh] overflow-y-auto relative z-10" ref="formRef">
        <div class="flex items-center justify-between p-5 border-b border-surface-500 sticky top-0 bg-surface/95 backdrop-blur-sm z-10">
          <h2 class="text-lg font-semibold text-text flex items-center gap-2">
            <Icon icon="lucide:plus-circle" class="w-5 h-5 text-gold" />
            {{ editData ? 'Modifier' : 'Ajouter un objet' }}
          </h2>
          <button @click="$emit('close')" class="text-text-600 hover:text-text transition-colors"><Icon icon="lucide:x" class="w-5 h-5" /></button>
        </div>

        <div v-if="error" class="mx-5 mt-4 bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-3">{{ error }}</div>

        <form @submit.prevent="handleSubmit" class="p-5 space-y-4">
          <!-- Name + Category -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Nom *</label>
              <input v-model="form.name" required placeholder="Rolex Submariner, Picasso..."
                class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Catégorie</label>
              <select v-model="form.category" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-gold/40 transition-colors text-sm">
                <option v-for="cat in categories" :key="cat.slug" :value="cat.slug">{{ cat.name }}</option>
              </select>
            </div>
          </div>

          <!-- Values -->
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Prix d'achat (€)</label>
              <input v-model.number="form.acquisition_price" type="number" min="0" step="any" placeholder="5 000"
                class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Valeur actuelle (€)</label>
              <input v-model.number="form.current_value" type="number" min="0" step="any" placeholder="8 000"
                class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Valeur assurée (€)</label>
              <input v-model.number="form.insured_value" type="number" min="0" step="any" placeholder="10 000"
                class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
          </div>

          <!-- Location + Condition + Date -->
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-sm text-text-600 mb-1.5 flex items-center gap-1">
                <Icon icon="lucide:map-pin" class="w-3.5 h-3.5" /> Localisation
              </label>
              <input v-model="form.location" placeholder="Coffre banque, Salon..."
                class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">État</label>
              <select v-model="form.condition" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-gold/40 transition-colors text-sm">
                <option value="excellent">Excellent</option>
                <option value="good">Bon</option>
                <option value="fair">Moyen</option>
                <option value="poor">À restaurer</option>
              </select>
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Date d'acquisition</label>
              <input v-model="form.acquisition_date" type="date"
                class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
          </div>

          <!-- Serial + Dimensions + Weight -->
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block text-sm text-text-600 mb-1.5">N° de série</label>
              <input v-model="form.serial_number" placeholder="ABC-12345"
                class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Dimensions</label>
              <input v-model="form.dimensions" placeholder="40 x 30 cm"
                class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
            <div>
              <label class="block text-sm text-text-600 mb-1.5">Poids</label>
              <input v-model="form.weight" placeholder="150 g"
                class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
            </div>
          </div>

          <!-- Images upload -->
          <div>
            <label class="block text-sm text-text-600 mb-1.5 flex items-center gap-1.5">
              <Icon icon="lucide:camera" class="w-3.5 h-3.5" /> Photos
            </label>
            <div class="grid grid-cols-4 gap-2 mb-2" v-if="previews.length > 0">
              <div v-for="(url, i) in previews" :key="i" class="relative aspect-square rounded-lg overflow-hidden bg-surface-500">
                <img :src="url" class="w-full h-full object-cover" />
                <button @click="removePreview(i)" class="absolute top-1 right-1 w-5 h-5 rounded-full bg-dark/80 flex items-center justify-center hover:bg-red-500 transition-colors">
                  <Icon icon="lucide:x" class="w-3 h-3 text-white" />
                </button>
              </div>
            </div>
            <div @click="fileInput?.click()" @dragover.prevent @drop.prevent="onDrop"
              class="border-2 border-dashed border-surface-500 rounded-lg p-6 text-center hover:border-gold/30 transition-colors cursor-pointer">
              <Icon icon="lucide:upload" class="w-6 h-6 text-text-700 mx-auto mb-1.5" />
              <p class="text-text-700 text-xs">Glissez des photos ou cliquez</p>
              <p class="text-text-700 text-[10px] mt-0.5">JPG, PNG, WebP — max 5MB</p>
            </div>
            <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" multiple class="hidden" @change="onFileChange" />
            <div v-if="uploading" class="text-xs text-text-700 mt-1.5 flex items-center gap-1.5">
              <Icon icon="lucide:loader" class="w-3 h-3 animate-spin" /> Upload en cours...
            </div>
          </div>

          <!-- Description + Notes -->
          <div>
            <label class="block text-sm text-text-600 mb-1.5">Description</label>
            <textarea v-model="form.description" rows="2" placeholder="Description détaillée de l'objet..."
              class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm resize-none" />
          </div>
          <div>
            <label class="block text-sm text-text-600 mb-1.5">Notes</label>
            <textarea v-model="form.notes" rows="2" placeholder="Notes personnelles, historique..."
              class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm resize-none" />
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <button type="button" @click="$emit('close')" class="flex-1 py-2.5 border border-surface-500 text-text-600 rounded-lg hover:text-text transition-colors text-sm">Annuler</button>
            <button type="submit" :disabled="submitting" class="flex-1 py-2.5 bg-gold text-dark font-semibold rounded-lg hover:bg-gold-400 transition-colors text-sm disabled:opacity-50">
              {{ submitting ? 'Création...' : (editData ? 'Modifier' : 'Ajouter au coffre') }}
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
const props = defineProps<{ editData?: any }>()

const formRef = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const error = ref('')
const submitting = ref(false)
const uploading = ref(false)
const uploadFiles = ref<File[]>([])
const previews = ref<string[]>([])

const categories = [
  { name: 'Montres', slug: 'watches' }, { name: 'Art', slug: 'art' },
  { name: 'Vins', slug: 'wine' }, { name: 'Voitures', slug: 'cars' },
  { name: 'Bijoux', slug: 'jewelry' }, { name: 'Mobilier', slug: 'furniture' },
  { name: 'Livres', slug: 'books' }, { name: 'Sneakers', slug: 'sneakers' },
  { name: 'Cartes', slug: 'cards' }, { name: 'Autre', slug: 'other' },
]

const form = ref({
  name: props.editData?.name || '',
  category: props.editData?.category || 'other',
  description: props.editData?.description || '',
  acquisition_date: props.editData?.acquisition_date || '',
  acquisition_price: props.editData?.acquisition_price || 0,
  current_value: props.editData?.current_value || 0,
  insured_value: props.editData?.insured_value || 0,
  location: props.editData?.location || '',
  condition: props.editData?.condition || 'excellent',
  serial_number: props.editData?.serial_number || '',
  dimensions: props.editData?.dimensions || '',
  weight: props.editData?.weight || '',
  notes: props.editData?.notes || '',
})

function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files) { addFiles(Array.from(files)) }
}
function onDrop(e: DragEvent) {
  const files = e.dataTransfer?.files
  if (files) { addFiles(Array.from(files)) }
}
function addFiles(files: File[]) {
  for (const f of files) {
    if (f.type.startsWith('image/')) {
      uploadFiles.value.push(f)
      previews.value.push(URL.createObjectURL(f))
    }
  }
}
function removePreview(i: number) {
  uploadFiles.value.splice(i, 1)
  previews.value.splice(i, 1)
}

async function handleSubmit() {
  error.value = ''
  submitting.value = true
  try {
    const res = await $fetch('/api/vault/items', {
      method: 'POST', body: form.value, credentials: 'include'
    }) as any

    // Upload images
    if (uploadFiles.value.length > 0 && res.item) {
      uploading.value = true
      const data = new FormData()
      for (const f of uploadFiles.value) data.append('files', f)
      await $fetch(`/api/vault/items/${res.item.id}/images`, {
        method: 'POST', body: data, credentials: 'include'
      })
      uploading.value = false
    }

    emit('close')
  } catch (e: any) {
    error.value = e.statusMessage || 'Erreur'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  nextTick(() => {
    gsap.fromTo(formRef.value, { autoAlpha: 0, y: 16, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'power3.out' })
  })
})
</script>
