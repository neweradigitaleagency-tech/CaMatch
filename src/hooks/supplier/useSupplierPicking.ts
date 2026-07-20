import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../../stores/authStore"
import { fetchPickingLists, updatePickingStatus, updatePickingItem } from "../../services/supplier/picking.service"
import type { PickingList, PickingStatus } from "../../types/supplier"

export function usePickingLists() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery<PickingList[]>({
    queryKey: ["supplier-picking", userId],
    queryFn: () => fetchPickingLists(userId || "supplier-1"),
    enabled: !!userId,
  })
}

export function useUpdatePickingStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ listId, status }: { listId: string; status: PickingStatus }) =>
      updatePickingStatus(listId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supplier-picking"] }),
  })
}

export function useUpdatePickingItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ listId, itemId, pickedQuantity }: { listId: string; itemId: string; pickedQuantity: number }) =>
      updatePickingItem(listId, itemId, pickedQuantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supplier-picking"] }),
  })
}
