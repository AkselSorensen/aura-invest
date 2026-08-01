export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const symbol = query.symbol as string
  if (!symbol) throw createError({ statusCode: 400, statusMessage: 'Paramètre symbol requis' })

  try {
    // Fetch quote summary
    const modules = 'assetProfile,summaryDetail,defaultKeyStatistics,recommendationTrend,calendarEvents,price'
    const summaryUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${modules}`
    const summaryRes = await $fetch<any>(summaryUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const result = summaryRes?.quoteSummary?.result?.[0] || {}

    // Fetch chart (6 months)
    const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=6mo&interval=1d`
    const chartRes = await $fetch<any>(chartUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const chartResult = chartRes?.chart?.result?.[0] || {}
    const timestamps = chartResult.timestamp || []
    const quotes = chartResult.indicators?.quote?.[0] || {}
    const closes = quotes.close || []

    // Build historical data
    const history = timestamps.map((ts: number, i: number) => ({
      date: new Date(ts * 1000).toISOString().split('T')[0],
      close: closes[i] || null
    })).filter((h: any) => h.close !== null)

    const price = result.price || {}
    const summary = result.summaryDetail || {}
    const stats = result.defaultKeyStatistics || {}
    const profile = result.assetProfile || {}
    const events = result.calendarEvents || {}
    const recs = result.recommendationTrend?.trend || []

    // Analyst consensus
    const analystRec = recs.length > 0 ? recs[recs.length - 1] : null
    const totalAnalysts = analystRec ? (analystRec.strongBuy || 0) + (analystRec.buy || 0) + (analystRec.hold || 0) + (analystRec.sell || 0) + (analystRec.strongSell || 0) : 0

    // Dividends
    const divRate = summary.dividendRate?.raw || summary.trailingAnnualDividendRate?.raw || 0
    const divYield = summary.dividendYield?.raw ? summary.dividendYield.raw * 100 : (summary.trailingAnnualDividendYield?.raw ? summary.trailingAnnualDividendYield.raw * 100 : 0)
    const exDivDate = events.dividendDate ? new Date(events.dividendDate * 1000).toISOString().split('T')[0] : null

    return {
      symbol,
      name: price.shortName || profile.shortName || symbol,
      sector: profile.sector || null,
      industry: profile.industry || null,
      website: profile.website || null,
      description: profile.longBusinessSummary || null,

      // Price
      currentPrice: price.regularMarketPrice?.raw || null,
      previousClose: summary.previousClose?.raw || null,
      currency: price.currency || 'EUR',

      // Key metrics
      marketCap: price.marketCap?.raw || stats.marketCap?.raw || null,
      peRatio: summary.trailingPE?.raw || stats.trailingPE?.raw || null,
      forwardPE: summary.forwardPE?.raw || null,
      eps: stats.trailingEps?.raw || null,
      beta: stats.beta?.raw || null,
      fiftyTwoWeekHigh: summary.fiftyTwoWeekHigh?.raw || null,
      fiftyTwoWeekLow: summary.fiftyTwoWeekLow?.raw || null,
      avgVolume: summary.averageVolume?.raw || null,

      // Dividends
      dividendRate: divRate,
      dividendYield: divYield,
      exDividendDate: exDivDate,
      nextEarningsDate: events.earnings?.earningsDate?.[0]?.raw 
        ? new Date(events.earnings.earningsDate[0].raw * 1000).toISOString().split('T')[0] 
        : null,

      // Analysts
      analystConsensus: analystConsensus(recs),
      totalAnalysts,
      analystTargetHigh: stats.targetHighPrice?.raw || null,
      analystTargetLow: stats.targetLowPrice?.raw || null,
      analystTargetMean: stats.targetMeanPrice?.raw || null,
      analystBreakdown: analystRec ? {
        strongBuy: analystRec.strongBuy || 0,
        buy: analystRec.buy || 0,
        hold: analystRec.hold || 0,
        sell: analystRec.sell || 0,
        strongSell: analystRec.strongSell || 0,
      } : null,

      // Chart
      history,
      historyRange: '6mo',
    }
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: `Données indisponibles: ${err.message}` })
  }
})

function analystConsensus(trends: any[]) {
  if (!trends || trends.length === 0) return null
  const last = trends[trends.length - 1]
  const max = Math.max(last.strongBuy || 0, last.buy || 0, last.hold || 0, last.sell || 0, last.strongSell || 0)
  if (max === (last.strongBuy || 0)) return 'Strong Buy'
  if (max === (last.buy || 0)) return 'Buy'
  if (max === (last.hold || 0)) return 'Hold'
  if (max === (last.sell || 0)) return 'Sell'
  return 'Strong Sell'
}
