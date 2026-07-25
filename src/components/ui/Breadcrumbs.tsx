import { useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"
import { VERTICAL_LABELS } from "../../types/marketplace"
import { getProductById } from "../../data/marketplaceProducts"
import type { MarketplaceVertical } from "../../types/marketplace"

interface BreadcrumbItem {
  label: string
  path?: string
}

export default function Breadcrumbs() {
  const location = useLocation()
  const nav = useNavigate()

  const items = useMemo<BreadcrumbItem[]>(() => {
    const segments = location.pathname.split("/").filter(Boolean)
    if (segments.length === 0) return []

    const crumbs: BreadcrumbItem[] = [{ label: "Accueil", path: "/" }]

    if (segments[0] === "marketplace") {
      crumbs.push({ label: "Marketplace", path: "/marketplace" })

      const second = segments[1]
      if (second === "browse") {
        const vertical = segments[2] as MarketplaceVertical
        if (vertical && VERTICAL_LABELS[vertical]) {
          crumbs.push({ label: VERTICAL_LABELS[vertical], path: `/marketplace/browse/${vertical}` })
        }
      } else if (second === "item" && segments[2]) {
        const product = getProductById(segments[2])
        if (product) {
          crumbs.push({ label: product.name })
        } else {
          crumbs.push({ label: "Annonce" })
        }
      } else if (second === "shop") {
        crumbs.push({ label: "Boutique" })
      } else if (second === "register") {
        crumbs.push({ label: "Devenir vendeur" })
      }
    } else if (segments[0] === "catalog") {
      crumbs.push({ label: "Catalogue" })
    }

    return crumbs
  }, [location.pathname])

  if (items.length <= 1) return null

  return (
    <nav className="flex items-center gap-1 text-[11px] text-cm-text-soft overflow-x-auto no-scrollbar" aria-label="Fil d'Ariane">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-1 shrink-0">
            {i > 0 && <ChevronRight className="w-2.5 h-2.5 text-cm-text-muted" />}
            {isLast ? (
              <span className="text-cm-text font-semibold truncate max-w-[140px]">{item.label}</span>
            ) : (
              <button
                onClick={() => item.path && nav(item.path)}
                className="hover:text-cm-forest transition-colors cursor-pointer truncate max-w-[120px]"
              >
                {item.label}
              </button>
            )}
          </span>
        )
      })}
    </nav>
  )
}
