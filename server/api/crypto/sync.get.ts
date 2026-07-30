import { query } from '~~/server/utils/db'
import { requireAuth } from '~~/server/utils/auth'

// CoinGecko free API — no key needed, 10-30 calls/min
const COINGECKO_API = 'https://api.coingecko.com/api/v3'

const TOKEN_IDS: Record<string, string> = {
  bitcoin: 'bitcoin', btc: 'bitcoin',
  ethereum: 'ethereum', eth: 'ethereum',
  solana: 'solana', sol: 'solana',
  cardano: 'cardano', ada: 'cardano',
  polygon: 'matic-network', matic: 'matic-network',
  polkadot: 'polkadot', dot: 'polkadot',
  avalanche: 'avalanche-2', avax: 'avalanche-2',
  chainlink: 'chainlink', link: 'chainlink',
  uniswap: 'uniswap', uni: 'uniswap',
  aave: 'aave', near: 'near',
  arbitrum: 'arbitrum', arb: 'arbitrum',
  optimism: 'optimism', op: 'optimism',
}

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  // Get user's crypto investments
  const cryptos = await query(
    `SELECT i.*, c.slug as category_slug FROM investments i
     JOIN categories c ON c.id = i.category_id
     WHERE i.user_id = $1 AND c.slug = 'crypto' AND i.token_symbol IS NOT NULL`,
    [user.id]
  )

  if (cryptos.rows.length === 0) return { prices: {}, updated: [] }

  // Collect unique token symbols
  const symbols = [...new Set(cryptos.rows.map(r => r.token_symbol?.toLowerCase()).filter(Boolean))]
  const ids = symbols.map(s => TOKEN_IDS[s] || s).join(',')

  if (!ids) return { prices: {}, updated: [] }

  try {
    const res = await $fetch(`${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=eur`, {
      timeout: 10000
    })
    const prices: Record<string, number> = {}
    const updated: any[] = []
    const now = new Date().toISOString().split('T')[0]

    for (const crypto of cryptos.rows) {
      const symbol = crypto.token_symbol?.toLowerCase()
      const id = TOKEN_IDS[symbol || ''] || symbol
      if (res[id]?.eur) {
        const price = res[id].eur
        const qty = Number(crypto.crypto_amount || crypto.quantity || 0)
        const newValue = price * qty

        await query(
          `UPDATE investments SET current_value = $1, updated_at = NOW(),
           metadata = jsonb_set(COALESCE(metadata,'{}'), '{last_sync}', '"${now}"'::jsonb)
           WHERE id = $2`,
          [newValue, crypto.id]
        )
        prices[id] = price
        updated.push({ id: crypto.id, name: crypto.name, symbol: symbol?.toUpperCase(), price_eur: price, value_eur: newValue })
      }
    }
    return { prices, updated, synced_at: now }
  } catch (e) {
    return { error: 'CoinGecko API indisponible', prices: {}, updated: [] }
  }
})
