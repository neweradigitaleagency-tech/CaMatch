import { ArrowLeft } from "lucide-react"
import { useBackNavigation } from "../../hooks/useBackNavigation"

interface PageHeaderProps {
  title: string
  fallbackRoute?: string
  rightAction?: React.ReactNode
  subtitle?: string
}

export default function PageHeader({ title, fallbackRoute = "/", rightAction, subtitle }: PageHeaderProps) {
  const goBack = useBackNavigation(fallbackRoute)

  return (
    <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
      <div className="flex items-center h-14 px-5 gap-3">
        <button
          type="button"
          onClick={goBack}
          className="p-1 -ml-1 cursor-pointer active:scale-[0.97] transition-transform touch-min"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5 text-cm-text" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[18px] font-bold text-cm-text truncate">{title}</h1>
          {subtitle && (
            <p className="text-[11px] text-cm-text-soft -mt-0.5">{subtitle}</p>
          )}
        </div>
        {rightAction && (
          <div className="shrink-0">{rightAction}</div>
        )}
      </div>
    </div>
  )
}
