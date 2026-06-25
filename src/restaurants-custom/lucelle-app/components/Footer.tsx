import type { Site } from '@/payload-types'

type Props = {
  site: Site
}

export function LucelleFooter({ site }: Props) {
  return (
    <footer className="lucelle-footer mt-auto px-6 py-6 text-sm">
      <p className="mb-2">
        <strong>{site.name}</strong> — restaurant démo Lucelle
      </p>
      <p className="opacity-80">12 rue des Lilas, Strasbourg · Ouvert du mardi au samedi</p>
    </footer>
  )
}
