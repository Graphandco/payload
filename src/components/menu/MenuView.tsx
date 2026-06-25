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
    <li
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.75rem 0',
        borderBottom: '1px solid #eee',
      }}
    >
      {image?.url ? (
        <Image
          src={image.url}
          alt={image.alt ?? product.name}
          width={56}
          height={56}
          style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 4 }}
        />
      ) : null}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
        <span>{product.name}</span>
        <strong>{formatPrice(product.price)}</strong>
      </div>
    </li>
  )
}

export function MenuView({ site, sections }: Props) {
  if (sections.length === 0) {
    return (
      <>
        <p style={{ marginTop: 0, opacity: 0.7 }}>{site.name}</p>
        <h1 style={{ marginTop: '0.5rem' }}>La carte</h1>
        <p>Aucun produit n&apos;est disponible pour le moment.</p>
      </>
    )
  }

  return (
    <>
      <p style={{ marginTop: 0, opacity: 0.7 }}>{site.name}</p>
      <h1 style={{ marginTop: '0.5rem' }}>La carte</h1>

      {sections.map((section) => {
        const title = section.category?.name ?? 'Autres'

        return (
          <section key={section.category?.id ?? 'other'} style={{ marginBottom: '2rem' }}>
            <h2 style={{ borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>{title}</h2>
            {section.category?.description ? (
              <p style={{ opacity: 0.8, marginTop: '0.5rem' }}>{section.category.description}</p>
            ) : null}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {section.products.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}
