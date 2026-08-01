<template>
  <div class="min-h-screen bg-dark flex">
    <Sidebar :collapsed="collapsed" @toggle="collapsed = !collapsed" />
    <div class="flex-1 flex flex-col min-h-screen" :class="collapsed ? 'ml-16' : 'ml-60'">
      <TopBar @toggle="collapsed = !collapsed" />
      <main class="flex-1 p-6 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const collapsed = ref(false)
</script>
