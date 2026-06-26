import type { Access, CollectionBeforeChangeHook, RelationshipField } from 'payload'

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

/**
 * Site IDs for access control — uses JWT when present, otherwise loads the user once (cached on `req.context`).
 */
export async function getUserSiteIDsFromReq(req: any): Promise<(number | string)[]> {
  if (!req?.user) {
    return []
  }

  const ctx = (req.context ??= {}) as { __userSiteIDs?: (number | string)[] }
  if (ctx.__userSiteIDs) {
    return ctx.__userSiteIDs
  }

  const fromJWT = getUserSiteIDs(req.user)
  if (fromJWT.length > 0) {
    ctx.__userSiteIDs = fromJWT
    return fromJWT
  }

  if (req.user.id && req.user.collection) {
    const full = await req.payload.findByID({
      collection: req.user.collection,
      id: req.user.id,
      depth: 0,
      overrideAccess: true,
      req,
    })
    const ids = getUserSiteIDs(full)
    ctx.__userSiteIDs = ids
    return ids
  }

  ctx.__userSiteIDs = []
  return []
}

export const getDefaultUserSiteID = (user: any): number | string | null => {
  const siteIDs = getUserSiteIDs(user)
  return siteIDs.length > 0 ? siteIDs[0] : null
}

export async function getDefaultUserSiteIDFromReq(req: any): Promise<number | string | null> {
  const siteIDs = await getUserSiteIDsFromReq(req)
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

const adminOnlySiteFieldAccess = {
  read: async ({ req }: { req: any }) => userIsAdmin(req),
  create: async ({ req }: { req: any }) => userIsAdmin(req),
  update: async ({ req }: { req: any }) => userIsAdmin(req),
}

export const createSiteField = (): RelationshipField => ({
  name: 'site',
  type: 'relationship',
  relationTo: 'sites',
  required: true,
  admin: {
    condition: (_, __, { user }) => isAdminUser(user),
  },
  access: adminOnlySiteFieldAccess,
  filterOptions: ({ req }) => {
    if (isAdminUser(req.user)) {
      return true
    }

    const siteIDs = getUserSiteIDs(req.user)
    if (siteIDs.length === 0) {
      return false
    }

    return {
      id: {
        in: siteIDs,
      },
    }
  },
})

export const createAssignDefaultSiteBeforeChange =
  (): CollectionBeforeChangeHook =>
  async ({ req, data }) => {
    const siteId =
      typeof data?.site === 'object' && data.site !== null
        ? (data.site as { id?: number | string }).id
        : data?.site

    if (siteId) {
      return data
    }

    if (await userIsAdmin(req)) {
      return data
    }

    const defaultSiteID = await getDefaultUserSiteIDFromReq(req)
    if (!defaultSiteID) {
      throw new Error('No site is assigned to your user.')
    }

    return {
      ...data,
      site: defaultSiteID,
    }
  }

export const createSiteScopedReadAccess = (siteField = 'site'): Access => {
  return async ({ req }) => {
    if (!req.user) {
      return false
    }

    if (await userIsAdmin(req)) {
      return true
    }

    const siteIDs = await getUserSiteIDsFromReq(req)
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

    const siteIDs = await getUserSiteIDsFromReq(req)
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
      const siteIDs = await getUserSiteIDsFromReq(req)
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

    const siteIDs = await getUserSiteIDsFromReq(req)
    if (siteIDs.length === 0) {
      return false
    }

    return hasVisibleDocsForSites(req, collection, siteIDs, siteField)
  }
}

export const createHideWhenEmptyAdminAccess = (
  collection: string,
  siteField = 'site',
): (({ req }: { req: any }) => boolean | Promise<boolean>) => {
  return async ({ req }) => {
    if (!req.user) {
      return false
    }

    if (await userIsAdmin(req)) {
      return true
    }

    const siteIDs = await getUserSiteIDsFromReq(req)
    if (siteIDs.length === 0) {
      return false
    }

    return hasVisibleDocsForSites(req, collection, siteIDs, siteField)
  }
}

export const createSitesReadAccess = (): Access => {
  return async ({ req }) => {
    if (!req.user) {
      return true
    }

    if (await userIsAdmin(req)) {
      return true
    }

    const siteIDs = await getUserSiteIDsFromReq(req)
    if (siteIDs.length === 0) {
      return false
    }

    return {
      id: {
        in: siteIDs,
      },
    }
  }
}

export const createSitesAdminAccess = (): (({ req }: { req: any }) => boolean | Promise<boolean>) => {
  return async ({ req }) => {
    if (!req.user) {
      return false
    }

    if (await userIsAdmin(req)) {
      return true
    }

    const siteIDs = await getUserSiteIDsFromReq(req)
    return siteIDs.length > 0
  }
}

export const createPublicSiteScopedCollectionAccess = (collection: string, siteField = 'site') => {
  const publicRead: Access = async ({ req }) => {
    if (!req.user) {
      return true
    }

    if (await userIsAdmin(req)) {
      return true
    }

    const siteIDs = await getUserSiteIDsFromReq(req)
    if (siteIDs.length === 0) {
      return false
    }

    return buildSiteScopedConstraint(siteIDs, siteField)
  }

  return {
    read: publicRead,
    create: createHideWhenEmptyCreateAccess(collection, siteField),
    update: createSiteScopedManageAccess(siteField),
    delete: createSiteScopedManageAccess(siteField),
    admin: createHideWhenEmptyAdminAccess(collection, siteField),
  }
}

export const createSiteScopedCollectionAccess = (collection: string, siteField = 'site') => {
  const baseRead = createSiteScopedReadAccess(siteField)

  return {
    read: createHideWhenEmptyReadAccess(baseRead, collection, siteField),
    create: createHideWhenEmptyCreateAccess(collection, siteField),
    update: createSiteScopedManageAccess(siteField),
    delete: createSiteScopedManageAccess(siteField),
    admin: createHideWhenEmptyAdminAccess(collection, siteField),
  }
}
