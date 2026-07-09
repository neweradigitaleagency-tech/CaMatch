import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export default function ErrorState({
  title = "Une erreur est survenue",
  message = "Impossible de charger les données. Veuillez réessayer.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6 text-[var(--admin-danger)]" />
      </div>
      <h3 className="text-[14px] font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-[12px] text-gray-500 text-center max-w-xs mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 h-9 px-4 text-[12px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Réessayer
        </button>
      )}
    </div>
  )
}
