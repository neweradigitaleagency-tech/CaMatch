import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function MarketplaceHome() {
  const nav = useNavigate()

  useEffect(() => {
    nav("/catalog", { replace: true })
  }, [nav])

  return null
}
