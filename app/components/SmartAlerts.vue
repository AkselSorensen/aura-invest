<template>
  <div class="glass p-5">
    <h3 class="text-sm font-semibold text-text flex items-center gap-2 mb-4">
      <Icon icon="lucide:zap" class="w-4 h-4 text-gold" /> Alertes intelligentes
    </h3>
    <div v-if="alerts.length === 0" class="text-center py-4 text-text-700 text-xs">
      <Icon icon="lucide:check-circle" class="w-4 h-4 mx-auto mb-1 opacity-30" /> Tout va bien
    </div>
    <div v-else class="space-y-2">
      <div v-for="(alert, i) in alerts" :key="i"
        class="flex items-start gap-2.5 p-3 rounded-lg"
        :class="alert.type === 'positive' ? 'bg-green-500/10 border border-green-500/20' : alert.type === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-blue-500/10 border border-blue-500/20'">
        <Icon :icon="alert.icon" class="w-4 h-4 shrink-0 mt-0.5" :class="alert.color" />
        <div>
          <div class="text-sm text-text">{{ alert.message }}</div>
          <div class="text-[10px] text-text-700 mt-0.5">{{ alert.time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{ investments: any[] }>()
const alerts = ref<any[]>([])

onMounted(() => {
  const now = new Date()
  const list: any[] = []

  // Check top gainers
  const gainers = props.investments
    .map(i => ({ ...i, gain: Number(i.current_value) - Number(i.purchase_price), gainPct: Number(i.purchase_price) > 0 ? ((Number(i.current_value) - Number(i.purchase_price)) / Number(i.purchase_price)) * 100 : 0 }))
    .filter(i => i.gainPct > 10)
    .sort((a, b) => b.gainPct - a.gainPct)

  if (gainers.length > 0) {
    list.push({
      type: 'positive', icon: 'lucide:trending-up', color: 'text-green-400',
      message: `${gainers[0].name} a pris +${gainers[0].gainPct.toFixed(0)}% ! Pensez à prendre vos profits si nécessaire.`,
      time: 'À l\'instant'
    })
  }

  // Check losers
  const losers = props.investments
    .map(i => ({ ...i, loss: Number(i.purchase_price) - Number(i.current_value), lossPct: Number(i.purchase_price) > 0 ? ((Number(i.purchase_price) - Number(i.current_value)) / Number(i.purchase_price)) * 100 : 0 }))
    .filter(i => i.lossPct > 20)
    .sort((a, b) => b.lossPct - a.lossPct)

  if (losers.length > 0) {
    list.push({
      type: 'warning', icon: 'lucide:alert-triangle', color: 'text-yellow-400',
      message: `Attention : ${losers[0].name} est en baisse de -${losers[0].lossPct.toFixed(0)}%`,
      time: 'À l\'instant'
    })
  }

  // Diversification check
  const catCount = new Set(props.investments.map(i => i.category_slug).filter(Boolean)).size
  if (catCount < 2 && props.investments.length >= 3) {
    list.push({
      type: 'info', icon: 'lucide:layers', color: 'text-blue-400',
      message: `Vous êtes concentré sur ${catCount} catégorie(s). Diversifiez votre portefeuille !`,
      time: 'À l\'instant'
    })
  }

  alerts.value = list
})
</script>
