export type KitchenOrderLine = {
  name: string
  quantity: number
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
  lines: KitchenOrderLine[]
  total: number
  createdAt: string
}

export type KitchenOrderGroup = {
  pickupSlotValue: string
  pickupSlotLabel: string
  orders: KitchenOrder[]
}
