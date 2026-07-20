import { MARKETPLACE_PRODUCTS } from "../data/marketplaceProducts"
import { PROFESSIONAL_SELLERS, getSellersByCategory } from "../data/marketplaceSuppliers"
import type { Product, MaterialProduct } from "../types/marketplace"

export interface SupplierMatch {
  product: MaterialProduct
  seller: {
    id: string
    name: string
    city: string
    rating: number
    deliveryFee: number
    isOpen: boolean
    estimatedHours: number
  }
  savingsPercent: number
}

const CATEGORY_MAP: Record<string, string[]> = {
  "plomberie": ["ps-plomberie"],
  "maison-reparations": ["ps-plomberie", "ps-electricite", "ps-quincaillerie"],
  "electricite": ["ps-electricite"],
  "peinture": ["ps-peinture"],
  "menuisier": ["ps-menuiserie"],
  "carrelage": ["ps-carrelage"],
  "construction": ["ps-ciment", "ps-aciers", "ps-gros-oeuvre"],
  "climatisation": ["ps-clim"],
}

export function findSupplierMatches(
  category: string,
  subCategory: string,
  location: string,
  maxResults: number = 8,
): SupplierMatch[] {
  const supplierCategoryIds = CATEGORY_MAP[category] || CATEGORY_MAP["maison-reparations"]
  if (!supplierCategoryIds) return []

  const city = location.split(",")[0]?.trim() || location
  const sellers = PROFESSIONAL_SELLERS.filter(
    (s) =>
      s.verificationStatus === "active" &&
      supplierCategoryIds.some((cid) => s.categories.includes(cid)) &&
      s.deliveryZones.some((z) => z.city.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(z.city.toLowerCase())),
  )

  if (sellers.length === 0) return []

  const matches: SupplierMatch[] = []

  for (const seller of sellers) {
    const sellerProducts = MARKETPLACE_PRODUCTS.filter(
      (p): p is MaterialProduct =>
        p.vertical === "pro_supply" &&
        p.sellerId === seller.id &&
        p.status === "active" &&
        "supplierId" in p &&
        supplierCategoryIds.some((cid) => p.category.toLowerCase().includes(cid.replace("ps-", "")) || cid.includes(p.category.toLowerCase())),
    )

    const deliveryZone = seller.deliveryZones.find(
      (z) => z.city.toLowerCase().includes(city.toLowerCase()) || city.toLowerCase().includes(z.city.toLowerCase()),
    )

    for (const product of sellerProducts.slice(0, 3)) {
      const savings = product.originalPrice
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0

      matches.push({
        product,
        seller: {
          id: seller.id,
          name: seller.companyName,
          city: seller.city,
          rating: seller.rating,
          deliveryFee: deliveryZone?.price || 5000,
          isOpen: true,
          estimatedHours: deliveryZone?.estimatedDelayHours || 4,
        },
        savingsPercent: savings,
      })
    }
  }

  matches.sort((a, b) => a.product.price - b.product.price)
  return matches.slice(0, maxResults)
}

export function getRecommendedMaterials(category: string, subCategory: string): { name: string; quantity: number; unitPrice: number }[] {
  const recommendations: Record<string, { name: string; quantity: number; unitPrice: number }[]> = {
    "plomberie": [
      { name: "Flexible inox tressé 40cm", quantity: 2, unitPrice: 3500 },
      { name: "Joint d'étanchéité universel lot 10", quantity: 1, unitPrice: 2500 },
      { name: "Ruban PTFE 10m", quantity: 1, unitPrice: 1500 },
      { name: "Mastic silicone sanitaire 300ml", quantity: 1, unitPrice: 3500 },
    ],
    "electricite": [
      { name: "Câble électrique 1.5mm² 25m", quantity: 1, unitPrice: 8500 },
      { name: "Interrupteur simple allumage", quantity: 2, unitPrice: 2500 },
      { name: "Prise électrique double 2P+T", quantity: 3, unitPrice: 2800 },
      { name: "Disjoncteur 20A unipolaire", quantity: 1, unitPrice: 4500 },
    ],
    "peinture": [
      { name: "Peinture acrylique blanc mat 10L", quantity: 1, unitPrice: 22000 },
      { name: "Rouleau à peinture 18cm", quantity: 2, unitPrice: 4500 },
      { name: "Ruban de masquage 48mm x 50m", quantity: 1, unitPrice: 2500 },
      { name: "Enduit de rebouchage 1kg", quantity: 2, unitPrice: 1800 },
    ],
    "maison-reparations": [
      { name: "Flexible inox tressé 40cm", quantity: 2, unitPrice: 3500 },
      { name: "Joint d'étanchéité universel lot 10", quantity: 1, unitPrice: 2500 },
      { name: "Ruban PTFE 10m", quantity: 1, unitPrice: 1500 },
      { name: "Mastic silicone sanitaire 300ml", quantity: 1, unitPrice: 3500 },
      { name: "Clé à molette 250mm", quantity: 1, unitPrice: 6000 },
    ],
    "menuisier": [
      { name: "Planche sapin 200x20x2cm", quantity: 4, unitPrice: 3500 },
      { name: "Vis à bois 4x40mm boîte 100", quantity: 2, unitPrice: 3500 },
      { name: "Colle à bois", quantity: 1, unitPrice: 2500 },
    ],
    "carrelage": [
      { name: "Colle carrelage 25kg", quantity: 2, unitPrice: 8500 },
      { name: "Joint carrelage blanc 2kg", quantity: 3, unitPrice: 3500 },
      { name: "Croisillon carrelage 2mm sac 100", quantity: 2, unitPrice: 1500 },
    ],
  }

  return recommendations[category] || recommendations[subCategory] || [
    { name: "Kit de base", quantity: 1, unitPrice: 15000 },
  ]
}

export function findCheapestSupplier(
  productName: string,
  location: string,
): { sellerId: string; sellerName: string; price: number; deliveryFee: number } | null {
  const q = productName.toLowerCase()
  const city = location.split(",")[0]?.trim() || location

  let best: { sellerId: string; sellerName: string; price: number; deliveryFee: number } | null = null

  for (const seller of PROFESSIONAL_SELLERS) {
    if (seller.verificationStatus !== "active") continue
    const zone = seller.deliveryZones.find(
      (z) => z.city.toLowerCase().includes(city.toLowerCase()),
    )
    if (!zone) continue

    const products = MARKETPLACE_PRODUCTS.filter(
      (p): p is MaterialProduct =>
        p.vertical === "pro_supply" &&
        p.sellerId === seller.id &&
        p.isAvailable &&
        p.name.toLowerCase().includes(q),
    )

    for (const p of products) {
      if (!best || p.price + zone.price < best.price + best.deliveryFee) {
        best = {
          sellerId: seller.id,
          sellerName: seller.companyName,
          price: p.price,
          deliveryFee: zone.price,
        }
      }
    }
  }

  return best
}
