// Parse natural language into investment data
// Supports French patterns like:
// "J'ai 10 actions Apple achetées à 150€"
// "10 BTC à 30000€ le 15 mars 2024"
// "Ajoute un appartement à Paris acheté 200000€"
// "50 actions TotalEnergies en PEA à 55€"

export interface ParsedInvestment {
  name: string
  quantity: number
  purchasePrice: number
  currentValue: number
  category?: string
  type?: string
  date?: string
  ticker?: string
  notes?: string
  confidence: number // 0-1 how confident the parser is
}

// Category detection by keywords
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'actions-etf': ['action', 'actions', 'etf', 'tracker', 'bourse', 'ticker', 'pea', 'cto', 'dividende'],
  'crypto': ['btc', 'bitcoin', 'eth', 'ethereum', 'crypto', 'sol', 'solana', 'token', 'staking'],
  'immobilier': ['appartement', 'appart', 'maison', 'immeuble', 'terrain', 'parking', 'studio', 'loft', 'scpi', 'lmnp'],
  'metaux-precieux': ['or', 'argent', 'platine', 'lingot', 'pièce', 'napoléon', 'krugerrand', 'métal'],
  'private-equity': ['startup', 'levée', 'série', 'equity', 'seed', 'business angel', 'holding'],
  'epargne': ['livret', 'pel', 'cel', 'lep', 'assurance vie', 'compte', 'épargne'],
  'objets-collection': ['montre', 'rolex', 'tableau', 'vin', 'whisky', 'collection', 'carte', 'pokémon', 'sneaker'],
}

export function parseNaturalLanguage(text: string): ParsedInvestment | null {
  const t = text.toLowerCase().trim()
  if (!t || t.length < 5) return null

  let name = ''
  let quantity = 1
  let purchasePrice = 0
  let currentValue = 0
  let category: string | undefined
  let type = 'financial'
  let date: string | undefined
  let ticker: string | undefined
  let notes = text
  let confidence = 0.3

  // ─── Extract quantity ───
  const qtyPatterns = [
    /(\d+)\s*(actions?|parts?|tokens?|btc|eth|lingots?|pièces?|m2|m²|grammes?|g|kg|oz|bouteilles?)\s/i,
    /(\d+)\s+(?:de\s+)?/i,
    /j'(?:ai|achète)\s+(\d+)\s/i,
    /(\d+)\s+x\s/i,
  ]
  for (const p of qtyPatterns) {
    const m = t.match(p)
    if (m) { quantity = parseInt(m[1]) || 1; confidence += 0.2; break }
  }

  // ─── Extract price ───
  const pricePatterns = [
    /(?:à|acheté|payé|prix|valeur|court|cours)\s+(?:de\s+)?(\d[\d\s]*)\s*(?:€|euros?|e)\b/i,
    /(\d[\d\s]*)\s*(?:€|euros?|e)\b/i,
    /(?:pour|contre)\s+(\d[\d\s]*)\s*(?:€|euros?|e)?\b/i,
  ]
  for (const p of pricePatterns) {
    const m = t.match(p)
    if (m) {
      purchasePrice = parseInt(m[1].replace(/\s/g, '')) || 0
      currentValue = purchasePrice // default current = purchase
      confidence += 0.2; break
    }
  }

  // ─── Extract name (what's left after removing numbers/prices) ───
  // Try to find proper nouns or known assets
  const namePatterns = [
    /(?:actions?|parts?|tokens?)\s+(?:de\s+)?(\w[\w\s]{1,30}?)(?:\s+(?:à|acheté|payé|pour|le|en|sur|chez|€|euros?|$))/i,
    /(?:j'ai|ajoute|achète)\s+(?:\d+\s+)?(\w[\w\s]{1,30}?)(?:\s+(?:à|acheté|payé|pour|le|€))/i,
  ]
  for (const p of namePatterns) {
    const m = t.match(p)
    if (m) { name = m[1].trim(); confidence += 0.2; break }
  }

  // Fallback: extract a reasonable name
  if (!name) {
    // Remove quantity, price, dates and use remaining text
    let cleaned = t
      .replace(/\d+[\d\s]*€/g, '')
      .replace(/\d+\s*(?:actions?|parts?|tokens?)/g, '')
      .replace(/j'ai|ajoute|achète|acheté|payé|pour|contre/g, '')
      .replace(/(?:le|en|sur|chez)\s+\d{1,2}\s+(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s+\d{4}/g, '')
      .trim()
    if (cleaned.length > 2) {
      name = cleaned.substring(0, 40).trim()
      // Capitalize first letters
      name = name.replace(/\b\w/g, c => c.toUpperCase())
      confidence += 0.1
    }
  }

  if (!name || name.length < 2) return null

  // ─── Detect category ───
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (t.includes(kw)) { category = cat; confidence += 0.15; break }
    }
    if (category) break
  }

  // ─── Detect type (physical vs financial) ───
  if (t.includes('physique') || t.includes('objet') || t.includes('coffre') || category === 'objets-collection') {
    type = 'physical'
  }

  // ─── Extract date ───
  const datePattern = /(?:le|en|date)\s+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i
  const dateMatch = t.match(datePattern)
  if (dateMatch) { date = dateMatch[1]; confidence += 0.1 }

  // ─── Extract ticker ───
  const tickerPattern = /\b([A-Z]{2,5})\b/
  const tickerMatch = text.match(tickerPattern)
  if (tickerMatch && category === 'actions-etf') { ticker = tickerMatch[1]; confidence += 0.1 }

  // ─── Extract current value (if different from purchase) ───
  const currentPattern = /(?:vaut|valeur actuelle|maintenant)\s+(\d[\d\s]*)\s*(?:€|euros?)?\b/i
  const currentMatch = t.match(currentPattern)
  if (currentMatch) { currentValue = parseInt(currentMatch[1].replace(/\s/g, '')) || purchasePrice; confidence += 0.1 }

  // If no purchase price, try just a number
  if (purchasePrice === 0) {
    const numMatch = t.match(/(\d[\d\s]{3,})\s*(?:€|euros?)?/); // 4+ digit numbers
    if (numMatch) { purchasePrice = parseInt(numMatch[1].replace(/\s/g, '')) || 0; currentValue = purchasePrice; confidence += 0.1 }
  }

  return {
    name: name.substring(0, 80),
    quantity: Math.max(1, quantity),
    purchasePrice,
    currentValue: currentValue || purchasePrice,
    category,
    type,
    date,
    ticker,
    notes,
    confidence: Math.min(confidence, 1),
  }
}
