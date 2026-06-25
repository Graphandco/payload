import type { Site } from '@/payload-types'

type Props = {
  site: Site
}

const sections = [
  {
    title: 'Entrées',
    items: [
      { name: 'Velouté de saison', price: '6,50 €' },
      { name: 'Salade du marché', price: '8,00 €' },
    ],
  },
  {
    title: 'Plats',
    items: [
      { name: 'Pavé de saumon', price: '18,50 €' },
      { name: 'Risotto aux champignons', price: '15,00 €' },
    ],
  },
  {
    title: 'Desserts',
    items: [
      { name: 'Tarte du jour', price: '7,00 €' },
      { name: 'Mousse au chocolat', price: '6,50 €' },
    ],
  },
]

export default function LucelleCartePage({ site }: Props) {
  return (
    <>
      <p style={{ marginTop: 0, opacity: 0.7 }}>Page custom — {site.name}</p>
      <h1 style={{ marginTop: '0.5rem' }}>La carte</h1>

      <p style={{ marginBottom: '2rem' }}>
        Exemple de page sur-mesure <code>/carte</code>. Les produits seront branchés sur Payload à
        l&apos;étape menu ; ici le contenu est statique pour illustrer le routing custom.
      </p>

      {sections.map((section) => (
        <section key={section.title} style={{ marginBottom: '2rem' }}>
          <h2 style={{ borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>{section.title}</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {section.items.map((item) => (
              <li
                key={item.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid #eee',
                }}
              >
                <span>{item.name}</span>
                <strong>{item.price}</strong>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}
