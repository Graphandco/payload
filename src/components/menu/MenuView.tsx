/**
 * Affichage client de la carte : navigation par catégorie (Tabs)
 * horizontal sticky sur mobile, vertical sticky sur desktop.
 */
'use client'

import { MenuProductRow } from '@/components/menu/MenuProductRow'
import { ClickAndCollectStatusBanner } from '@/components/click-and-collect/ClickAndCollectStatusBanner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useHeaderHeight } from '@/hooks/useHeaderHeight'
import type { MenuSection } from '@/lib/groupProductsByCategory'
import { cn } from '@/lib/utils'
import type { Category, Site } from '@/payload-types'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { useState, useSyncExternalStore } from 'react'

type Props = {
  site: Site
  sections: MenuSection[]
}

const MD_MEDIA_QUERY = '(min-width: 768px)'

function useIsDesktop() {
  return useSyncExternalStore(
    (onStoreChange) => {
      const media = window.matchMedia(MD_MEDIA_QUERY)
      media.addEventListener('change', onStoreChange)
      return () => media.removeEventListener('change', onStoreChange)
    },
    () => window.matchMedia(MD_MEDIA_QUERY).matches,
    () => false,
  )
}

function getSectionId(section: MenuSection): string {
  return section.category?.id != null ? String(section.category.id) : 'other'
}

function CategoryDescription({ description }: { description: Category['description'] }) {
  if (!description) {
    return null
  }

  return (
    <div className="menu-category-description mt-2 text-sm text-neutral-600">
      <RichText data={description} />
    </div>
  )
}

export function MenuView({ site, sections }: Props) {
  const isDesktop = useIsDesktop()
  const stickyTop = useHeaderHeight(10)
  const defaultTab = sections.length > 0 ? getSectionId(sections[0]) : ''
  const [activeTab, setActiveTab] = useState(defaultTab)

  if (sections.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 space-y-2 py-8 sm:py-12">
        <p className="text-sm text-neutral-600">{site.name}</p>
        <h1 className="text-4xl font-semibold tracking-tight">La carte</h1>
        <p className="text-neutral-600">Aucun produit n&apos;est disponible pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <h1 className="text-4xl font-semibold tracking-tight">La carte</h1>
      <div className="mt-4">
        <ClickAndCollectStatusBanner site={site} />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        orientation={isDesktop ? 'vertical' : 'horizontal'}
        className={cn('mt-8', isDesktop ? 'items-start gap-6 sm:gap-8 lg:gap-12' : 'gap-4')}
      >
        <TabsList
          variant="line"
          style={stickyTop > 0 ? { top: stickyTop } : undefined}
          className={cn(
            'sticky top-16 z-10 shrink-0',
            isDesktop
              ? 'w-36 self-start sm:w-40 lg:w-48'
              : '-mx-4 flex w-auto max-w-[100vw] overflow-x-auto border-b border-border bg-background/95 px-4 backdrop-blur-sm **:data-[slot=tabs-trigger]:shrink-0',
          )}
        >
          {sections.map((section) => (
            <TabsTrigger
              key={getSectionId(section)}
              value={getSectionId(section)}
              className="leading-loose text-primary"
            >
              {section.category?.name ?? 'Autres'}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="min-w-0 flex-1">
          {sections.map((section) => {
            const title = section.category?.name ?? 'Autres'

            return (
              <TabsContent key={getSectionId(section)} value={getSectionId(section)}>
                <section>
                  <h2 className="menu-section-title text-2xl font-semibold">{title}</h2>
                  <CategoryDescription description={section.category?.description} />
                  <ul className="mt-4 list-none p-0">
                    {section.products.map((product) => (
                      <MenuProductRow key={product.id} siteId={site.id} product={product} />
                    ))}
                  </ul>
                </section>
              </TabsContent>
            )
          })}
        </div>
      </Tabs>
    </div>
  )
}
