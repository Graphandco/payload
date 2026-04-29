import type { Access, CollectionConfig } from 'payload'
import { userIsAdmin } from '../lib/siteAccess'

const isAdmin: Access = async ({ req }) => userIsAdmin(req)

const isAdminOrSelf: Access = async ({ req }) => {
  if (!req.user) {
    return false
  }

  if (await userIsAdmin(req)) {
    return true
  }

  return {
    id: {
      equals: req.user.id,
    },
  }
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    hidden: ({ user }) => user?.role !== 'admin',
  },
  auth: true,
  access: {
    read: isAdminOrSelf,
    create: isAdmin,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      saveToJWT: true,
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
      ],
    },
    {
      name: 'sites',
      type: 'relationship',
      relationTo: 'sites',
      hasMany: true,
      admin: {
        description: 'Sites accessibles pour cet utilisateur.',
      },
    },
  ],
}
