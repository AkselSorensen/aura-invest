import { query } from '~~/server/utils/db'
import { parse } from 'node-html-parser'

export default defineEventHandler(async () => {
  // Get all investments with market_url or isin (actions/ETF)
  const investments = await query(
    `SELECT i.id, i.name, i.ticker, i.isin, i.shares_qty, i.current_value, 
            i.market_url, i.purchase_price, c.slug as cat_slug
     FROM investments i 
     LEFT JOIN categories c ON c.id = i.category_id
     WHERE (i.market_url IS NOT NULL OR i.isin IS NOT NULL)
       AND (c.slug = 'actions-etf' OR c.id IS NULL)`
  )

  const results: any[] = []
  
  for (const inv of investments.rows) {
    try {
      let url = inv.market_url
      
      // If no market_url, try to build from isin
      if (!url && inv.isin) {
        const slug = inv.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        url = `https://www.tradingsat.com/${slug}-${inv.isin}/`
      }
      
      if (!url) continue
      
      const html = await $fetch<string>(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      })
      
      const root = parse(html)
      const priceText = root.querySelector('.quote-header-price .price')?.text?.trim() || ''
      const priceMatch = priceText.match(/([\d\s,.]+)/)
      const price = priceMatch ? parseFloat(priceMatch[1].replace(/\s/g, '').replace(',', '.')) : 0
      
      const varEl = root.querySelector('.quote-header-price .variation')
      const varText = varEl?.text?.trim() || ''
      const varMatch = varText.match(/([+-]?[\d,.]+)\s*%?/)
      const variationPct = varMatch ? parseFloat(varMatch[1].replace(',', '.')) : 0
      const variation = price * variationPct / 100
      
      if (price > 0) {
        // Store price
        await query(
          `INSERT INTO asset_prices (investment_id, isin, ticker, price, currency, variation, variation_pct)
           VALUES ($1, $2, $3, $4, 'EUR', $5, $6)`,
          [inv.id, inv.isin, inv.ticker, price, variation, variationPct]
        )
        
        // Update current value if shares_qty exists
        if (inv.shares_qty > 0) {
          await query(
            'UPDATE investments SET current_value = $1, updated_at = NOW() WHERE id = $2',
            [Math.round(price * inv.shares_qty * 100) / 100, inv.id]
          )
        }
        
        results.push({ id: inv.id, name: inv.name, price, variationPct, updated: true })
      }
    } catch (e: any) {
      results.push({ id: inv.id, name: inv.name, error: e.message })
    }
  }
  
  return { success: true, synced: results.filter(r => r.updated).length, results }
})
