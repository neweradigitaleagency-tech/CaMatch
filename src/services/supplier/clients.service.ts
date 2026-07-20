import type { SupplierClient, MaterialOrder } from "../../types/supplier"
import { MOCK_CLIENTS, getMockSupplierOrders } from "../../data/supplier-mocks"

export function getSupplierClients(supplierId: string, searchQuery?: string): SupplierClient[] {
  const orders = getMockSupplierOrders(supplierId)
  const clientIds = [...new Set(orders.map((o) => o.clientId))]
  let clients = clientIds.map((id) => {
    const clientOrders = orders.filter((o) => o.clientId === id)
    const mock = MOCK_CLIENTS.find((c) => c.id === id)
    const sortedOrders = [...clientOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    const latestOrder = sortedOrders[0]
    return {
      id,
      name: mock?.name ?? clientOrders[0]?.clientName ?? "Client",
      phone: mock?.phone ?? "",
      email: mock?.email,
      city: mock?.city ?? clientOrders[0]?.deliveryCity ?? "",
      address: mock?.address,
      totalOrders: mock?.totalOrders ?? clientOrders.length,
      totalSpent: mock?.totalSpent ?? clientOrders.reduce((sum, o) => sum + o.total, 0),
      lastOrderAt: latestOrder?.createdAt,
      createdAt: mock?.createdAt ?? "",
    }
  })
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    clients = clients.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.city.toLowerCase().includes(q))
  }
  return clients.sort((a, b) => b.totalSpent - a.totalSpent)
}

export function getSupplierClientById(supplierId: string, clientId: string): (SupplierClient & { orders: MaterialOrder[] }) | null {
  const orders = getMockSupplierOrders(supplierId).filter((o) => o.clientId === clientId)
  if (orders.length === 0) return null
  const mock = MOCK_CLIENTS.find((c) => c.id === clientId)
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return {
    id: clientId,
    name: mock?.name ?? orders[0]?.clientName ?? "Client",
    phone: mock?.phone ?? "",
    email: mock?.email,
    city: mock?.city ?? orders[0]?.deliveryCity ?? "",
    address: mock?.address,
    totalOrders: mock?.totalOrders ?? orders.length,
    totalSpent: mock?.totalSpent ?? orders.reduce((sum, o) => sum + o.total, 0),
    lastOrderAt: sortedOrders[0]?.createdAt,
    createdAt: mock?.createdAt ?? "",
    orders: sortedOrders,
  }
}
