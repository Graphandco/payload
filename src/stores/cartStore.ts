'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

export type CartLine = {
  productId: number
  name: string
  price: number
  quantity: number
}

const EMPTY_LINES: CartLine[] = []

type CartProduct = {
  id: number
  name: string
  price: number
}

type CartState = {
  items: Record<string, Record<string, CartLine>>
  addItem: (siteId: number, product: CartProduct) => void
  setQuantity: (siteId: number, productId: number, quantity: number) => void
  removeItem: (siteId: number, productId: number) => void
  clearSite: (siteId: number) => void
}

function siteKey(siteId: number): string {
  return String(siteId)
}

function productKey(productId: number): string {
  return String(productId)
}

export function getCartLines(items: CartState['items'], siteId: number): CartLine[] {
  const siteCart = items[siteKey(siteId)]
  if (!siteCart) {
    return EMPTY_LINES
  }

  return Object.values(siteCart)
}

export function getCartItemCount(items: CartState['items'], siteId: number): number {
  return getCartLines(items, siteId).reduce((total, line) => total + line.quantity, 0)
}

export function getCartTotal(items: CartState['items'], siteId: number): number {
  return getCartLines(items, siteId).reduce((total, line) => total + line.price * line.quantity, 0)
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: {},
      addItem: (siteId, product) => {
        const sKey = siteKey(siteId)
        const pKey = productKey(product.id)

        set((state) => {
          const siteCart = state.items[sKey] ?? {}
          const existing = siteCart[pKey]

          return {
            items: {
              ...state.items,
              [sKey]: {
                ...siteCart,
                [pKey]: {
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  quantity: (existing?.quantity ?? 0) + 1,
                },
              },
            },
          }
        })
      },
      setQuantity: (siteId, productId, quantity) => {
        const sKey = siteKey(siteId)
        const pKey = productKey(productId)

        set((state) => {
          const siteCart = { ...(state.items[sKey] ?? {}) }

          if (quantity <= 0) {
            delete siteCart[pKey]
          } else {
            const existing = siteCart[pKey]
            if (!existing) {
              return state
            }

            siteCart[pKey] = { ...existing, quantity }
          }

          if (Object.keys(siteCart).length === 0) {
            const nextItems = { ...state.items }
            delete nextItems[sKey]
            return { items: nextItems }
          }

          return {
            items: {
              ...state.items,
              [sKey]: siteCart,
            },
          }
        })
      },
      removeItem: (siteId, productId) => {
        const sKey = siteKey(siteId)
        const pKey = productKey(productId)

        set((state) => {
          const siteCart = { ...(state.items[sKey] ?? {}) }
          delete siteCart[pKey]

          if (Object.keys(siteCart).length === 0) {
            const nextItems = { ...state.items }
            delete nextItems[sKey]
            return { items: nextItems }
          }

          return {
            items: {
              ...state.items,
              [sKey]: siteCart,
            },
          }
        })
      },
      clearSite: (siteId) => {
        const sKey = siteKey(siteId)

        set((state) => {
          if (!state.items[sKey]) {
            return state
          }

          const nextItems = { ...state.items }
          delete nextItems[sKey]
          return { items: nextItems }
        })
      },
    }),
    {
      name: 'multi-tenant-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
)

export function useCartLines(siteId: number): CartLine[] {
  const sKey = siteKey(siteId)

  return useCartStore(
    useShallow((state) => {
      const siteCart = state.items[sKey]
      if (!siteCart) {
        return EMPTY_LINES
      }

      return Object.values(siteCart)
    }),
  )
}

export function useCartItemCount(siteId: number): number {
  return useCartStore((state) => getCartItemCount(state.items, siteId))
}

export function useCartTotal(siteId: number): number {
  return useCartStore((state) => getCartTotal(state.items, siteId))
}
