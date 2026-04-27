import type { Access, CollectionConfig } from 'payload'

const isAdmin: Access = ({ req }) => {
  return req.user?.role === 'admin'
}

const isAdminOrSelf: Access = ({ req }) => {
  if (!req.user) {
    return false
  }

  if (req.user.role === 'admin') {
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
