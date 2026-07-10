import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../../stores/authStore"
import { getSupplierOrders, getSupplierOrderById, updateOrderStatus } from "../../services/supplier/orders.service"
import type { MaterialOrder, MaterialOrderStatus } from "../../types/supplier"

export function useSupplierOrders(statusFilter?: string) {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery<MaterialOrder[]>({
    queryKey: ["supplier-orders", userId, statusFilter],
    queryFn: () => (userId ? getSupplierOrders(userId, statusFilter) : Promise.resolve([])),
    enabled: !!userId,
  })
}

export function useSupplierOrder(orderId: string | undefined) {
  return useQuery<MaterialOrder | null>({
    queryKey: ["supplier-order", orderId],
    queryFn: () => (orderId ? getSupplierOrderById(orderId) : Promise.resolve(null)),
    enabled: !!orderId,
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: MaterialOrderStatus }) =>
      updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-orders"] })
      queryClient.invalidateQueries({ queryKey: ["supplier-order"] })
    },
  })
}
