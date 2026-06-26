/**
 * Importe un fichier JSON de menu (catégories + produits) pour un site Payload.
 *
 * Usage :
 *   pnpm import:menu graphandco
 *   pnpm import:menu import/menu/graphandco.json
 *
 * Le fichier JSON doit contenir siteSlug, categories[] et products[].
 * Les slugs sont globalement uniques — préfixer par le slug du site (ex. graphandco-entrees).
 * description catégorie : texte brut (\n\n = paragraphes) ou état Lexical JSON.
 */
import 'dotenv/config'

import { resolveRichText, type RichTextImport } from '@/lib/import/resolveRichText'
import { slugify } from '@/lib/slug'
import config from '@payload-config'
import type { Category } from '@/payload-types'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { getPayload } from 'payload'

type MenuCategoryImport = {
  slug: string
  name: string
  description?: RichTextImport
}

type MenuProductImport = {
  slug: string
  name: string
  description?: string
  price: number
  category: string
}

type MenuImportFile = {
  siteSlug: string
  categories: MenuCategoryImport[]
  products: MenuProductImport[]
}

function resolveMenuFilePath(arg: string | undefined): string {
  if (!arg) {
    throw new Error('Argument requis : slug du site (ex. graphandco) ou chemin vers le JSON.')
  }

  if (arg.endsWith('.json')) {
    return resolve(process.cwd(), arg)
  }

  return resolve(process.cwd(), 'import/menu', `${arg}.json`)
}

function loadMenuFile(filePath: string): MenuImportFile {
  const raw = readFileSync(filePath, 'utf8')
  const data = JSON.parse(raw) as MenuImportFile

  if (!data.siteSlug || !Array.isArray(data.categories) || !Array.isArray(data.products)) {
    throw new Error('Format invalide : siteSlug, categories et products sont requis.')
  }

  return data
}

async function findBySlug<T extends 'categories' | 'products'>(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: T,
  slug: string,
) {
  const result = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })

  return result.docs[0] ?? null
}

async function run() {
  const filePath = resolveMenuFilePath(process.argv[2])
  const menu = loadMenuFile(filePath)

  const payload = await getPayload({ config })

  const siteResult = await payload.find({
    collection: 'sites',
    where: { slug: { equals: menu.siteSlug } },
    limit: 1,
    overrideAccess: true,
  })

  const site = siteResult.docs[0]
  if (!site) {
    throw new Error(`Site introuvable : ${menu.siteSlug}`)
  }

  const categoryIds = new Map<string, number>()

  for (const category of menu.categories) {
    const slug = slugify(category.slug)
    const data = {
      name: category.name,
      slug,
      site: site.id,
      description: resolveRichText(category.description),
    }

    const existing = await findBySlug(payload, 'categories', slug)
    const doc: Category = existing
      ? await payload.update({
          collection: 'categories',
          id: existing.id,
          data,
          overrideAccess: true,
        })
      : await payload.create({
          collection: 'categories',
          data,
          overrideAccess: true,
        })

    categoryIds.set(slug, doc.id)
    console.log(`${existing ? 'Mise à jour' : 'Création'} catégorie : ${category.name}`)
  }

  for (const product of menu.products) {
    const slug = slugify(product.slug)
    const categorySlug = slugify(product.category)
    const categoryId = categoryIds.get(categorySlug)

    if (!categoryId) {
      throw new Error(`Catégorie introuvable pour le produit ${product.name} : ${product.category}`)
    }

    const data = {
      name: product.name,
      slug,
      site: site.id,
      price: product.price,
      description: product.description?.trim() || undefined,
      categories: [categoryId],
    }

    const existing = await findBySlug(payload, 'products', slug)
    if (existing) {
      await payload.update({
        collection: 'products',
        id: existing.id,
        data,
        overrideAccess: true,
      })
      console.log(`Mise à jour produit : ${product.name}`)
    } else {
      await payload.create({
        collection: 'products',
        data,
        overrideAccess: true,
      })
      console.log(`Création produit : ${product.name}`)
    }
  }

  console.log(`Import terminé pour ${menu.siteSlug} (${menu.categories.length} catégories, ${menu.products.length} produits).`)
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
