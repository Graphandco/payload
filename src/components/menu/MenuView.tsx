import { formatPrice } from '@/lib/formatPrice'
import type { MenuSection } from '@/lib/groupProductsByCategory'
import type { Media, Product, Site } from '@/payload-types'
import Image from 'next/image'

type Props = {
  site: Site
  sections: MenuSection[]
}

function resolveMedia(media: number | Media | null | undefined): Media | null {
  return typeof media === 'object' && media !== null ? media : null
}

function ProductRow({ product }: { product: Product }) {
  const image = resolveMedia(product.featuredImage)

  return (
    <li className="menu-item flex items-center gap-4 border-b py-3">
      {image?.url ? (
        <Image
          src={image.url}
          alt={image.alt ?? product.name}
          width={56}
          height={56}
          className="size-14 shrink-0 rounded object-cover"
        />
      ) : null}
      <div className="flex flex-1 items-center justify-between gap-4">
        <span className="font-medium">{product.name}</span>
        <strong className="menu-price shrink-0">{formatPrice(product.price)}</strong>
      </div>
    </li>
  )
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
        <p className="text-sm text-neutral-600">{site.name}</p>
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
                <ProductRow key={product.id} product={product} />
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
