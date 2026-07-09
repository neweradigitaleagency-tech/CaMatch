interface StatusBadgeProps {
  status: string
  label?: string
  size?: "sm" | "md"
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-[var(--admin-accent-soft)]", text: "text-[var(--admin-accent)]", dot: "bg-[var(--admin-accent)]" },
  approved: { bg: "bg-[var(--admin-accent-soft)]", text: "text-[var(--admin-accent)]", dot: "bg-[var(--admin-accent)]" },
  completed: { bg: "bg-[var(--admin-accent-soft)]", text: "text-[var(--admin-accent)]", dot: "bg-[var(--admin-accent)]" },
  success: { bg: "bg-[var(--admin-accent-soft)]", text: "text-[var(--admin-accent)]", dot: "bg-[var(--admin-accent)]" },
  pending: { bg: "bg-[var(--admin-warning-soft)]", text: "text-[var(--admin-warning)]", dot: "bg-[var(--admin-warning)]" },
  submitted: { bg: "bg-[var(--admin-warning-soft)]", text: "text-[var(--admin-warning)]", dot: "bg-[var(--admin-warning)]" },
  under_review: { bg: "bg-[var(--admin-info-soft)]", text: "text-[var(--admin-info)]", dot: "bg-[var(--admin-info)]" },
  in_progress: { bg: "bg-[var(--admin-info-soft)]", text: "text-[var(--admin-info)]", dot: "bg-[var(--admin-info)]" },
  rejected: { bg: "bg-[var(--admin-danger-soft)]", text: "text-[var(--admin-danger)]", dot: "bg-[var(--admin-danger)]" },
  suspended: { bg: "bg-[var(--admin-danger-soft)]", text: "text-[var(--admin-danger)]", dot: "bg-[var(--admin-danger)]" },
  disabled: { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
  inactive: { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400" },
}

export default function StatusBadge({ status, label, size = "sm" }: StatusBadgeProps) {
  const style = STATUS_STYLES[status.toLowerCase()] ?? { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" }
  const h = size === "sm" ? "h-5" : "h-6"
  const textSize = size === "sm" ? "text-[11px]" : "text-[12px]"

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 ${h} rounded-full ${style.bg} ${style.text} ${textSize} font-medium`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {label ?? status}
    </span>
  )
}
