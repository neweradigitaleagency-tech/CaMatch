import { useEffect } from "react"
import { motion } from "motion/react"
import { ArrowLeft, Receipt, Download, FileText, Check, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useAppNavigation } from "../../navigation/useAppNavigation"
import { useSubscriptionStore } from "../../stores/subscriptionStore"
import { useAuthStore } from "../../stores/authStore"
import { downloadInvoice } from "../../services/invoiceService"
import type { Invoice } from "../../types/subscription"
import EmptyState from "../../components/ui/EmptyState"
import ErrorState from "../../components/ui/ErrorState"
import Skeleton from "../../components/ui/Skeleton"

const INVOICE_STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  paid: "Payée",
  overdue: "En retard",
  cancelled: "Annulée",
  refunded: "Remboursée",
}

const INVOICE_STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  paid: "bg-emerald-50 text-emerald-600 border-emerald-200",
  overdue: "bg-red-50 text-red-600 border-red-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
  refunded: "bg-gray-100 text-gray-500 border-gray-200",
}

export default function SubscriptionInvoicesPage() {
  const { navigate, goBack, getFlag, setFlag } = useAppNavigation()
  const fromHamburger = getFlag("from-hamburger")
  const userId = useAuthStore((s) => s.userId)
  const { invoices, loading, error, fetchInvoices, clearError } = useSubscriptionStore()

  useEffect(() => {
    if (userId) fetchInvoices(userId)
  }, [userId])

  const handleBack = () => {
    if (fromHamburger) {
      setFlag("reopen-menu", true)
      navigate("/")
    } else {
      goBack()
    }
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-dynamic bg-cm-bg">
        <Header onBack={handleBack} title="Factures" />
        <ErrorState message={error} onRetry={() => userId && fetchInvoices(userId)} />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-dynamic bg-cm-bg pb-32">
      <Header onBack={handleBack} title="Factures" />

      <div className="px-4 mt-2">
        {loading && invoices.length === 0 ? (
          <InvoicesSkeleton />
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Aucune facture"
            description="Vous n'avez pas encore de facture. Les factures apparaîtront après vos premiers paiements."
          />
        ) : (
          <div className="space-y-2">
            {invoices.map((inv, i) => (
              <InvoiceCard key={inv.id} invoice={inv} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-4 pb-2">
      <button onClick={onBack} className="p-1 cursor-pointer active:scale-[0.97] transition-transform touch-min">
        <ArrowLeft className="w-4 h-4 text-cm-text-soft" />
      </button>
      <h1 className="text-lg font-extrabold text-cm-text">{title}</h1>
    </div>
  )
}

function InvoiceCard({ invoice, index }: { invoice: Invoice; index: number }) {
  const statusLabel = INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status
  const statusColor = INVOICE_STATUS_COLORS[invoice.status] ?? "bg-gray-100 text-gray-500"

  const handleDownload = () => {
    if (invoice.pdf_url) {
      window.open(invoice.pdf_url, "_blank")
    } else {
      downloadInvoice(invoice)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-cm-elevated rounded-[16px] border border-cm-border p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-cm-accent-soft flex items-center justify-center">
            <FileText className="w-5 h-5 text-cm-accent" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-cm-text">{invoice.invoice_number}</p>
            <p className="text-[11px] text-cm-text-muted">
              {format(new Date(invoice.created_at), "dd MMM yyyy", { locale: fr })}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center h-6 px-2.5 rounded-[9999px] text-[10px] font-semibold border shrink-0 ${statusColor}`}>
          {statusLabel}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[15px] font-extrabold text-cm-text">
            {invoice.total.toLocaleString("fr-FR")} F CFA
          </p>
          {invoice.tax > 0 && (
            <p className="text-[11px] text-cm-text-muted">
              Dont {invoice.tax.toLocaleString("fr-FR")} F CFA de taxes
            </p>
          )}
        </div>
        <button
          onClick={handleDownload}
          className="h-9 px-4 rounded-[10px] bg-cm-accent text-cm-text-onAccent text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer active:scale-[0.97] transition-transform"
        >
          <Download className="w-3.5 h-3.5" />
          Télécharger
        </button>
      </div>

      {invoice.paid_at && invoice.status === "paid" && (
        <div className="mt-3 flex items-center gap-1.5 text-emerald-600 text-[11px] font-medium">
          <Check className="w-3 h-3" />
          Payée le {format(new Date(invoice.paid_at), "dd MMM yyyy", { locale: fr })}
        </div>
      )}
      {invoice.status === "overdue" && invoice.due_date && (
        <div className="mt-3 flex items-center gap-1.5 text-cm-error text-[11px] font-medium">
          <AlertTriangle className="w-3 h-3" />
          Due le {format(new Date(invoice.due_date), "dd MMM yyyy", { locale: fr })}
        </div>
      )}
    </motion.div>
  )
}

function InvoicesSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-cm-elevated rounded-[16px] border border-cm-border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton variant="circle" width="40px" height="40px" />
            <div className="space-y-1.5 flex-1">
              <Skeleton variant="text" className="w-1/3" />
              <Skeleton variant="text" className="w-1/5" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Skeleton variant="text" className="w-1/4" />
            <Skeleton variant="rect" className="h-9 w-28 rounded-[10px]" />
          </div>
        </div>
      ))}
    </div>
  )
}
