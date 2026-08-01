import { query } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  // Get portfolio stats
  const portfolio = await query(
    `SELECT 
       COALESCE(SUM(CASE WHEN i.current_value > 0 THEN i.current_value ELSE 0 END), 0) as total_value,
       COALESCE(SUM(CASE WHEN i.purchase_price > 0 AND i.shares_qty > 0 THEN i.purchase_price * i.shares_qty ELSE i.purchase_price END), 0) as total_cost,
       COUNT(*) as positions
     FROM investments i WHERE i.user_id = $1`, [user.id])

  const totalValue = parseFloat(portfolio.rows[0].total_value)
  const totalCost = parseFloat(portfolio.rows[0].total_cost)
  const positions = parseInt(portfolio.rows[0].positions)
  
  const portfolioPerf = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0

  // Get CAC 40 data
  let cacValue = 0, cacPerf = 0
  try {
    const cacData = await $fetch('https://aura-invest-theta.vercel.app/api/market/overview')
    const cac = (cacData as any).indices?.find((i: any) => i.name === 'CAC 40')
    if (cac) {
      cacValue = cac.value
      cacPerf = cac.variationPercent
    }
  } catch {}

  // Per category breakdown
  const breakdown = await query(
    `SELECT c.name as category, c.slug, c.color,
       COALESCE(SUM(i.current_value), 0) as value,
       COUNT(*) as count
     FROM investments i
     LEFT JOIN categories c ON c.id = i.category_id
     WHERE i.user_id = $1 AND i.current_value > 0
     GROUP BY c.name, c.slug, c.color
     ORDER BY value DESC`, [user.id])
  
  // Latest synced prices
  const latestPrices = await query(
    `SELECT ap.investment_id, ap.price, ap.variation_pct, ap.fetched_at, i.name, i.ticker
     FROM asset_prices ap
     JOIN investments i ON i.id = ap.investment_id
     WHERE i.user_id = $1
     AND ap.fetched_at = (SELECT MAX(fetched_at) FROM asset_prices WHERE investment_id = ap.investment_id)
     ORDER BY ap.fetched_at DESC
     LIMIT 5`, [user.id])

  return {
    portfolio: {
      totalValue: Math.round(totalValue * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      performance: Math.round(portfolioPerf * 100) / 100,
      positions
    },
    cac40: { value: cacValue, performance: cacPerf },
    vsMarket: Math.round((portfolioPerf - cacPerf) * 100) / 100,
    breakdown: breakdown.rows,
    latestPrices: latestPrices.rows
  }
})
