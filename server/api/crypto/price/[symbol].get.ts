import { query } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const symbol = getRouterParam(event, 'symbol')?.toLowerCase()

  const COINGECKO_API = 'https://api.coingecko.com/api/v3'
  const TOKEN_IDS: Record<string, string> = {
    bitcoin: 'bitcoin', btc: 'bitcoin', ethereum: 'ethereum', eth: 'ethereum',
    solana: 'solana', sol: 'solana', cardano: 'cardano', ada: 'cardano',
    polygon: 'matic-network', matic: 'matic-network', polkadot: 'polkadot', dot: 'polkadot',
    avalanche: 'avalanche-2', avax: 'avalanche-2', chainlink: 'chainlink', link: 'chainlink',
    uniswap: 'uniswap', uni: 'uniswap', aave: 'aave', near: 'near',
    arbitrum: 'arbitrum', arb: 'arbitrum', optimism: 'optimism', op: 'optimism',
    binancecoin: 'binancecoin', bnb: 'binancecoin', ripple: 'ripple', xrp: 'ripple',
    dogecoin: 'dogecoin', doge: 'dogecoin', tron: 'tron', trx: 'tron',
    litecoin: 'litecoin', ltc: 'litecoin', stellar: 'stellar', xlm: 'stellar',
  }

  const id = TOKEN_IDS[symbol || ''] || symbol
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Symbole inconnu' })

  try {
    const res = await $fetch(`${COINGECKO_API}/simple/price?ids=${id}&vs_currencies=eur`, { timeout: 8000 })
    return { symbol: symbol?.toUpperCase(), id, price_eur: res[id]?.eur || 0 }
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'CoinGecko indisponible' })
  }
})
