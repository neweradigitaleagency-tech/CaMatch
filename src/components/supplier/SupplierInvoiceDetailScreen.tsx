import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, FileText, Calendar, User, Truck, Percent } from "lucide-react"
import { useSupplierInvoice } from "../../hooks/supplier/useSupplierInvoices"
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from "../../services/supplier/invoices.service"
import { formatXOF } from "../../utils/format"

export default function SupplierInvoiceDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: invoice, isLoading } = useSupplierInvoice(id)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-200/50 animate-pulse rounded-xl h-8 w-48" />
        <div className="bg-gray-200/50 animate-pulse rounded-xl h-48" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-[13px] text-gray-500">Facture introuvable</p>
        <button onClick={() => navigate("/supplier/invoices")} className="mt-3 h-9 px-4 bg-gray-900 text-white text-[12px] font-bold rounded-xl cursor-pointer">Retour</button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="sticky top-0 z-10 bg-gray-50 -mx-4 lg:-mx-6 px-4 lg:px-6 py-3 border-b border-gray-200">
        <button onClick={() => navigate("/supplier/invoices")}
          className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Factures
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-[20px] font-bold text-gray-900">{invoice.number}</h1>
            <p className="text-[12px] text-gray-500 mt-1">Créée le {new Date(invoice.createdAt).toLocaleDateString("fr-FR")}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${INVOICE_STATUS_COLORS[invoice.status]}`}>
            {INVOICE_STATUS_LABELS[invoice.status]}
          </span>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-[13px]">
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900">{invoice.clientName}</span>
            <button onClick={() => navigate(`/supplier/clients/${invoice.clientId}`)}
              className="ml-auto text-[11px] text-cm-green font-semibold cursor-pointer hover:underline">
              Voir le client
            </button>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <FileText className="w-4 h-4 text-gray-400" />
            <span>Commande <strong>{invoice.orderId.toUpperCase()}</strong></span>
            <button onClick={() => navigate(`/supplier/orders/${invoice.orderId}`)}
              className="ml-auto text-[11px] text-cm-green font-semibold cursor-pointer hover:underline">
              Voir la commande
            </button>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Échéance: <strong>{new Date(invoice.dueDate).toLocaleDateString("fr-FR")}</strong></span>
          </div>
          {invoice.paidAt && (
            <div className="flex items-center gap-2 text-green-600">
              <Calendar className="w-4 h-4" />
              <span>Payée le: <strong>{new Date(invoice.paidAt).toLocaleDateString("fr-FR")}</strong></span>
            </div>
          )}
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex justify-between text-[13px] py-2">
            <span className="text-gray-500">Sous-total</span>
            <span className="font-medium text-gray-900">{formatXOF(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between text-[13px] py-2">
            <span className="text-gray-500 flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Livraison</span>
            <span className="font-medium text-gray-900">{formatXOF(invoice.deliveryCost)}</span>
          </div>
          <div className="flex justify-between text-[13px] py-2">
            <span className="text-gray-500 flex items-center gap-1"><Percent className="w-3.5 h-3.5" /> Commission</span>
            <span className="font-medium text-red-500">-{formatXOF(invoice.commission)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between text-[15px] font-bold">
            <span>Total</span>
            <span className="text-gray-900">{formatXOF(invoice.total)}</span>
          </div>
        </div>

        {invoice.notes && (
          <p className="text-[12px] text-gray-500 mt-4 pt-4 border-t border-gray-100">{invoice.notes}</p>
        )}
      </div>
    </div>
  )
}
