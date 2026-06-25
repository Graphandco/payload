# Payload — SaaS Click & Collect (multi-sites)

Plateforme Payload CMS 3 + Next.js 16 pour gérer plusieurs restaurants (sites) depuis une seule instance. Chaque site est accessible via son propre domaine grâce au middleware Next.js.

## Stack

- **Payload CMS 3** + **Next.js 16** (App Router)
- **PostgreSQL** (`@payloadcms/db-postgres`)
- **Docker** (build standalone en production)
- Reverse-proxy (Caddy) en prod pour les domaines custom

## Prérequis

- Node.js ≥ 20
- pnpm 10
- PostgreSQL (local ou Docker)
- Docker + réseau `web-network` (pour le déploiement VPS)

## Variables d'environnement

Créer un fichier `.env` à la racine :

```env
DATABASE_URL=postgres://USER:PASSWORD@127.0.0.1:5433/payload_db
PAYLOAD_SECRET=une-chaine-secrete-longue
```

## Développement local (recommandé)

```bash
pnpm install
pnpm dev
```

- Admin : [http://localhost:3000/admin](http://localhost:3000/admin)
- Au premier lancement, créer un utilisateur admin

### Routage multi-domaines (dev)

Le middleware intercepte le hostname et réécrit vers `app/(frontend)/[domain]/[[...slug]]/`.

| URL | Comportement |
|-----|--------------|
| `http://lucelle-app.localhost:3000` | Rewrite → `/lucelle-app` (slug = sous-domaine) |
| `http://localhost:3000/lucelle-app` | Accès direct sans middleware (même résultat) |
| `http://localhost:3000/admin` | Admin Payload (bypass middleware) |
| `http://localhost:3000/api/*` | API Payload (bypass) |

Les navigateurs modernes résolvent `*.localhost` vers `127.0.0.1` sans `/etc/hosts`.

En production, le domaine custom est stocké dans le champ `domain` de la collection `sites`. Le middleware dérive une clé de route sans point (ex. `pizzeria-mamma.fr` → `pizzeria-mamma-fr`).

En dev, le champ `domain` n'est pas utilisé pour le routage : seul le **slug** compte (`{slug}.localhost`). Le domaine sert en prod ou si tu testes via `/etc/hosts` (ex. `lucelle.com`).

### Résolution d'un site (tenant)

Quand une requête arrive sur le front, `getSiteByTenant()` cherche le site par :

1. Le header `x-tenant-domain` (hostname normalisé, ex. `lucelle-app.localhost`)
2. Le slug dérivé du hostname ou du segment `[domain]` dans l'URL

Le slug Payload doit donc correspondre au sous-domaine dev (`lucelle-app` → `lucelle-app.localhost`).

## Pages du front : CMS vs sur-mesure

Le routing hybride est géré dans `app/(frontend)/[domain]/[[...slug]]/page.tsx`.

```text
Requête entrante
       │
       ▼
  Site trouvé ? ──non──► 404
       │
      oui
       │
       ▼
  Chemin = / ou /accueil ?
       │
      oui ──► Page custom (restaurants-custom) ?
       │              │
       │             oui ──► Composant React sur-mesure
       │              │
       │             non ──► Page CMS slug « accueil » ?
       │                        │
       │                       oui ──► CmsPageView (blocs Payload)
       │                        │
       │                       non ──► Message « Aucune page d'accueil configurée »
       │
      non ──► Page custom (loadCustomPage) ?
                 │
                oui ──► Composant React sur-mesure
                 │
                non ──► Page CMS avec le slug du chemin (ex. contact)
                           │
                          trouvée ──► CmsPageView
                           │
                          absente ──► 404
```

### Pages CMS (éditoriales, par site)

Ce sont les pages gérées dans l'admin Payload, collection **Pages**. Chaque page est **rattachée à un site** (champ `site`) : le contenu est propre à chaque restaurant, mais l'**URL est la même structure** pour tous.

| Concept | Détail |
|---------|--------|
| Où les créer | Admin → Pages → Nouvelle page |
| Champ `site` | Le restaurant concerné (auto-rempli pour les éditeurs) |
| Champ `slug` | Identifiant d'URL (généré depuis le titre, modifiable) |
| Champ `layout` | Blocs de contenu (texte, image, galerie, etc.) |
| Rendu front | `CmsPageView` + `RenderBlocks` |

#### Créer une page « globale » (menu, contact, mentions légales…)

« Globale » signifie ici : **même chemin d'URL pour chaque site** (`/menu`, `/contact`, `/mentions-legales`), avec un **contenu différent par restaurant**.

**Étapes pour chaque site :**

1. Se connecter à l'admin (ou se connecter en tant qu'éditeur du site)
2. Aller dans **Pages** → **Créer**
3. Renseigner :
   - **Site** : `lucelle-app`, `graphandco`, etc.
   - **Titre** : ex. « Menu », « Contact », « Mentions légales »
   - **Slug** : `menu`, `contact`, `mentions-legales` (sans slash, en kebab-case)
4. Composer le contenu dans l'onglet **Contenu** (blocs)
5. Publier / enregistrer

**URLs résultantes (exemple site `lucelle-app`) :**

| Slug CMS | URL dev | URL prod (si domain = `lucelle.com`) |
|----------|---------|--------------------------------------|
| `menu` | `http://lucelle-app.localhost:3000/menu` | `https://lucelle.com/menu` |
| `contact` | `http://lucelle-app.localhost:3000/contact` | `https://lucelle.com/contact` |
| `mentions-legales` | `http://lucelle-app.localhost:3000/mentions-legales` | `https://lucelle.com/mentions-legales` |
| `accueil` | utilisé si pas de page custom | idem |

> **Convention de slugs** : utiliser les mêmes slugs (`menu`, `contact`, `mentions-legales`) sur tous les sites pour garder des URLs homogènes. Le contenu reste éditable indépendamment par site dans l'admin.

> **Accueil sans page custom** : créer une page avec le slug `accueil`. Elle s'affiche sur `/` uniquement si aucune page sur-mesure n'est enregistrée pour ce site (voir ci-dessous).

#### Blocs disponibles

| Bloc | Usage |
|------|-------|
| `simpleText` | Paragraphe court |
| `simpleParagraph` | Paragraphe |
| `formattedText` | Texte riche (Lexical) |
| `image` | Image unique |
| `gallery` | Galerie d'images |
| `conditionalRepeater` | Liste de champs texte / textarea |

Le rendu est dans `src/components/cms/RenderBlocks.tsx`. Pour un nouveau type de bloc, l'ajouter dans `src/blocks/` puis dans la collection `Pages` et dans `RenderBlocks`.

---

### Pages sur-mesure (React, design custom)

Pour une expérience 100 % code (layout, animations, composants spécifiques), on place des composants React dans `src/restaurants-custom/{slug}/`.

Le **slug du dossier = le slug Payload du site** (ex. `lucelle-app`, pas `lucelle`).

```text
src/restaurants-custom/
└── lucelle-app/
    └── page.tsx          # Accueil custom (déjà branché)
```

#### Accueil sur-mesure (ex. `lucelle-app`)

**1. Créer le composant**

```tsx
// src/restaurants-custom/lucelle-app/page.tsx
import type { Site } from '@/payload-types'

type Props = {
  site: Site
}

export default function LucelleHomePage({ site }: Props) {
  return (
    <main>
      <h1>{site.name}</h1>
      {/* design libre : sections, composants, fetch API… */}
    </main>
  )
}
```

Le composant reçoit `site` (nom, slug, domain, id…) pour personnaliser l'affichage.

**2. Enregistrer le loader**

Dans `src/lib/loadCustomHome.ts`, ajouter une entrée dont la **clé = slug Payload** :

```ts
const customHomeLoaders: Record<string, () => Promise<{ default: CustomHomePage }>> = {
  'lucelle-app': () => import('@/restaurants-custom/lucelle-app/page'),
  // 'graphandco': () => import('@/restaurants-custom/graphandco/page'),
}
```

**3. Tester**

- `http://lucelle-app.localhost:3000/` → page custom
- Les autres chemins (`/contact`…) passent par le CMS, sauf pages custom enregistrées (voir ci-dessous)

Priorité à l'accueil : **custom** → CMS `accueil` → message par défaut.

#### Autre page sur-mesure (ex. `/carte`, `/presentation`)

Pour une page interne en React (hors accueil), utiliser `loadCustomPage.ts` — branché dans `[[...slug]]/page.tsx` **avant** la recherche CMS.

**Exemple en place : `/carte` pour `lucelle-app`**

**1. Créer le composant**

```text
src/restaurants-custom/lucelle-app/carte/page.tsx
```

**2. Enregistrer dans `loadCustomPage.ts`**

```ts
const customPageLoaders: Record<string, Record<string, CustomPageLoader>> = {
  'lucelle-app': {
    carte: () => import('@/restaurants-custom/lucelle-app/carte/page'),
  },
}
```

**3. Tester**

- `http://lucelle-app.localhost:3000/carte` → page custom
- Si aucune page custom pour ce chemin → fallback CMS (slug `carte`) → sinon 404

| Option | Quand l'utiliser |
|--------|------------------|
| **Page CMS** | Contenu éditorial, blocs standards |
| **`loadCustomPage`** | Design ou logique spécifique (ex. carte interactive avant branchement produits Payload) |

Priorité pour les chemins non-accueil : **custom** (`loadCustomPage`) → **CMS** → 404.

```text
src/restaurants-custom/
├── lucelle-app/
│   ├── page.tsx              # Accueil → loadCustomHome
│   └── carte/
│       └── page.tsx          # /carte → loadCustomPage
└── graphandco/
    └── presentation/
        └── page.tsx          # /presentation → loadCustomPage (à ajouter)
```

#### Checklist : nouveau restaurant avec accueil custom

- [ ] Site créé dans Payload (`slug` unique, ex. `mon-restaurant`)
- [ ] Dossier `src/restaurants-custom/mon-restaurant/page.tsx`
- [ ] Entrée `'mon-restaurant'` dans `loadCustomHome.ts`
- [ ] Pages CMS créées pour ce site (`menu`, `contact`, etc.)
- [ ] Test dev : `http://mon-restaurant.localhost:3000`

### Sites (collection)

| Champ | Rôle |
|-------|------|
| `name` | Nom affiché |
| `slug` | Identifiant technique unique (`mamma`) — utilisé en dev comme `{slug}.localhost` |
| `domain` | Domaine custom en prod (ex. `pizzeria-mamma.fr`), optionnel en dev |

**Accès :**
- Visiteurs (front) : lecture publique
- Éditeurs : uniquement leurs sites assignés
- Admins : tous les sites

## Structure du projet

```text
src/
├── app/
│   ├── (payload)/              # Admin + API Payload
│   └── (frontend)/             # Front multi-sites
│       └── [domain]/
│           └── [[...slug]]/    # Routing hybride (CMS + custom)
├── collections/                # Sites, Users, Pages, Products, etc.
├── components/
│   ├── admin/                  # Composants custom admin Payload
│   └── cms/                    # CmsPageView, RenderBlocks
├── restaurants-custom/         # Pages React sur-mesure par site
│   └── {slug}/
│       └── page.tsx            # Accueil custom
├── lib/
│   ├── siteAccess.ts           # Accès scopé par site
│   ├── siteDomain.ts           # Helpers domaine (dev/prod)
│   ├── getSiteByTenant.ts      # Résolution du site depuis le hostname
│   ├── getPageBySiteAndSlug.ts # Récupération page CMS
│   ├── loadCustomHome.ts       # Registry des accueils custom
│   └── loadCustomPage.ts       # Registry des pages custom (carte, etc.)
├── migrations/                 # Migrations Postgres (prod)
└── middleware.ts               # Routage par hostname
```

## Scripts

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Serveur de dev (push schéma auto) |
| `pnpm devsafe` | Dev avec cache `.next` vidé |
| `pnpm build` | Build production Next.js |
| `pnpm generate:types` | Régénère `payload-types.ts` |
| `pnpm generate:importmap` | Régénère l'import map admin (après composant custom) |
| `pnpm migrate` | Applique les migrations en attente |
| `pnpm migrate:create` | Crée une migration après modif de collection |
| `pnpm migrate:status` | État des migrations |
| `pnpm deploy` | Deploy local via `scripts/deploy.sh` (Docker) |

## Migrations base de données

### Principe

| Environnement | Mécanisme |
|---------------|-----------|
| **Dev** (`pnpm dev`) | `push: true` — Payload synchronise le schéma automatiquement |
| **Prod** (Docker) | `push: false` — seules les migrations dans `src/migrations/` modifient la base |

Payload enregistre les migrations appliquées dans la table `payload_migrations`.

### Workflow : modifier le schéma

1. Modifier une collection en local (`src/collections/…`)
2. Lancer `pnpm dev` pour valider (push auto en dev)
3. Générer la migration :
   ```bash
   pnpm migrate:create
   ```
4. **Relire** le fichier généré dans `src/migrations/` — vérifier qu'il est incrémental (`ALTER TABLE`, `ADD COLUMN`) et non une recréation complète du schéma
5. Mettre à jour `src/migrations/index.ts` si nécessaire (souvent fait automatiquement)
6. Commit + push

### Migrations actuelles

| Fichier | Description |
|---------|-------------|
| `20260624_000000_baseline` | Point de départ (no-op) pour les déploiements existants |
| `20260624_000001_add_site_domain` | Ajoute `domain` + index uniques sur `slug` et `domain` |

### Tester les migrations en local

```bash
pnpm migrate:status
pnpm migrate
```

## Docker

### Dev local avec container

```bash
cp docker-compose.override.example.yml docker-compose.override.yml
# Adapter DATABASE_URL dans l'override (réseau Docker vs hôte)
docker compose up -d --build
```

> **Note :** En dev local, préférer `pnpm dev` pour bénéficier du hot-reload. Le container Docker pointe souvent vers une base différente de celle du `.env` local — les utilisateurs admin ne seront pas les mêmes.

Pour aligner Docker sur la même base que `pnpm dev`, utiliser `host.docker.internal:5433` dans l'override à la place de `postgres-main:5432`.

### Production (VPS)

**Ne pas** lancer uniquement `docker compose up --build` — les migrations ne s'exécutent pas.

```bash
git pull
bash scripts/deploy.sh
```

Le script `scripts/deploy.sh` :

1. Build l'image Docker cible `migrate`
2. Exécute `payload migrate` dans un container temporaire
3. Build et démarre l'application (`docker compose up -d --build`)

Aucun `pnpm` requis sur le VPS — tout passe par Docker.

Variables optionnelles pour `deploy.sh` :

```bash
COMPOSE_NETWORK=web-network bash scripts/deploy.sh
```

### Dockerfile — cibles

| Cible | Usage |
|-------|-------|
| `migrate` | Container éphémère pour `payload migrate` |
| `runner` (défaut) | Image production standalone (`node server.js`) |

## Déploiement

1. Pousser le code sur le dépôt
2. Sur le VPS :
   ```bash
   cd /var/www/docker-stack/payload
   git pull
   bash scripts/deploy.sh
   ```
3. Vérifier les logs :
   ```bash
   docker logs payload --tail 50
   ```

### Checklist après un changement de schéma

- [ ] Migration créée et relue (`pnpm migrate:create`)
- [ ] `src/migrations/index.ts` à jour
- [ ] Commit + push
- [ ] `bash scripts/deploy.sh` sur le VPS
- [ ] Admin fonctionnel, pas d'erreur `column does not exist` dans les logs

## Collections principales

| Collection | Description |
|------------|-------------|
| `sites` | Restaurants / tenants |
| `users` | Admins et éditeurs (accès scopé par site) |
| `pages` | Pages CMS avec blocs |
| `products` | Produits (scopés par site) |
| `categories` | Catégories (scopées par site) |
| `media` | Uploads (scopés par site) |

## Médias

Les fichiers uploadés sont montés via Docker :

```yaml
volumes:
  - ./media:/app/media
```

## Ressources

- [Documentation Payload](https://payloadcms.com/docs)
- [Migrations Postgres Payload](https://payloadcms.com/docs/database/migrations)
