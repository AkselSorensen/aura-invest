# Plan — Gestion par classe d'actifs (Private Equity first)

> **For Hermes:** Plan only — no code execution in this turn.

**Goal:** Chaque classe d'actifs a ses propres champs métier et une vue dédiée. On commence par Private Equity comme pilote, puis on étend aux autres catégories.

**Architecture:** Une colonne `metadata JSONB` dans la table `investments` stocke les champs spécifiques à chaque catégorie. Le frontend charge le schéma de métadonnées selon la catégorie sélectionnée et affiche dynamiquement les champs + la vue détail adaptée.

**Tech Stack:** PostgreSQL JSONB, Nuxt 3 (formulaires dynamiques), API existante (PUT modifié pour accepter `metadata`)

---

## Approche technique

### Problème
Le système actuel traite tous les investissements de la même façon : nom, valeur, prix d'achat, quantité. Mais un investissement en Private Equity n'a rien à voir avec de l'or physique ou une crypto.

### Solution
On ajoute une colonne `metadata JSONB` à la table `investments` qui stocke les champs propres à chaque catégorie. Exemple :

```
Private Equity → { company, stage, equity_pct, moic, exit_status, invested_amount }
Immobilier    → { address, surface, rental_income, property_tax, rooms }
Crypto        → { token, blockchain, staking_apy, wallet_address }
Métaux        → { metal_type, weight_grams, purity, storage_location }
```

### Avantages
- **Pas de tables supplémentaires** — une seule colonne JSONB
- **Flexible** — chaque catégorie a son propre schéma sans migration
- **Rétrocompatible** — les investissements existants restent valides (metadata = null)
- **Simple à étendre** — ajouter une nouvelle catégorie = définir son schéma JS

---

## Phase 1 — Infrastructure

### Task 1: Ajouter colonne `metadata JSONB` à la table investments

**Files:** `server/api/auth/setup.post.ts`

```sql
ALTER TABLE investments ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'
```

Ajouter cette ligne dans le setup existant + créer une migration rapide via l'endpoint.

### Task 2: Définir les schémas de métadonnées par catégorie

**Files:** `app/data/categorySchemas.ts` (nouveau)

Un fichier qui exporte un objet `CATEGORY_SCHEMAS` :

```ts
export interface CategoryField {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'date' | 'currency' | 'percent'
  options?: { value: string; label: string }[]
  placeholder?: string
  required?: boolean
  hint?: string
}

export const CATEGORY_SCHEMAS: Record<string, CategoryField[]> = {
  'private-equity': [
    { key: 'company', label: 'Société', type: 'text', required: true, placeholder: 'Nom de la startup' },
    { key: 'stage', label: 'Stade', type: 'select', required: true, options: [
      { value: 'seed', label: 'Seed' },
      { value: 'series_a', label: 'Série A' },
      { value: 'series_b', label: 'Série B' },
      { value: 'series_c', label: 'Série C+' },
      { value: 'growth', label: 'Growth' },
      { value: 'pre_ipo', label: 'Pré-IPO' },
    ]},
    { key: 'equity_pct', label: '% Equity', type: 'percent', placeholder: '5.0' },
    { key: 'invested_amount', label: 'Montant investi (€)', type: 'currency', placeholder: '50000' },
    { key: 'current_valuation', label: 'Valorisation actuelle (€)', type: 'currency', placeholder: '200000' },
    { key: 'moic', label: 'MOIC', type: 'number', placeholder: '2.5x', hint: 'Multiple on Invested Capital' },
    { key: 'exit_status', label: 'Statut de sortie', type: 'select', options: [
      { value: 'active', label: 'Actif' },
      { value: 'exited', label: 'Sorti (IPO/acquisition)' },
      { value: 'written_off', label: 'Pertes (write-off)' },
    ]},
    { key: 'exit_value', label: 'Valeur de sortie (€)', type: 'currency', placeholder: '500000' },
    { key: 'investment_date', label: 'Date d\'investissement', type: 'date' },
    { key: 'fund', label: 'Fonds / Véhicule', type: 'text', placeholder: 'Fonds propres, holding...' },
  ],
  'immobilier': [
    { key: 'address', label: 'Adresse', type: 'text', required: true },
    { key: 'surface', label: 'Surface (m²)', type: 'number' },
    { key: 'rooms', label: 'Pièces', type: 'number' },
    { key: 'rental_income', label: 'Revenu locatif / mois (€)', type: 'currency' },
    { key: 'property_tax', label: 'Taxe foncière / an (€)', type: 'currency' },
    { key: 'purchase_date', label: 'Date d\'acquisition', type: 'date' },
    { key: 'type', label: 'Type de bien', type: 'select', options: [
      { value: 'apartment', label: 'Appartement' },
      { value: 'house', label: 'Maison' },
      { value: 'land', label: 'Terrain' },
      { value: 'commercial', label: 'Commercial' },
      { value: 'parking', label: 'Parking' },
    ]},
  ],
}
```

Schémas à prévoir dans le plan : Private Equity (complet ci-dessus), Immobilier, Crypto, Actions/ETF, Métaux, Objets de collection, Épargne, Autre.

### Task 3: Mettre à jour les endpoints API pour supporter `metadata`

**Files:**
- `server/api/investments/index.post.ts`
- `server/api/investments/[id].put.ts`

Ajouter `metadata` dans les requêtes INSERT et UPDATE :

```ts
// POST
INSERT INTO investments (..., metadata) VALUES (..., $12::jsonb)

// PUT
UPDATE investments SET ..., metadata = COALESCE($10::jsonb, metadata), ...
```

Retourner `metadata` dans les GET (déjà couvert par `SELECT i.*`).

---

## Phase 2 — Frontend Private Equity

### Task 4: Formulaire dynamique par catégorie

**Files:** `app/components/InvestmentForm.vue`

Quand l'utilisateur sélectionne une catégorie, charger le schéma correspondant depuis `CATEGORY_SCHEMAS` et afficher les champs supplémentaires :

```
Sélection catégorie → load schema → render fields dans un bloc <template v-for>
```

Exemple de rendu :

```vue
<div v-if="selectedSchema.length > 0" class="border-t border-surface-500 pt-4 mt-4">
  <h3 class="text-sm font-semibold text-text mb-3 flex items-center gap-2">
    <Icon :icon="selectedCategory?.icon || 'lucide:file-text'" class="w-4 h-4 text-gold" />
    Détails {{ selectedCategory?.name }}
  </h3>
  <div class="grid grid-cols-2 gap-3">
    <template v-for="field in selectedSchema" :key="field.key">
      <!-- text -->
      <div v-if="field.type === 'text'" :class="field.key === 'company' || field.key === 'address' ? 'col-span-2' : ''">
        <label>{{ field.label }}</label>
        <input v-model="metadata[field.key]" />
      </div>
      <!-- select -->
      <!-- number/currency/percent -->
      ...
    </template>
  </div>
</div>
```

### Task 5: Vue détail enrichie par catégorie

**Files:** `app/pages/investments/[id].vue`

Après les champs génériques (valeur, prix d'achat, etc.), afficher les métadonnées spécifiques :

```vue
<div v-if="investment.metadata && Object.keys(investment.metadata).length > 0"
     class="mt-6 pt-5 border-t border-surface-500">
  <h3 class="text-sm font-semibold mb-4 flex items-center gap-2">
    <Icon icon="lucide:file-text" class="w-4 h-4 text-gold" />
    Détails {{ investment.category_name }}
  </h3>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
    <div v-for="(value, key) in investment.metadata" :key="key" class="flex items-start gap-2.5">
      <div class="w-8 h-8 rounded-lg bg-surface-500 flex items-center justify-center shrink-0">
        <Icon :icon="getFieldIcon(key)" class="w-4 h-4 text-text-600" />
      </div>
      <div>
        <div class="text-[10px] text-text-700 uppercase tracking-wider">{{ formatFieldLabel(key) }}</div>
        <div class="text-text text-sm">{{ formatFieldValue(key, value) }}</div>
      </div>
    </div>
  </div>
</div>
```

### Task 6: Widget spécifique Private Equity sur le dashboard

**Files:** `app/pages/dashboard.vue`

Si l'utilisateur a des investissements PE, afficher un widget dédié :
- Nombre de participations actives
- MOIC moyen
- Valorisation totale vs montant investi
- Statut des sorties (actif/exited/write-off)

```vue
<div v-if="peInvestments.length > 0" class="glass p-5">
  <h3 class="text-sm font-semibold flex items-center gap-2 mb-4">
    <Icon icon="lucide:briefcase" class="w-4 h-4 text-pink-400" />
    Private Equity
  </h3>
  <!-- KPIs -->
</div>
```

---

## Phase 3 — Extension aux autres catégories

Même pattern pour chaque catégorie : définir le schéma → formulaire dynamique → vue détail → widget dashboard.

| Catégorie | Champs clés |
|---|---|
| Immobilier | adresse, surface, revenu locatif, taxe foncière, pièces |
| Crypto | token, blockchain, staking APY, adresse wallet |
| Actions/ETF | ticker, ISIN, dividend yield, secteur |
| Métaux | type (or/argent/...), poids (g), pureté, stockage |
| Objets collection | état, certificat, estimation, date acquisition |

---

## Résumé des fichiers à créer/modifier

| Action | Fichier |
|---|---|
| **Create** | `app/data/categorySchemas.ts` |
| **Modify** | `server/api/auth/setup.post.ts` (+ colonne metadata) |
| **Modify** | `server/api/investments/index.post.ts` (+ metadata) |
| **Modify** | `server/api/investments/[id].put.ts` (+ metadata) |
| **Modify** | `app/components/InvestmentForm.vue` (champs dynamiques) |
| **Modify** | `app/pages/investments/[id].vue` (vue détail enrichie) |
| **Modify** | `app/pages/dashboard.vue` (widget PE) |

---

## Ordre d'exécution

1. Infrastructure (DB + API + schémas) → tâches 1-3
2. Frontend Private Equity (formulaire + détail + dashboard) → tâches 4-6
3. Autres catégories (immobilier, crypto, etc.) → tâches futures
