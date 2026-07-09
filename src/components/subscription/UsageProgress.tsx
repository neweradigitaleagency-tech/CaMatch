import { motion } from "motion/react"

interface UsageProgressProps {
  current: number
  limit: number | null
  label: string
  featureCode?: string
}

export default function UsageProgress({ current, limit, label, featureCode }: UsageProgressProps) {
  const isUnlimited = limit === null || limit === -1

  const percentage = isUnlimited ? 0 : Math.min(Math.round((current / limit) * 100), 100)

  const barColor = percentage > 95
    ? "bg-cm-error"
    : percentage > 80
    ? "bg-cm-amber"
    : "bg-cm-accent"

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-cm-text">{label}</span>
        <span className="text-[10px] text-cm-text-muted">
          {isUnlimited ? "-" : `${current}/${limit}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="w-full h-1.5 bg-cm-accent-soft rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`h-full rounded-full ${barColor}`}
          />
        </div>
      )}
      {featureCode && <span className="text-[9px] text-cm-text-muted">{featureCode}</span>}
    </div>
  )
}
