import type { SupplierInvoice, InvoiceStatus } from "../../types/supplier"
import { getMockSupplierInvoices } from "../../data/supplier-mocks"

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  paid: "Payée",
  unpaid: "Impayée",
  overdue: "En retard",
  cancelled: "Annulée",
}

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  paid: "bg-emerald-100 text-emerald-800",
  unpaid: "bg-amber-100 text-amber-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-600",
}

export function getInvoices(supplierId: string): SupplierInvoice[] {
  return getMockSupplierInvoices(supplierId)
}

export function getInvoiceById(supplierId: string, invoiceId: string): SupplierInvoice | undefined {
  return getMockSupplierInvoices(supplierId).find((i) => i.id === invoiceId)
}

export function getInvoiceStats(supplierId: string): { total: number; paid: number; unpaid: number; overdue: number; totalAmount: number; paidAmount: number } {
  const invoices = getMockSupplierInvoices(supplierId)
  return {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "paid").length,
    unpaid: invoices.filter((i) => i.status === "unpaid").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
    totalAmount: invoices.reduce((s, i) => s + i.total, 0),
    paidAmount: invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0),
  }
}
