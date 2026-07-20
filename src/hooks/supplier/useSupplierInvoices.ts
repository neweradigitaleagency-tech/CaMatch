import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "../../stores/authStore"
import { getInvoices, getInvoiceById, getInvoiceStats } from "../../services/supplier/invoices.service"
import type { SupplierInvoice } from "../../types/supplier"

export function useSupplierInvoices() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery<SupplierInvoice[]>({
    queryKey: ["supplier-invoices", userId],
    queryFn: () => (userId ? getInvoices(userId) : []),
    enabled: !!userId,
  })
}

export function useSupplierInvoice(invoiceId: string | undefined) {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery<SupplierInvoice | undefined>({
    queryKey: ["supplier-invoice", userId, invoiceId],
    queryFn: () => (userId && invoiceId ? getInvoiceById(userId, invoiceId) : undefined),
    enabled: !!userId && !!invoiceId,
  })
}

export function useSupplierInvoiceStats() {
  const userId = useAuthStore((s) => s.user?.id)
  return useQuery({
    queryKey: ["supplier-invoice-stats", userId],
    queryFn: () => (userId ? getInvoiceStats(userId) : { total: 0, paid: 0, unpaid: 0, overdue: 0, totalAmount: 0, paidAmount: 0 }),
    enabled: !!userId,
  })
}
