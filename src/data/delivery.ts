import type { MarketplaceOrderStatus } from "../types/marketplace"

export const CARRIERS = [
  { name: "Ça Match Express", contact: "+225 07 01 02 03", color: "#243318" },
  { name: "Flash Livraison", contact: "+225 07 11 22 33", color: "#AECB2A" },
  { name: "Zébrus Express", contact: "+225 05 44 55 66", color: "#3B82F6" },
  { name: "Taky Express", contact: "+225 01 77 88 99", color: "#EF4444" },
] as const

const LOCAL_CITIES = [
  "abidjan", "cocody", "yopougon", "marcory", "plateau", "treichville",
  "adjamé", "koumassi", "bingerville", "port-bouët", "attécoubé", "anyama", "abobo", "songon",
]

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997
  return h
}

export function getCarrierForOrder(orderId: string, city: string) {
  const idx = hashString(orderId + city) % CARRIERS.length
  return CARRIERS[idx] ?? { name: "Ça Match Express", contact: "+225 07 01 02 03", color: "#243318" }
}

export function getTrackingCode(orderId: string): string {
  const digits = (hashString(orderId) * 7919).toString().padStart(8, "0").slice(0, 8)
  return `CM-${digits}`
}

export function isLocalCity(city: string): boolean {
  return LOCAL_CITIES.some((c) => city.toLowerCase().includes(c))
}

export function getEstimatedDeliveryAt(createdAt: string, city: string, orderId: string): string {
  const created = new Date(createdAt)
  const h = hashString(city + orderId)
  const hours = isLocalCity(city) ? 6 + (h % 12) : 48 + (h % 25)
  return new Date(created.getTime() + hours * 3_600_000).toISOString()
}

export function getEstimatedWindow(estimatedAt: string): { from: string; to: string } {
  const eta = new Date(estimatedAt)
  const from = new Date(eta.getTime() - 2 * 3_600_000)
  return {
    from: from.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
    to: eta.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
  }
}

export const DELIVERY_STEPS: { key: MarketplaceOrderStatus; label: string; desc: string }[] = [
  { key: "confirmed", label: "Commande confirmée", desc: "Votre paiement est sécurisé par Ça Match" },
  { key: "preparing", label: "En préparation", desc: "Le vendeur prépare votre colis" },
  { key: "shipped", label: "Expédiée", desc: "Le colis est en route vers vous" },
  { key: "delivered", label: "Livrée", desc: "Colis remis — les fonds sont libérés" },
]

export const DELIVERY_STATUS_INDEX: Record<MarketplaceOrderStatus, number> = {
  pending: 0,
  confirmed: 0,
  preparing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
  disputed: -1,
}

export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}
