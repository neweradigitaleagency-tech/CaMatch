import { AlertTriangle, Loader2 } from "lucide-react"

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "warning" | "default"
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const variantStyles = {
    danger: "bg-red-600 hover:bg-red-700",
    warning: "bg-amber-600 hover:bg-amber-700",
    default: "bg-cm-text hover:bg-cm-text/90",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onCancel}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl ${variant === "danger" ? "bg-red-50" : variant === "warning" ? "bg-amber-50" : "bg-cm-surface"}`}>
            <AlertTriangle className={`w-5 h-5 ${variant === "danger" ? "text-red-500" : variant === "warning" ? "text-amber-500" : "text-cm-text-muted"}`} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-cm-text">{title}</h3>
            <p className="text-[13px] text-cm-text-muted mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-[13px] font-medium text-cm-text-soft bg-cm-surface rounded-xl hover:bg-cm-border-soft transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-[13px] font-medium text-white rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 ${variantStyles[variant]}`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
