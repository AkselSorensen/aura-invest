<template>
  <div class="min-h-screen bg-dark flex">
    <!-- Admin sidebar -->
    <aside class="w-60 h-screen fixed left-0 top-0 bg-surface border-r border-surface-500 flex flex-col z-50">
      <div class="h-16 flex items-center px-4 border-b border-surface-500 shrink-0">
        <Icon icon="lucide:sparkles" class="w-6 h-6 text-gold shrink-0" />
        <span class="ml-2.5 text-lg font-bold text-text">Aura<span class="text-gold">Invest</span></span>
        <span class="ml-2 text-xs px-1.5 py-0.5 bg-gold/20 text-gold rounded">Admin</span>
      </div>
      <nav class="flex-1 py-4 px-2 space-y-1">
        <NuxtLink to="/admin" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
          :class="$route.path === '/admin' ? 'text-gold bg-gold/10' : 'text-text-600 hover:bg-surface-500 hover:text-text'">
          <Icon icon="lucide:layout-dashboard" class="w-5 h-5" />
          Dashboard
        </NuxtLink>
        <NuxtLink to="/admin/categories" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
          :class="$route.path === '/admin/categories' ? 'text-gold bg-gold/10' : 'text-text-600 hover:bg-surface-500 hover:text-text'">
          <Icon icon="lucide:layers" class="w-5 h-5" />
          Catégories
        </NuxtLink>
        <NuxtLink to="/admin/users" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
          :class="$route.path === '/admin/users' ? 'text-gold bg-gold/10' : 'text-text-600 hover:bg-surface-500 hover:text-text'">
          <Icon icon="lucide:users" class="w-5 h-5" />
          Utilisateurs
        </NuxtLink>
      </nav>
      <div class="p-2 border-t border-surface-500">
        <NuxtLink to="/dashboard" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-600 hover:bg-surface-500 hover:text-text transition-colors text-sm">
          <Icon icon="lucide:arrow-left" class="w-5 h-5" />
          Retour au site
        </NuxtLink>
      </div>
    </aside>

    <!-- Content -->
    <div class="ml-60 flex-1 p-6">
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'admin' })
</script>
