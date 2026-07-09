import { Inbox } from "lucide-react"

interface EmptyStateProps {
  title?: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({
  title = "Aucune donnée",
  description = "Il n'y a rien à afficher pour le moment.",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
        <Inbox className="w-6 h-6 text-gray-400" />
      </div>
      <h3 className="text-[14px] font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-[12px] text-gray-500 text-center max-w-xs mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="h-9 px-4 text-[12px] font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
