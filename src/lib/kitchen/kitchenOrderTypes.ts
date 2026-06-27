export type KitchenOrderLineItem = {
  name: string
  quantity: number
}

export type KitchenOrderLineGroup = {
  categoryName: string
  lines: KitchenOrderLineItem[]
}

export type KitchenOrder = {
  id: number
  displayNumber: string
  status: 'in_progress' | 'completed' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  customerName: string
  customerPhone: string
  pickupSlotValue: string
  pickupSlotLabel: string
  lineGroups: KitchenOrderLineGroup[]
  total: number
  createdAt: string
}

export type KitchenOrderGroup = {
  pickupSlotValue: string
  pickupSlotLabel: string
  orders: KitchenOrder[]
}

export type KitchenOrderAction = 'completed' | 'cancelled'

export type KitchenPendingAction = {
  order: KitchenOrder
  status: KitchenOrderAction
}
