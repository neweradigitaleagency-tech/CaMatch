interface AdminSkeletonProps {
  type?: "card" | "table" | "chart" | "text"
  lines?: number
}

export default function AdminSkeleton({ type = "text", lines = 3 }: AdminSkeletonProps) {
  if (type === "card") {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="h-7 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/4" />
      </div>
    )
  }

  if (type === "table") {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded w-[40%]" />
            <div className="h-4 bg-gray-200 rounded w-[20%]" />
            <div className="h-4 bg-gray-200 rounded w-[25%]" />
            <div className="h-4 bg-gray-200 rounded w-[15%]" />
          </div>
        ))}
      </div>
    )
  }

  if (type === "chart") {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
        <div className="h-3 bg-gray-200 rounded w-1/4 mb-4" />
        <div className="h-[200px] bg-gray-100 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
      ))}
    </div>
  )
}
