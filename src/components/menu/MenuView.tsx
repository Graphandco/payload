/**
 * Affichage client de la carte : sections par catégorie et lignes produit
 * avec bouton d'ajout au panier (MenuProductRow).
 */
import { MenuProductRow } from '@/components/menu/MenuProductRow'
import type { MenuSection } from '@/lib/groupProductsByCategory'
import type { Site } from '@/payload-types'

type Props = {
  site: Site
  sections: MenuSection[]
}

export function MenuView({ site, sections }: Props) {
  if (sections.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-neutral-600">{site.name}</p>
        <h1 className="text-3xl font-semibold tracking-tight">La carte</h1>
        <p className="text-neutral-600">Aucun produit n&apos;est disponible pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        {/* <p className="text-sm text-neutral-600">{site.name}</p> */}
        <h1 className="text-3xl font-semibold tracking-tight">La carte</h1>
      </div>

      {sections.map((section) => {
        const title = section.category?.name ?? 'Autres'

        return (
          <section key={section.category?.id ?? 'other'}>
            <h2 className="menu-section-title">{title}</h2>
            {section.category?.description ? (
              <p className="mt-2 text-sm text-neutral-600">{section.category.description}</p>
            ) : null}
            <ul className="mt-4 list-none p-0">
              {section.products.map((product) => (
                <MenuProductRow key={product.id} siteId={site.id} product={product} />
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
