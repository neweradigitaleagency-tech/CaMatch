import { useState, useEffect } from "react"
import { getTrendingSearches } from "../services/searchAnalytics"

export function useTrendingSearches(daysBack = 7, limit = 8): string[] {
  const [trending, setTrending] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    getTrendingSearches(daysBack, limit).then((result) => {
      if (!cancelled) setTrending(result)
    })
    return () => { cancelled = true }
  }, [daysBack, limit])

  return trending
}
