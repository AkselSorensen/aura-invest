# Plan — Coffre-Fort (Vault) pour objets physiques

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Un espace dédié "coffre-fort" pour inventorier, documenter et suivre les objets physiques de valeur (collections, montres, art, or, immobilier physique, etc.), avec galerie multi-photos, localisation, état, QR code, documents et valeur d'assurance.

**Architecture:** Table `vault_items` dédiée (distincte de `investments`, mais liée optionnellement) + table `vault_images` (multi-images) + table `vault_documents` (certificats, factures). Page `/vault` avec grille visuelle façon galerie, page détail avec carrousel d'images, formulaire avec upload multiple. QR codes générés côté client via canvas.

**Tech Stack:** Même stack (Nuxt 3, Tailwind v4, GSAP, Neon PG, Vercel Blob pour les images)

---

## DB Schema

### Nouvelle table : `vault_items`

```sql
CREATE TABLE vault_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'objet',
  description TEXT DEFAULT '',
  acquisition_date DATE,
  acquisition_price NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  insured_value NUMERIC DEFAULT 0,
  location TEXT DEFAULT '',
  condition TEXT DEFAULT 'excellent',
  serial_number TEXT DEFAULT '',
  dimensions TEXT DEFAULT '',
  weight TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  qr_code_data TEXT DEFAULT '',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

### Nouvelle table : `vault_images`

```sql
CREATE TABLE vault_images (
  id SERIAL PRIMARY KEY,
  vault_item_id INTEGER REFERENCES vault_items(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

### Nouvelle table : `vault_documents`

```sql
CREATE TABLE vault_documents (
  id SERIAL PRIMARY KEY,
  vault_item_id INTEGER REFERENCES vault_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  doc_type TEXT DEFAULT 'other',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

### Catégories d'objets physiques

```json
[
  { "name": "Montres & Horlogerie", "slug": "watches", "icon": "lucide:watch", "color": "#C9A84C" },
  { "name": "Art & Tableaux", "slug": "art", "icon": "lucide:palette", "color": "#A855F7" },
  { "name": "Vins & Spiritueux", "slug": "wine", "icon": "lucide:wine", "color": "#DC2626" },
  { "name": "Voitures de collection", "slug": "cars", "icon": "lucide:car", "color": "#3B82F6" },
  { "name": "Bijoux", "slug": "jewelry", "icon": "lucide:gem", "color": "#EC4899" },
  { "name": "Mobilier & Design", "slug": "furniture", "icon": "lucide:armchair", "color": "#F97316" },
  { "name": "Livres & BD rares", "slug": "books", "icon": "lucide:book-open", "color": "#8B5CF6" },
  { "name": "Sneakers", "slug": "sneakers", "icon": "lucide:footprints", "color": "#14B8A6" },
  { "name": "Cartes (Pokémon, Magic...)", "slug": "cards", "icon": "lucide:credit-card", "color": "#F59E0B" },
  { "name": "Autre objet", "slug": "other", "icon": "lucide:archive", "color": "#71717A" }
]
```

Elles sont stockées en `metadata JSONB` sur le setup ou en constante côté frontend.

---

## Routes API

```
POST   /api/vault/setup
GET    /api/vault/items
POST   /api/vault/items
GET    /api/vault/items/[id]
PUT    /api/vault/items/[id]
DELETE /api/vault/items/[id]

POST   /api/vault/items/[id]/images
DELETE /api/vault/items/[id]/images/[imageId]

POST   /api/vault/items/[id]/documents
DELETE /api/vault/items/[id]/documents/[docId]
```

---

## Pages

```
/vault              → Grille galerie (tous les objets coffre-fort)
/vault/[id]         → Détail objet (carrousel photos, infos, documents, QR code)
```

Ajouter lien dans la sidebar : `{ to: '/vault', label: 'Coffre-fort', icon: 'lucide:vault' }`

---

## Phase 1 — Backend

### Task 1: Créer table `vault_items` + setup endpoint

**Files:** `server/api/vault/setup.post.ts`

**Objective:** Créer les tables `vault_items`, `vault_images`, `vault_documents`.

```ts
import { query } from '~~/server/utils/db'

export default defineEventHandler(async () => {
  await query(`CREATE TABLE IF NOT EXISTS vault_items (
    id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'other',
    description TEXT DEFAULT '', acquisition_date DATE,
    acquisition_price NUMERIC DEFAULT 0, current_value NUMERIC DEFAULT 0,
    insured_value NUMERIC DEFAULT 0, location TEXT DEFAULT '',
    condition TEXT DEFAULT 'excellent', serial_number TEXT DEFAULT '',
    dimensions TEXT DEFAULT '', weight TEXT DEFAULT '', notes TEXT DEFAULT '',
    qr_code_data TEXT DEFAULT '', metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`)
  await query(`CREATE TABLE IF NOT EXISTS vault_images (
    id SERIAL PRIMARY KEY, vault_item_id INTEGER REFERENCES vault_items(id) ON DELETE CASCADE,
    url TEXT NOT NULL, alt TEXT DEFAULT '', sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW())`)
  await query(`CREATE TABLE IF NOT EXISTS vault_documents (
    id SERIAL PRIMARY KEY, vault_item_id INTEGER REFERENCES vault_items(id) ON DELETE CASCADE,
    name TEXT NOT NULL, url TEXT NOT NULL, doc_type TEXT DEFAULT 'other',
    sort_order INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW())`)
  return { success: true }
})
```

### Task 2: CRUD `vault_items`

**Files:**
- `server/api/vault/items/index.get.ts`
- `server/api/vault/items/index.post.ts`
- `server/api/vault/items/[id].get.ts`
- `server/api/vault/items/[id].put.ts`
- `server/api/vault/items/[id].delete.ts`

Mêmes patterns que `investments` : `requireAuth`, ownership check, JOIN sur `vault_images` pour inclure les images dans le GET.

**GET all** : `SELECT vi.*, COALESCE(json_agg(vi2.*) FILTER (WHERE vi2.id IS NOT NULL), '[]') as images FROM vault_items vi LEFT JOIN vault_images vi2 ON vi2.vault_item_id = vi.id WHERE vi.user_id = $1 GROUP BY vi.id ORDER BY vi.created_at DESC`

**GET single** : même query + LEFT JOIN `vault_documents`.

### Task 3: Upload multi-images pour vault

**Files:** `server/api/vault/items/[id]/images.post.ts`

```ts
// POST — reçoit FormData avec { files: File[] } ou un seul file
// Upload chaque image vers Vercel Blob
// INSERT INTO vault_images (vault_item_id, url, alt, sort_order)
// Retourne { images: [...] }
```

**DELETE** : `server/api/vault/items/[id]/images/[imageId].delete.ts` — supprime du Blob + DB.

### Task 4: Upload documents pour vault

**Files:** 
- `server/api/vault/items/[id]/documents.post.ts`
- `server/api/vault/items/[id]/documents/[docId].delete.ts`

Même logique que les images mais stocke le type de document (`certificate`, `invoice`, `insurance`, `other`).

---

## Phase 2 — Frontend Pages

### Task 5: Page `/vault` — Grille galerie

**Files:** `app/pages/vault.vue`

**Design:** Grille de cartes avec photo en couverture, nom, catégorie (badge), localisation, valeur actuelle, état (point coloré).

```
┌──────────┐ ┌──────────┐ ┌──────────┐
│  [PHOTO] │ │  [PHOTO] │ │  [PHOTO] │
│          │ │          │ │          │
│ Rolex    │ │ Picasso  │ │ Vinyle   │
│ ● Montres│ │ ● Art   │ │ ● Musique│
│ 📍 Paris │ │ 📍 Cave │ │ 📍 Salon │
│ 15 000€  │ │ 50 000€  │ │ 800€     │
└──────────┘ └──────────┘ └──────────┘
```

Filtres par catégorie (pills horizontales), tri par date/valeur, barre de recherche.

Empty state : icône coffre-fort avec texte "Votre coffre-fort est vide".

### Task 6: Formulaire d'ajout vault item (modal)

**Files:** `app/components/VaultForm.vue`

Modal avec :
- Nom, catégorie (dropdown avec icônes), description
- Date d'acquisition, prix d'acquisition, valeur actuelle, valeur assurée
- Localisation, état (select : excellent/bon/moyen/restaurer), numéro de série
- Dimensions, poids, notes
- Zone upload multi-images (drag & drop, preview avant upload)
- Zone upload documents (certificat, facture, assurance)
- Génération QR code (optionnel — on le fait plus tard)

### Task 7: Page `/vault/[id]` — Détail objet

**Files:** `app/pages/vault/[id].vue`

**Layout :**
- **Header** : Nom, catégorie badge, boutons modifier/supprimer
- **Carrousel photos** : navigation gauche/droite, thumbnails en bas, lightbox au clic
- **Infos** : grille 2 colonnes avec icônes (prix, localisation, état, dimensions...)
- **Section documents** : liste des certificats/factures avec icône de téléchargement
- **QR Code** : canvas qui affiche un QR code contenant les infos de l'objet (pour étiquette physique)
- **Timeline** : historique des modifications de valeur

### Task 8: QR Code generator (client-side)

**Files:** `app/components/QrCode.vue`

Utiliser une lib légère comme `qrcode` (npm) pour générer un QR code en canvas.
Le QR code encode : nom de l'objet, ID, localisation, numéro de série.
Utilisateur peut l'imprimer et le coller sur l'objet physique.

```vue
<template>
  <canvas ref="canvasRef" class="w-40 h-40" />
  <button @click="download" class="...">Télécharger QR</button>
</template>

<script setup>
import QRCode from 'qrcode'
const canvasRef = ref()
onMounted(async () => {
  await QRCode.toCanvas(canvasRef.value, props.data, { width: 200, margin: 2 })
})
</script>
```

Install : `pnpm add qrcode && pnpm add -D @types/qrcode`

---

## Phase 3 — Intégration & Polish

### Task 9: Lien sidebar + navigation

**Files:** `app/components/Sidebar.vue`

Ajouter l'entrée :
```ts
{ to: '/vault', label: 'Coffre-fort', icon: 'lucide:vault' }
```

### Task 10: Widget dashboard "Coffre-fort"

**Files:** `app/pages/dashboard.vue`

Si l'utilisateur a des vault items, afficher un widget :
- Nombre d'objets
- Valeur totale assurée
- Derniers objets ajoutés (mini thumbnails)

### Task 11: GSAP animations

- Entrée stagger pour la grille vault
- Transition du carrousel photo (fade)
- Apparition du QR code (scale-in)
- Hover cards avec légère élévation

---

## Résumé des fichiers

| Action | Fichier |
|---|---|
| **Create** | `server/api/vault/setup.post.ts` |
| **Create** | `server/api/vault/items/index.get.ts` |
| **Create** | `server/api/vault/items/index.post.ts` |
| **Create** | `server/api/vault/items/[id].get.ts` |
| **Create** | `server/api/vault/items/[id].put.ts` |
| **Create** | `server/api/vault/items/[id].delete.ts` |
| **Create** | `server/api/vault/items/[id]/images.post.ts` |
| **Create** | `server/api/vault/items/[id]/images/[imageId].delete.ts` |
| **Create** | `server/api/vault/items/[id]/documents.post.ts` |
| **Create** | `server/api/vault/items/[id]/documents/[docId].delete.ts` |
| **Create** | `app/pages/vault.vue` |
| **Create** | `app/pages/vault/[id].vue` |
| **Create** | `app/components/VaultForm.vue` |
| **Create** | `app/components/QrCode.vue` |
| **Modify** | `app/components/Sidebar.vue` |
| **Modify** | `app/pages/dashboard.vue` |
| **Install** | `pnpm add qrcode && pnpm add -D @types/qrcode` |

---

## Ordre d'exécution

1. **Backend** (tâches 1-4) : tables, CRUD, upload images + documents
2. **Frontend** (tâches 5-8) : pages vault, formulaire, carrousel, QR code
3. **Intégration** (tâches 9-11) : sidebar, dashboard widget, animations
