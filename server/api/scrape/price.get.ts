import { parse } from 'node-html-parser'

interface PriceData {
  symbol: string
  name: string
  price: number
  currency: string
  variation: number
  variationPercent: number
  direction: 'up' | 'down' | 'neutral'
  timestamp: string
  source: string
}

export default defineEventHandler(async (event): Promise<PriceData | { error: string }> => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url) {
    return { error: 'Paramètre "url" requis (URL TradingSat de la fiche valeur)' }
  }

  try {
    const html = await $fetch<string>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const root = parse(html)

    // Prix
    const priceEl = root.querySelector('.quote-header-price .price')
    const priceText = priceEl?.text?.trim() || ''
    const priceMatch = priceText.match(/([\d\s,.]+)\s*(€|\$|£|¥)?/)
    const price = priceMatch ? parseFloat(priceMatch[1].replace(/\s/g, '').replace(',', '.')) : 0
    const currency = priceMatch?.[2] || '€'

    // Variation
    const variationEl = root.querySelector('.quote-header-price .variation')
    const variationText = variationEl?.text?.trim() || ''
    const variationMatch = variationText.match(/([+-]?[\d,.]+)\s*%?/)
    const variationPercent = variationMatch ? parseFloat(variationMatch[1].replace(',', '.')) : 0
    const direction = variationEl?.classList?.contains('var-up') ? 'up'
      : variationEl?.classList?.contains('var-down') ? 'down'
      : 'neutral'

    // Nom
    const nameEl = root.querySelector('.quote-header-name h1, .quote-header-name .name')
    const name = nameEl?.text?.trim() || url.split('/').filter(Boolean).pop()?.split('-')[0] || ''

    // Symbole / ISIN
    const isinEl = root.querySelector('.quote-header-id, .isin')
    const isinText = isinEl?.text?.trim() || ''
    const isinMatch = isinText.match(/[A-Z]{2}[A-Z0-9]{10}/)
    const symbol = isinMatch ? isinMatch[0] : ''

    return {
      symbol,
      name,
      price,
      currency,
      variation: Math.round(price * variationPercent / 100 * 100) / 100,
      variationPercent,
      direction,
      timestamp: new Date().toISOString(),
      source: 'tradingsat.com'
    }
  } catch (err: any) {
    return { error: `Échec du scraping: ${err.message}` }
  }
})
