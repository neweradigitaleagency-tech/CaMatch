import { motion } from "motion/react"
import { Download, FileText } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import type { Invoice } from "../../types/subscription"

interface InvoiceCardProps {
  invoice: Invoice
  onDownload?: (invoice: Invoice) => void
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600 border border-amber-200",
  paid: "bg-green-50 text-green-600 border border-green-200",
  overdue: "bg-red-50 text-red-600 border border-red-200",
  cancelled: "bg-gray-100 text-gray-500",
  refunded: "bg-blue-50 text-blue-600 border border-blue-200",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  paid: "Payée",
  overdue: "En retard",
  cancelled: "Annulée",
  refunded: "Remboursée",
}

export default function InvoiceCard({ invoice, onDownload }: InvoiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="cm-card p-4 flex items-center gap-3"
    >
      <div className="w-9 h-9 rounded-full bg-cm-accent-soft flex items-center justify-center shrink-0">
        <FileText className="w-4 h-4 text-cm-text" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[12px] font-semibold text-cm-text truncate">
            {invoice.invoice_number}
          </span>
          <span className={`inline-flex items-center h-4 px-1.5 rounded-full text-[9px] font-semibold ${STATUS_STYLES[invoice.status]}`}>
            {STATUS_LABELS[invoice.status]}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-cm-text-muted">
          <span>{format(new Date(invoice.created_at), "d MMM yyyy", { locale: fr })}</span>
          <span>·</span>
          <span>{invoice.total.toLocaleString("fr-FR")} FCFA</span>
        </div>
      </div>

      {onDownload && invoice.pdf_url && (
        <button
          onClick={() => onDownload(invoice)}
          className="w-8 h-8 rounded-full bg-cm-accent-soft flex items-center justify-center hover:bg-cm-border cursor-pointer shrink-0 active:scale-90 transition-transform"
        >
          <Download className="w-3.5 h-3.5 text-cm-text" />
        </button>
      )}
    </motion.div>
  )
}
