import type { Access } from 'payload'

export const isAdminUser = (user: any): boolean => user?.role === 'admin'

/**
 * True if the user has role `admin`.
 * When `req.user.role` is missing (some auth/session shapes), loads the user once from DB (cached on `req.context`).
 */
export async function userIsAdmin(req: any): Promise<boolean> {
  if (!req?.user) {
    return false
  }

  const ctx = (req.context ??= {}) as { __isAdmin?: boolean }
  if (typeof ctx.__isAdmin === 'boolean') {
    return ctx.__isAdmin
  }

  const u = req.user
  if (isAdminUser(u)) {
    ctx.__isAdmin = true
    return true
  }

  if ((u.role === undefined || u.role === null) && u.id && u.collection) {
    const full = await req.payload.findByID({
      collection: u.collection,
      id: u.id,
      depth: 0,
      overrideAccess: true,
      req,
    })
    const ok = full?.role === 'admin'
    ctx.__isAdmin = ok
    return ok
  }

  ctx.__isAdmin = false
  return false
}

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
  return async ({ req }) => {
    if (!req.user) {
      return false
    }

    if (await userIsAdmin(req)) {
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
  return async ({ req }) => {
    if (!req.user) {
      return false
    }

    if (await userIsAdmin(req)) {
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

    if (await userIsAdmin(req)) {
      return true
    }

    const siteIDs = getUserSiteIDs(req.user)
    if (siteIDs.length === 0) {
      return false
    }

    return hasVisibleDocsForSites(req, collection, siteIDs, siteField)
  }
}
