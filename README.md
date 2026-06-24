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

Le middleware intercepte le hostname et réécrit vers `app/(frontend)/[domain]/`.

| URL | Comportement |
|-----|--------------|
| `http://mamma.localhost:3000` | Rewrite → `/mamma` (slug = sous-domaine) |
| `http://localhost:3000/admin` | Admin Payload (bypass middleware) |
| `http://localhost:3000/api/*` | API Payload (bypass) |

Les navigateurs modernes résolvent `*.localhost` vers `127.0.0.1` sans `/etc/hosts`.

En production, le domaine custom est stocké dans le champ `domain` de la collection `sites`. Le middleware dérive une clé de route sans point (ex. `pizzeria-mamma.fr` → `pizzeria-mamma-fr`).

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
│   ├── (payload)/          # Admin + API Payload
│   └── (frontend)/         # Front multi-sites
│       └── [domain]/       # Page tenant (rewrite middleware)
├── collections/            # Sites, Users, Pages, Products, etc.
├── components/admin/       # Composants custom admin Payload
├── lib/
│   ├── siteAccess.ts       # Accès scopé par site
│   └── siteDomain.ts       # Helpers domaine (dev/prod)
├── migrations/             # Migrations Postgres (prod)
└── middleware.ts           # Routage par hostname
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
