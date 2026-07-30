<template>
  <NuxtLayout name="admin">
    <div ref="pageRef">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold text-text">Catégories</h1>
        <button @click="showAdd = true" class="flex items-center gap-2 px-4 py-2.5 bg-gold text-dark font-semibold rounded-lg hover:bg-gold-400 transition-colors text-sm">
          <Icon icon="lucide:plus" class="w-4 h-4" />
          Ajouter
        </button>
      </div>

      <div class="glass p-5">
        <div class="space-y-2">
          <div v-for="cat in categories" :key="cat.id" class="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-500 transition-colors">
            <Icon :icon="cat.icon" class="w-5 h-5" :style="{ color: cat.color }" />
            <span class="text-text flex-1">{{ cat.name }}</span>
            <span class="text-xs text-text-700">{{ cat.slug }}</span>
            <button @click="editingCat = cat; showEdit = true" class="text-text-600 hover:text-text transition-colors">
              <Icon icon="lucide:pencil" class="w-4 h-4" />
            </button>
            <button @click="deleteCategory(cat.id)" class="text-text-600 hover:text-danger transition-colors">
              <Icon icon="lucide:trash-2" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Add/Edit modal -->
      <Teleport to="body">
        <div v-if="showAdd || showEdit" class="fixed inset-0 z-[100] flex items-center justify-center p-4" @click.self="closeModal">
          <div class="absolute inset-0 bg-dark/80 backdrop-blur-sm" />
          <div class="glass-lg w-full max-w-md relative z-10 p-6">
            <h2 class="text-lg font-semibold text-text mb-4">{{ showEdit ? 'Modifier' : 'Ajouter' }} une catégorie</h2>
            <form @submit.prevent="saveCategory" class="space-y-4">
              <div>
                <label class="block text-sm text-text-600 mb-1.5">Nom</label>
                <input v-model="form.name" required class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-gold/40 transition-colors text-sm" />
              </div>
              <div>
                <label class="block text-sm text-text-600 mb-1.5">Slug</label>
                <input v-model="form.slug" required class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-gold/40 transition-colors text-sm" />
              </div>
              <div>
                <label class="block text-sm text-text-600 mb-1.5">Icône Lucide</label>
                <input v-model="form.icon" placeholder="lucide:folder" class="w-full bg-surface-600 border border-surface-500 rounded-lg px-4 py-2.5 text-text placeholder-text-700 focus:outline-none focus:border-gold/40 transition-colors text-sm" />
              </div>
              <div>
                <label class="block text-sm text-text-600 mb-1.5">Couleur</label>
                <input v-model="form.color" type="color" class="w-12 h-10 rounded cursor-pointer" />
              </div>
              <div class="flex gap-3 pt-2">
                <button type="button" @click="closeModal" class="flex-1 py-2.5 border border-surface-500 text-text-600 rounded-lg hover:text-text transition-colors text-sm">Annuler</button>
                <button type="submit" class="flex-1 py-2.5 bg-gold text-dark font-semibold rounded-lg hover:bg-gold-400 transition-colors text-sm">
                  {{ showEdit ? 'Modifier' : 'Ajouter' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({ middleware: 'admin', layout: false })

const categories = ref<any[]>([])
const showAdd = ref(false)
const showEdit = ref(false)
const editingCat = ref<any>(null)
const form = ref({ name: '', slug: '', icon: 'lucide:folder', color: '#C9A84C' })

async function loadCategories() {
  try {
    categories.value = await $fetch('/api/categories', { credentials: 'include' }) as any[]
  } catch {}
}

function closeModal() {
  showAdd.value = false
  showEdit.value = false
  editingCat.value = null
  form.value = { name: '', slug: '', icon: 'lucide:folder', color: '#C9A84C' }
}

async function saveCategory() {
  try {
    if (showEdit.value && editingCat.value) {
      await $fetch(`/api/admin/categories`, { method: 'PUT', body: { ...form.value, id: editingCat.value.id }, credentials: 'include' })
    } else {
      await $fetch('/api/admin/categories', { method: 'POST', body: form.value, credentials: 'include' })
    }
    closeModal()
    await loadCategories()
  } catch {}
}

async function deleteCategory(id: number) {
  if (!confirm('Supprimer cette catégorie ?')) return
  await $fetch(`/api/admin/categories`, { method: 'DELETE', body: { id }, credentials: 'include' })
  await loadCategories()
}

onMounted(async () => {
  await loadCategories()
  if (showEdit.value && editingCat.value) {
    form.value = { name: editingCat.value.name, slug: editingCat.value.slug, icon: editingCat.value.icon, color: editingCat.value.color }
  }
})

// Watch for edit click
watch([showEdit], () => {
  if (showEdit.value && editingCat.value) {
    form.value = {
      name: editingCat.value.name,
      slug: editingCat.value.slug,
      icon: editingCat.value.icon,
      color: editingCat.value.color
    }
  }
})
</script>
