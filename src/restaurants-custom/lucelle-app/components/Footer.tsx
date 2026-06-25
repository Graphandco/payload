import type { Site } from '@/payload-types'

type Props = {
  site: Site
}

export function LucelleFooter({ site }: Props) {
  return (
    <footer
      style={{
        marginTop: 'auto',
        padding: '1.5rem',
        borderTop: '1px solid #ddd',
        background: '#1a1a1a',
        color: '#f5f5f5',
        fontSize: '0.875rem',
      }}
    >
      <p style={{ margin: '0 0 0.5rem' }}>
        <strong>{site.name}</strong> — restaurant démo Lucelle
      </p>
      <p style={{ margin: 0, opacity: 0.8 }}>
        12 rue des Lilas, Strasbourg · Ouvert du mardi au samedi
      </p>
    </footer>
  )
}
