import { parse } from 'node-html-parser'

interface NewsItem {
  title: string
  url: string
  symbol?: string
  price?: number
  variation?: string
  category?: string
  time: string
  timestamp: string
}

export default defineEventHandler(async (event): Promise<{ news: NewsItem[] } | { error: string }> => {
  const query = getQuery(event)
  const category = query.category as string || ''
  const limit = parseInt(query.limit as string) || 20

  const url = category
    ? `https://www.tradingsat.com/actualites/${category}/`
    : 'https://www.tradingsat.com/actualites/'

  try {
    const html = await $fetch<string>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    const root = parse(html)
    const news: NewsItem[] = []

    const items = root.querySelectorAll('.content-item .item')
    for (const el of items) {
      if (news.length >= limit) break

      // Date/heure
      const timeEl = el.querySelector('.meta-date')
      const time = timeEl?.text?.trim() || ''

      // Titre et lien
      const titleEl = el.querySelector('.item-text .title a')
      const title = titleEl?.text?.trim() || ''
      const href = titleEl?.getAttribute('href') || ''

      // Symbole (dans <strong>)
      const symbolEl = el.querySelector('.item-text .title strong')
      const symbol = symbolEl?.text?.trim() || undefined

      // Prix
      const valueEl = el.querySelector('.item-data .value')
      const price = valueEl ? parseFloat(valueEl.text.trim().replace(',', '.')) : undefined

      // Variation
      const varEl = el.querySelector('.item-data [class*="var-"]')
      const variation = varEl ? varEl.text.trim() : undefined

      // Catégorie
      const catEl = el.querySelector('.item-data .type')
      const categoryTag = catEl?.text?.trim() || undefined

      if (title) {
        news.push({
          title,
          url: href.startsWith('http') ? href : `https://www.tradingsat.com${href}`,
          symbol: symbol || undefined,
          price,
          variation,
          category: categoryTag || undefined,
          time,
          timestamp: new Date().toISOString()
        })
      }
    }

    return { news }
  } catch (err: any) {
    return { error: `Échec du scraping: ${err.message}` }
  }
})
