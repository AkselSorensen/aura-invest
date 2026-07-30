<template>
  <button @click="exportPDF" :disabled="generating" class="flex items-center gap-1.5 text-sm text-gold hover:text-gold-400 transition-colors disabled:opacity-50">
    <Icon icon="lucide:download" class="w-4 h-4" />
    {{ generating ? 'Génération...' : 'Exporter PDF' }}
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ investments: any[] }>()
const generating = ref(false)

async function exportPDF() {
  generating.value = true
  try {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    // Title
    doc.setFontSize(22)
    doc.setTextColor(201, 168, 76)
    doc.text('AuraInvest', 20, 25)
    doc.setFontSize(12)
    doc.setTextColor(100, 100, 100)
    doc.text('Rapport Patrimonial', 20, 33)

    // Summary
    const total = props.investments.reduce((s, i) => s + Number(i.current_value || 0), 0)
    const cost = props.investments.reduce((s, i) => s + Number(i.purchase_price || 0), 0)
    const gain = total - cost

    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    doc.text(`Patrimoine total : ${formatEuro(total)}`, 20, 48)
    doc.text(`Plus-value latente : ${formatEuro(gain)}`, 20, 55)
    doc.text(`Nombre d'investissements : ${props.investments.length}`, 20, 62)
    doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 20, 69)

    // Line
    doc.setDrawColor(40, 40, 50)
    doc.line(20, 75, 190, 75)

    // Table
    let y = 85
    doc.setFontSize(9)
    doc.setTextColor(201, 168, 76)
    doc.text('Nom', 20, y)
    doc.text('Catégorie', 90, y)
    doc.text('Valeur', 140, y)
    doc.text('+/- Value', 170, y)
    y += 7

    doc.setTextColor(220, 220, 230)
    for (const inv of props.investments) {
      if (y > 270) { doc.addPage(); y = 25 }
      const name = (inv.name || '').substring(0, 30)
      const cat = (inv.category_name || '').substring(0, 15)
      const val = formatEuro(Number(inv.current_value || 0))
      const pnl = Number(inv.current_value || 0) - Number(inv.purchase_price || 0)
      doc.text(name, 20, y)
      doc.text(cat, 90, y)
      doc.text(val, 140, y)
      doc.setTextColor(pnl >= 0 ? 34 : 239, pnl >= 0 ? 197 : 68, pnl >= 0 ? 94 : 68)
      doc.text((pnl >= 0 ? '+' : '') + formatEuro(pnl), 170, y)
      doc.setTextColor(220, 220, 230)
      y += 6
    }

    doc.save(`aurainvest-rapport-${new Date().toISOString().split('T')[0]}.pdf`)
  } catch (e) {
    console.error('PDF error:', e)
  }
  generating.value = false
}

function formatEuro(v: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
}
</script>
