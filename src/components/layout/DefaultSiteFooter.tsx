import type { Site } from '@/payload-types'

type Props = {
  site: Site
}

export function DefaultSiteFooter({ site }: Props) {
  return (
    <footer className="default-footer mt-auto">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 sm:px-6 sm:py-10">
        <p className="font-serif text-lg font-medium">{site.name}</p>
        <p className="default-footer-accent text-sm">
          Cuisine italienne · Click &amp; Collect
        </p>
        <p className="default-footer-accent text-xs opacity-80">
          © {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  )
}
