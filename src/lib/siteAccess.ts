import type { Access } from 'payload'

const SUPER_ADMIN_EMAIL = 'contact@graphandco.com'

export const isSuperAdmin = (user: any): boolean => user?.email === SUPER_ADMIN_EMAIL

export const getUserSiteIDs = (user: any): (number | string)[] => {
  if (!Array.isArray(user?.sites)) {
    return []
  }

  return user.sites
    .map((site: any) => (typeof site === 'object' && site !== null ? site.id : site))
    .filter(Boolean)
}

export const getDefaultUserSiteID = (user: any): number | string | null => {
  const siteIDs = getUserSiteIDs(user)
  return siteIDs.length > 0 ? siteIDs[0] : null
}

export const buildSiteScopedConstraint = (siteIDs: (number | string)[], siteField = 'site') => ({
  [siteField]: {
    in: siteIDs,
  },
})

export const hasVisibleDocsForSites = async (
  req: any,
  collection: string,
  siteIDs: (number | string)[],
  siteField = 'site',
): Promise<boolean> => {
  const result = await req.payload.find({
    collection,
    where: buildSiteScopedConstraint(siteIDs, siteField),
    limit: 1,
    depth: 0,
    pagination: false,
    overrideAccess: true,
  })

  return result.docs.length > 0
}

export const createSiteScopedReadAccess = (siteField = 'site'): Access => {
  return ({ req }) => {
    if (!req.user) {
      return false
    }

    if (isSuperAdmin(req.user)) {
      return true
    }

    const siteIDs = getUserSiteIDs(req.user)
    if (siteIDs.length === 0) {
      return false
    }

    return buildSiteScopedConstraint(siteIDs, siteField)
  }
}

export const createSiteScopedManageAccess = (siteField = 'site'): Access => {
  return ({ req }) => {
    if (!req.user) {
      return false
    }

    if (isSuperAdmin(req.user)) {
      return true
    }

    const siteIDs = getUserSiteIDs(req.user)
    if (siteIDs.length === 0) {
      return false
    }

    return buildSiteScopedConstraint(siteIDs, siteField)
  }
}

export const createHideWhenEmptyReadAccess = (baseRead: Access, collection: string, siteField = 'site'): Access => {
  return async ({ req }) => {
    const readAccess = await baseRead({ req })

    if (readAccess !== true && readAccess !== false) {
      const siteIDs = getUserSiteIDs(req.user)
      if (siteIDs.length === 0) {
        return false
      }

      const hasDocs = await hasVisibleDocsForSites(req, collection, siteIDs, siteField)
      return hasDocs ? readAccess : false
    }

    return readAccess
  }
}

export const createHideWhenEmptyCreateAccess = (collection: string, siteField = 'site'): Access => {
  return async ({ req }) => {
    if (!req.user) {
      return false
    }

    if (isSuperAdmin(req.user)) {
      return true
    }

    const siteIDs = getUserSiteIDs(req.user)
    if (siteIDs.length === 0) {
      return false
    }

    return hasVisibleDocsForSites(req, collection, siteIDs, siteField)
  }
}
