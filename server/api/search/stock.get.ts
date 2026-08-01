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

    // Get symbols for bulk quote
    const symbols = quotes.map((r: any) => r.symbol).join(',')

    let quoteData: Record<string, any> = {}
    if (symbols) {
      try {
        const quoteUrl = `https://query1.finance.yahoo.com/v6/finance/quote?symbols=${encodeURIComponent(symbols)}`
        const quoteRes = await $fetch<any>(quoteUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        const results = quoteRes?.quoteResponse?.result || []
        for (const r of results) {
          quoteData[r.symbol] = r
        }
      } catch {}
    }

    const results = quotes.map((r: any) => {
      const qd = quoteData[r.symbol] || {}
      return {
        symbol: r.symbol,
        name: r.shortname || r.longname || r.symbol,
        exchange: r.exchange,
        market: r.exchange,
        type: r.quoteType,
        price: qd.regularMarketPrice || r.regularMarketPrice || null,
        currency: qd.currency || r.currency || 'EUR',
        change: qd.regularMarketChange || r.regularMarketChange || null,
        changePercent: qd.regularMarketChangePercent || r.regularMarketChangePercent || null,
        dividendYield: qd.trailingAnnualDividendYield ? qd.trailingAnnualDividendYield * 100 : null,
        isin: r.isin || null,
      }
    })

    return { results }
  } catch {
    return { results: [] }
  }
})
