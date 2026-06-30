export type StaffOrderListItem = {
  id: number
  displayNumber: string
  invoiceNumberLabel: string | null
  customerName: string
  createdAt: string
  total: number
  totalLabel: string
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  canDownloadInvoice: boolean
}

export type StaffOrdersListResult = {
  orders: StaffOrderListItem[]
  page: number
  limit: number
  totalDocs: number
  totalPages: number
}
