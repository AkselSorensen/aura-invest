import { parse } from 'node-html-parser'

interface IndexData {
  name: string
  value: number
  variation: number
  variationPercent: number
  direction: 'up' | 'down' | 'neutral'
}

interface MarketOverview {
  indices: IndexData[]
  topGainers: { name: string; variation: string }[]
  topLosers: { name: string; variation: string }[]
  fx: { pair: string; rate: number }[]
  timestamp: string
}

export default defineEventHandler(async (): Promise<MarketOverview | { error: string }> => {
  try {
    const html = await $fetch<string>('https://www.tradingsat.com/actualites/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const root = parse(html)

    const indices: IndexData[] = []
    const topGainers: { name: string; variation: string }[] = []
    const topLosers: { name: string; variation: string }[] = []
    const fx: { pair: string; rate: number }[] = []

    // Parser tous les liens pour trouver CAC 40, indices, palmarès, devises
    const allLinks = root.querySelectorAll('a')
    for (const link of allLinks) {
      const text = link.text.trim()

      // CAC 40
      const cacMatch = text.match(/CAC\s*40\s+([\d,.]+)\s+([+-][\d,.]+)\s*%/)
      if (cacMatch && !indices.find(i => i.name === 'CAC 40')) {
        indices.push({
          name: 'CAC 40',
          value: parseFloat(cacMatch[1].replace(',', '.')),
          variation: 0,
          variationPercent: parseFloat(cacMatch[2].replace(',', '.')),
          direction: cacMatch[2].startsWith('+') ? 'up' : 'down'
        })
      }

      // Autres indices (SBF 120, etc.)
      const idxMatch = text.match(/^(SBF\s*120|AEX25|BEL20|PSI\s*20|NEXT\s*BIOTEC)\s+([+-][\d,.]+)\s*%/)
      if (idxMatch && !indices.find(i => i.name === idxMatch[1])) {
        indices.push({
          name: idxMatch[1],
          value: 0,
          variation: 0,
          variationPercent: parseFloat(idxMatch[2].replace(',', '.')),
          direction: idxMatch[2].startsWith('+') ? 'up' : 'down'
        })
      }

      // Palmarès (actions avec variation en %)
      const palmMatch = text.match(/^(.+?)\s+([+-][\d,.]+)\s*%$/)
      if (palmMatch && palmMatch[1].length > 2 && !text.includes('CAC') && !text.includes('SBF') && !text.includes('INDEX')) {
        const item = { name: palmMatch[1], variation: palmMatch[2] + '%' }
        if (palmMatch[2].startsWith('+')) {
          if (topGainers.length < 5) topGainers.push(item)
        } else {
          if (topLosers.length < 5) topLosers.push(item)
        }
      }

      // Devises
      const fxMatch = text.match(/(?:EURO\s*DOLLAR|DOLLAR\s*YEN)\s+([\d,.]+)/i)
      if (fxMatch) {
        const pair = text.toLowerCase().includes('dollar yen') ? 'USDJPY' : 'EURUSD'
        if (!fx.find(f => f.pair === pair)) {
          fx.push({ pair, rate: parseFloat(fxMatch[1].replace(',', '.')) })
        }
      }
    }

    return {
      indices,
      topGainers,
      topLosers,
      fx,
      timestamp: new Date().toISOString()
    }
  } catch (err: any) {
    return { error: `Échec du scraping: ${err.message}` }
  }
})
