import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../../stores/authStore"
import { getSupplierProducts, createProduct, updateProduct, toggleProductActive, getProductById } from "../../services/supplier/products.service"
import type { SupplierProduct, SupplierProductFormData } from "../../types/supplier"

export function useSupplierProducts() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery<SupplierProduct[]>({
    queryKey: ["supplier-products", userId],
    queryFn: () => (userId ? getSupplierProducts(userId) : Promise.resolve([])),
    enabled: !!userId,
  })
}

export function useSupplierProduct(productId: string | undefined) {
  return useQuery<SupplierProduct | null>({
    queryKey: ["supplier-product", productId],
    queryFn: () => (productId ? getProductById(productId) : Promise.resolve(null)),
    enabled: !!productId,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)
  return useMutation({
    mutationFn: ({ form, commissionRate }: { form: SupplierProductFormData; commissionRate: number }) =>
      createProduct(userId ?? "", form, commissionRate),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["supplier-products"] }),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, form, commissionRate }: { productId: string; form: SupplierProductFormData; commissionRate: number }) =>
      updateProduct(productId, form, commissionRate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-products"] })
      queryClient.invalidateQueries({ queryKey: ["supplier-product"] })
    },
  })
}

export function useToggleProductActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, isActive }: { productId: string; isActive: boolean }) =>
      toggleProductActive(productId, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["supplier-products"] }),
  })
}
