import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "../../stores/authStore"
import { getSupplierClients, getSupplierClientById } from "../../services/supplier/clients.service"
import type { SupplierClient, MaterialOrder } from "../../types/supplier"

export function useSupplierClients(searchQuery?: string) {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery<SupplierClient[]>({
    queryKey: ["supplier-clients", userId, searchQuery],
    queryFn: () => (userId ? getSupplierClients(userId, searchQuery) : []),
    enabled: !!userId,
  })
}

export function useSupplierClient(clientId: string | undefined) {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery<(SupplierClient & { orders: MaterialOrder[] }) | null>({
    queryKey: ["supplier-client", userId, clientId],
    queryFn: () => (userId && clientId ? getSupplierClientById(userId, clientId) : null),
    enabled: !!userId && !!clientId,
  })
}
