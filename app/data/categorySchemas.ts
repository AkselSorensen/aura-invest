export interface CategoryField {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'date' | 'currency' | 'percent' | 'textarea'
  options?: { value: string; label: string }[]
  placeholder?: string
  required?: boolean
  hint?: string
  colSpan?: number // 2 = full width in 2-col grid
}

export interface CategorySchema {
  slug: string
  name: string
  icon: string
  color: string
  fields: CategoryField[]
}

export const CATEGORY_SCHEMAS: Record<string, CategorySchema> = {
  // ─── PRIVATE EQUITY ───
  'private-equity': {
    slug: 'private-equity',
    name: 'Private Equity',
    icon: 'lucide:briefcase',
    color: '#EC4899',
    fields: [
      { key: 'company', label: 'Société', type: 'text', required: true, placeholder: 'Nom de la startup', colSpan: 2 },
      { key: 'stage', label: 'Stade', type: 'select', required: true, options: [
        { value: 'seed', label: 'Seed' }, { value: 'series_a', label: 'Série A' },
        { value: 'series_b', label: 'Série B' }, { value: 'series_c', label: 'Série C+' },
        { value: 'growth', label: 'Growth' }, { value: 'pre_ipo', label: 'Pré-IPO' },
      ]},
      { key: 'sector', label: 'Secteur', type: 'select', options: [
        { value: 'saas', label: 'SaaS' }, { value: 'fintech', label: 'Fintech' },
        { value: 'deeptech', label: 'DeepTech/AI' }, { value: 'health', label: 'HealthTech' },
        { value: 'climate', label: 'ClimateTech' }, { value: 'consumer', label: 'Consumer' },
        { value: 'enterprise', label: 'Enterprise' }, { value: 'other', label: 'Autre' },
      ]},
      { key: 'equity_pct', label: 'Part (%)', type: 'percent', placeholder: '5.0' },
      { key: 'invested_amount', label: 'Montant investi (€)', type: 'currency', placeholder: '50000' },
      { key: 'current_valuation', label: 'Valorisation (€)', type: 'currency', placeholder: '200000' },
      { key: 'moic', label: 'MOIC', type: 'number', placeholder: '2.5x', hint: 'Multiple on Invested Capital' },
      { key: 'irr', label: 'IRR (%)', type: 'percent', placeholder: '25.0', hint: 'Taux de rendement interne' },
      { key: 'exit_status', label: 'Statut de sortie', type: 'select', options: [
        { value: 'active', label: 'Actif' }, { value: 'exited', label: 'Sorti (IPO/M&A)' },
        { value: 'written_off', label: 'Pertes' }, { value: 'secondary', label: 'Secondary' },
      ]},
      { key: 'exit_value', label: 'Valeur de sortie (€)', type: 'currency', placeholder: '500000' },
      { key: 'fund', label: 'Fonds / Véhicule', type: 'text', placeholder: 'Fonds propres, holding...' },
      { key: 'investment_date', label: 'Date d\'investissement', type: 'date' },
      { key: 'co_investors', label: 'Co-investisseurs', type: 'textarea', placeholder: 'Autres investisseurs...' },
      { key: 'pipeline_status', label: 'Pipeline', type: 'select', options: [
        { value: 'sourcing', label: 'Sourcing' }, { value: 'due_dil', label: 'Due Diligence' },
        { value: 'negotiation', label: 'Négociation' }, { value: 'closed', label: 'Closed' },
      ]},
    ]
  },

  // ─── IMMOBILIER ───
  'immobilier': {
    slug: 'immobilier',
    name: 'Immobilier',
    icon: 'lucide:building',
    color: '#22C55E',
    fields: [
      { key: 'address', label: 'Adresse', type: 'text', required: true, placeholder: '12 rue de Paris', colSpan: 2 },
      { key: 'property_type', label: 'Type de bien', type: 'select', options: [
        { value: 'apartment', label: 'Appartement' }, { value: 'house', label: 'Maison' },
        { value: 'land', label: 'Terrain' }, { value: 'commercial', label: 'Commercial' },
        { value: 'parking', label: 'Parking' }, { value: 'scpi', label: 'SCPI' },
      ]},
      { key: 'city', label: 'Ville', type: 'text', placeholder: 'Paris' },
      { key: 'surface', label: 'Surface (m²)', type: 'number', placeholder: '50' },
      { key: 'rooms', label: 'Nombre de pièces', type: 'number', placeholder: '3' },
      { key: 'rental_income', label: 'Loyer mensuel (€)', type: 'currency', placeholder: '1200' },
      { key: 'charges', label: 'Charges mensuelles (€)', type: 'currency', placeholder: '150' },
      { key: 'property_tax', label: 'Taxe foncière/an (€)', type: 'currency', placeholder: '800' },
      { key: 'loan_amount', label: 'Crédit restant (€)', type: 'currency', placeholder: '150000' },
      { key: 'loan_rate', label: 'Taux crédit (%)', type: 'percent', placeholder: '3.5' },
      { key: 'loan_end_date', label: 'Fin du crédit', type: 'date' },
      { key: 'net_yield', label: 'Rendement net (%)', type: 'percent', placeholder: '4.5', hint: 'Calculé auto si loyer et charges remplis' },
      { key: 'latitude', label: 'Latitude', type: 'number', placeholder: '48.8566', hint: 'Pour la carte' },
      { key: 'longitude', label: 'Longitude', type: 'number', placeholder: '2.3522', hint: 'Pour la carte' },
    ]
  },

  // ─── ACTIONS & ETF ───
  'actions-etf': {
    slug: 'actions-etf',
    name: 'Actions & ETF',
    icon: 'lucide:trending-up',
    color: '#3B82F6',
    fields: [
      { key: 'ticker', label: 'Ticker', type: 'text', required: true, placeholder: 'AAPL, CW8.PA...' },
      { key: 'isin', label: 'ISIN', type: 'text', placeholder: 'FR0010315770' },
      { key: 'market', label: 'Marché', type: 'select', options: [
        { value: 'euronext', label: 'Euronext Paris' }, { value: 'nasdaq', label: 'NASDAQ' },
        { value: 'nyse', label: 'NYSE' }, { value: 'xetra', label: 'Xetra' },
        { value: 'lse', label: 'London' }, { value: 'other', label: 'Autre' },
      ]},
      { key: 'sector', label: 'Secteur', type: 'select', options: [
        { value: 'tech', label: 'Technologie' }, { value: 'finance', label: 'Finance' },
        { value: 'health', label: 'Santé' }, { value: 'energy', label: 'Énergie' },
        { value: 'consumer', label: 'Consommation' }, { value: 'industry', label: 'Industrie' },
        { value: 'realestate', label: 'Immobilier' }, { value: 'materials', label: 'Matériaux' },
      ]},
      { key: 'shares', label: 'Nombre d\'actions', type: 'number', placeholder: '100' },
      { key: 'avg_cost', label: 'PRU (€)', type: 'currency', placeholder: '150', hint: 'Prix de revient unitaire' },
      { key: 'dividend_yield', label: 'Rendement dividende (%)', type: 'percent', placeholder: '2.5' },
      { key: 'dividend_amount', label: 'Dividende annuel (€)', type: 'currency', placeholder: '250' },
      { key: 'account_type', label: 'Type de compte', type: 'select', options: [
        { value: 'pea', label: 'PEA' }, { value: 'cto', label: 'CTO' },
        { value: 'assurance_vie', label: 'Assurance Vie' }, { value: 'per', label: 'PER' },
      ]},
      { key: 'broker', label: 'Courtier', type: 'text', placeholder: 'BoursoBank, Trade Republic...' },
      { key: 'strategy', label: 'Stratégie', type: 'select', options: [
        { value: 'buy_hold', label: 'Buy & Hold' }, { value: 'dca', label: 'DCA' },
        { value: 'trading', label: 'Trading actif' }, { value: 'dividends', label: 'Dividendes' },
      ]},
    ]
  },

  // ─── CRYPTO ───
  'crypto': {
    slug: 'crypto',
    name: 'Crypto',
    icon: 'lucide:bitcoin',
    color: '#F7931A',
    fields: [
      { key: 'token', label: 'Token/Symbol', type: 'text', required: true, placeholder: 'BTC, ETH, SOL...' },
      { key: 'blockchain', label: 'Blockchain', type: 'select', options: [
        { value: 'bitcoin', label: 'Bitcoin' }, { value: 'ethereum', label: 'Ethereum' },
        { value: 'solana', label: 'Solana' }, { value: 'polygon', label: 'Polygon' },
        { value: 'avalanche', label: 'Avalanche' }, { value: 'arbitrum', label: 'Arbitrum' },
        { value: 'other', label: 'Autre' },
      ]},
      { key: 'amount', label: 'Quantité', type: 'number', placeholder: '1.5' },
      { key: 'avg_buy_price', label: 'Prix d\'achat moyen (€)', type: 'currency', placeholder: '30000' },
      { key: 'staking_apy', label: 'Staking APY (%)', type: 'percent', placeholder: '5.0' },
      { key: 'staking_rewards', label: 'Rewards (annuels)', type: 'currency', placeholder: '150', hint: 'Gains estimés annuels' },
      { key: 'wallet_type', label: 'Type de wallet', type: 'select', options: [
        { value: 'hardware', label: 'Hardware (Ledger...)' }, { value: 'hot', label: 'Hot wallet' },
        { value: 'exchange', label: 'Exchange' }, { value: 'defi', label: 'DeFi Protocol' },
      ]},
      { key: 'wallet_address', label: 'Adresse (publique)', type: 'text', placeholder: '0x... ou bc1...' },
      { key: 'platform', label: 'Plateforme', type: 'text', placeholder: 'Binance, Coinbase, Ledger...' },
      { key: 'vesting_end', label: 'Fin du vesting', type: 'date', hint: 'Si tokens vestés' },
    ]
  },

  // ─── MÉTAUX PRÉCIEUX ───
  'metaux-precieux': {
    slug: 'metaux-precieux',
    name: 'Métaux Précieux',
    icon: 'lucide:coins',
    color: '#C9A84C',
    fields: [
      { key: 'metal_type', label: 'Type de métal', type: 'select', required: true, options: [
        { value: 'gold', label: 'Or' }, { value: 'silver', label: 'Argent' },
        { value: 'platinum', label: 'Platine' }, { value: 'palladium', label: 'Palladium' },
      ]},
      { key: 'form', label: 'Format', type: 'select', options: [
        { value: 'coin', label: 'Pièce' }, { value: 'bar', label: 'Lingot' },
        { value: 'jewelry', label: 'Bijou' }, { value: 'etf', label: 'ETF/ETC' },
      ]},
      { key: 'weight_grams', label: 'Poids (grammes)', type: 'number', placeholder: '31.1' },
      { key: 'purity', label: 'Pureté (‰)', type: 'select', options: [
        { value: '999.9', label: '999.9‰ (24K)' }, { value: '916', label: '916‰ (22K)' },
        { value: '750', label: '750‰ (18K)' }, { value: '999', label: '999‰ (Argent fin)' },
      ]},
      { key: 'spot_price', label: 'Prix spot (€/g)', type: 'currency', placeholder: '75' },
      { key: 'premium', label: 'Prime (%)', type: 'percent', placeholder: '5', hint: 'Prime vs spot' },
      { key: 'storage_location', label: 'Lieu de stockage', type: 'text', placeholder: 'Coffre banque, domicile...' },
      { key: 'certificate', label: 'N° certificat', type: 'text', placeholder: 'CERT-12345' },
    ]
  },

  // ─── OBJETS DE COLLECTION ───
  'objets-collection': {
    slug: 'objets-collection',
    name: 'Objets de Collection',
    icon: 'lucide:gem',
    color: '#A855F7',
    fields: [
      { key: 'category', label: 'Type d\'objet', type: 'select', options: [
        { value: 'watches', label: 'Montres' }, { value: 'art', label: 'Art' },
        { value: 'wine', label: 'Vins' }, { value: 'cars', label: 'Voitures' },
        { value: 'jewelry', label: 'Bijoux' }, { value: 'furniture', label: 'Mobilier' },
        { value: 'books', label: 'Livres' }, { value: 'cards', label: 'Cartes' },
        { value: 'sneakers', label: 'Sneakers' }, { value: 'other', label: 'Autre' },
      ]},
      { key: 'condition', label: 'État', type: 'select', options: [
        { value: 'mint', label: 'Mint/Neuf' }, { value: 'excellent', label: 'Excellent' },
        { value: 'good', label: 'Bon' }, { value: 'fair', label: 'Moyen' },
      ]},
      { key: 'serial_number', label: 'N° de série', type: 'text', placeholder: 'ABC-12345' },
      { key: 'certificate', label: 'Certificat d\'authenticité', type: 'select', options: [
        { value: 'yes', label: 'Oui' }, { value: 'no', label: 'Non' },
      ]},
      { key: 'estimated_value', label: 'Estimation (€)', type: 'currency', placeholder: '5000' },
      { key: 'appreciation', label: 'Plus-value estimée (%)', type: 'percent', placeholder: '15' },
      { key: 'provenance', label: 'Provenance', type: 'textarea', placeholder: 'Historique, anciens propriétaires...' },
      { key: 'exhibition', label: 'Expositions/Concours', type: 'textarea', placeholder: 'Salons, expositions...' },
    ]
  },

  // ─── ÉPARGNE ───
  'epargne': {
    slug: 'epargne',
    name: 'Épargne',
    icon: 'lucide:piggy-bank',
    color: '#14B8A6',
    fields: [
      { key: 'account_type', label: 'Type de compte', type: 'select', options: [
        { value: 'livret_a', label: 'Livret A' }, { value: 'ldds', label: 'LDDS' },
        { value: 'lep', label: 'LEP' }, { value: 'pel', label: 'PEL' },
        { value: 'cel', label: 'CEL' }, { value: 'assurance_vie', label: 'Assurance Vie' },
        { value: 'compte_courant', label: 'Compte Courant' },
      ]},
      { key: 'bank', label: 'Banque', type: 'text', placeholder: 'Crédit Agricole...' },
      { key: 'interest_rate', label: 'Taux d\'intérêt (%)', type: 'percent', placeholder: '3.0' },
      { key: 'interest_earned', label: 'Intérêts annuels (€)', type: 'currency', placeholder: '300' },
      { key: 'monthly_deposit', label: 'Versement mensuel (€)', type: 'currency', placeholder: '200' },
      { key: 'goal_amount', label: 'Objectif (€)', type: 'currency', placeholder: '10000' },
    ]
  },
}

// Default empty metadata for each category
export function getDefaultMetadata(slug: string): Record<string, any> {
  const schema = CATEGORY_SCHEMAS[slug]
  if (!schema) return {}
  const meta: Record<string, any> = {}
  for (const field of schema.fields) {
    switch (field.type) {
      case 'number': case 'currency': case 'percent': meta[field.key] = 0; break
      case 'select': meta[field.key] = field.options?.[0]?.value || ''; break
      case 'date': meta[field.key] = ''; break
      default: meta[field.key] = ''
    }
  }
  return meta
}

// Get category info by slug
export function getCategoryInfo(slug: string) {
  return CATEGORY_SCHEMAS[slug] || null
}

// Get field config by category + field key
export function getFieldConfig(slug: string, key: string): CategoryField | null {
  return CATEGORY_SCHEMAS[slug]?.fields.find(f => f.key === key) || null
}

// Format a metadata value for display
export function formatMetadataValue(key: string, value: any, slug: string): string {
  const field = getFieldConfig(slug, key)
  if (!field) return String(value ?? '-')
  if (value === null || value === undefined || value === '') return '-'
  switch (field.type) {
    case 'currency': return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(value))
    case 'percent': return Number(value).toFixed(1) + '%'
    case 'select': return field.options?.find(o => o.value === value)?.label || value
    case 'date': return value ? new Date(value).toLocaleDateString('fr-FR') : '-'
    default: return String(value)
  }
}

// Get an icon for a metadata field
export function getFieldIcon(key: string): string {
  const map: Record<string, string> = {
    company: 'lucide:building-2', stage: 'lucide:rocket', sector: 'lucide:tag',
    equity_pct: 'lucide:pie-chart', invested_amount: 'lucide:banknote',
    current_valuation: 'lucide:bar-chart-3', moic: 'lucide:trending-up',
    irr: 'lucide:percent', exit_status: 'lucide:door-open', exit_value: 'lucide:hand-coins',
    fund: 'lucide:landmark', investment_date: 'lucide:calendar',
    co_investors: 'lucide:users', pipeline_status: 'lucide:kanban',
    address: 'lucide:map-pin', property_type: 'lucide:home', city: 'lucide:map',
    surface: 'lucide:maximize', rooms: 'lucide:door-open', rental_income: 'lucide:banknote',
    charges: 'lucide:receipt', property_tax: 'lucide:landmark', loan_amount: 'lucide:credit-card',
    loan_rate: 'lucide:percent', loan_end_date: 'lucide:calendar-off',
    net_yield: 'lucide:trending-up', latitude: 'lucide:globe', longitude: 'lucide:globe',
    ticker: 'lucide:hash', isin: 'lucide:barcode', market: 'lucide:globe',
    shares: 'lucide:layers', avg_cost: 'lucide:calculator', dividend_yield: 'lucide:percent',
    dividend_amount: 'lucide:hand-coins', account_type: 'lucide:wallet',
    broker: 'lucide:landmark', strategy: 'lucide:target',
    token: 'lucide:coins', blockchain: 'lucide:link', amount: 'lucide:hash',
    avg_buy_price: 'lucide:shopping-cart', staking_apy: 'lucide:percent',
    staking_rewards: 'lucide:gift', wallet_type: 'lucide:wallet',
    wallet_address: 'lucide:qr-code', platform: 'lucide:monitor', vesting_end: 'lucide:lock',
    metal_type: 'lucide:coins', form: 'lucide:shapes', weight_grams: 'lucide:weight',
    purity: 'lucide:sparkles', spot_price: 'lucide:globe', premium: 'lucide:percent',
    storage_location: 'lucide:map-pin', certificate: 'lucide:award',
    condition: 'lucide:sparkles', serial_number: 'lucide:hash',
    estimated_value: 'lucide:bar-chart-3', appreciation: 'lucide:trending-up',
    provenance: 'lucide:history', exhibition: 'lucide:trophy',
    bank: 'lucide:landmark', interest_rate: 'lucide:percent',
    interest_earned: 'lucide:trending-up', monthly_deposit: 'lucide:arrow-up-circle',
    goal_amount: 'lucide:target',
  }
  return map[key] || 'lucide:file-text'
}
