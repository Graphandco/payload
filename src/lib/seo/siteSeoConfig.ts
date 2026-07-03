/**
 * SEO et PWA par site (slug Payload). Valeurs en dur jusqu'à édition CMS.
 */
export type IndexablePageKey = 'home' | 'carte' | 'contact'

export type SiteSeoPageConfig = {
  title?: string
  description?: string
}

export type SiteSeoConfig = {
  defaultTitle: string
  defaultDescription: string
  shortName: string
  themeColor: string
  backgroundColor: string
  /** Dossier public des icônes PWA / OG, ex. /sites/graphandco */
  brandingPath: string
  pages: Partial<Record<IndexablePageKey, SiteSeoPageConfig>>
}

const PLATFORM_DEFAULTS: SiteSeoConfig = {
  defaultTitle: 'Click & Collect',
  defaultDescription: 'Commandez en ligne et retirez votre commande au restaurant.',
  shortName: 'Click & Collect',
  themeColor: '#0d7a5b',
  backgroundColor: '#f4fdfa',
  brandingPath: '/sites/default',
  pages: {
    home: {
      title: 'Accueil',
      description: 'Commandez en ligne et retirez votre commande au restaurant.',
    },
    carte: {
      title: 'Carte',
      description: 'Découvrez la carte et commandez en click & collect.',
    },
    contact: {
      title: 'Contact',
      description: 'Coordonnées et formulaire de contact du restaurant.',
    },
  },
}

const SITE_SEO_OVERRIDES: Record<string, Partial<SiteSeoConfig>> = {
  graphandco: {
    defaultTitle: 'You Click You Collect — Click & collect pour restaurants',
    defaultDescription:
      'Plateforme click & collect pour restaurants : commande en ligne, paiement et retrait sur place.',
    shortName: 'YCYC',
    themeColor: '#0d7a5b',
    backgroundColor: '#f4fdfa',
    brandingPath: '/sites/graphandco',
    pages: {
      home: {
        title: 'Click & collect pour restaurants',
        description:
          'You Click You Collect : la solution click & collect clé en main pour les restaurateurs.',
      },
      carte: {
        title: 'Démo — Carte',
        description: 'Exemple de carte en ligne pour la démo You Click You Collect.',
      },
      contact: {
        title: 'Contact',
        description: 'Contactez Graph and Co pour une démo de la plateforme click & collect.',
      },
    },
  },
  'lucelle-app': {
    defaultTitle: 'Lucelle — Click & collect',
    defaultDescription: 'Commandez vos plats Lucelle en ligne et retirez-les au restaurant.',
    shortName: 'Lucelle',
    themeColor: '#1a5c4a',
    backgroundColor: '#faf7f2',
    brandingPath: '/sites/lucelle-app',
    pages: {
      home: {
        title: 'Bienvenue chez Lucelle',
        description: 'Cuisine italienne à emporter — commandez en quelques clics.',
      },
      carte: {
        title: 'Notre carte',
        description: 'Pizzas, pâtes, entrées et desserts — commandez en click & collect.',
      },
      contact: {
        title: 'Nous contacter',
        description: 'Adresse, horaires et formulaire de contact du restaurant Lucelle.',
      },
    },
  },
}

export function getSiteSeoConfig(siteSlug: string): SiteSeoConfig {
  const override = SITE_SEO_OVERRIDES[siteSlug] ?? {}

  return {
    ...PLATFORM_DEFAULTS,
    ...override,
    pages: {
      ...PLATFORM_DEFAULTS.pages,
      ...override.pages,
    },
  }
}
