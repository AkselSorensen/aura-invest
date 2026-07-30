<template>
  <div class="min-h-screen bg-dark">
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <InstallPWA />
  </div>
</template>

<script setup lang="ts">
if (import.meta.client && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(reg => {
    if (reg.active && reg.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  })
}
</script>
