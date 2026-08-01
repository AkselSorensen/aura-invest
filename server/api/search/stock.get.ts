export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = query.q as string
  if (!q || q.length < 2) return { results: [] }

  try {
    // Search via Yahoo Finance
    const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0`
    const searchRes = await $fetch<any>(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })

    const quotes = (searchRes.quotes || []).filter((r: any) =>
      r.quoteType === 'EQUITY' || r.quoteType === 'ETF'
    )

    const results = quotes.map((r: any) => ({
      symbol: r.symbol,
      name: r.shortname || r.longname || r.symbol,
      exchange: r.exchange,
      market: r.exchange,
      type: r.quoteType,
      price: r.regularMarketPrice || null,
      currency: r.currency || 'EUR',
      change: r.regularMarketChange || null,
      changePercent: r.regularMarketChangePercent || null,
    }))

    return { results }
  } catch {
    return { results: [] }
  }
})
