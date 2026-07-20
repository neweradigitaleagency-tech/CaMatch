export interface MarketplaceReview {
  id: string
  sellerId: string
  authorName: string
  authorPhoto: string
  rating: number
  comment: string
  date: string
  productName?: string
  isVerifiedPurchase: boolean
}

const avatars = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
]

const names = ["Jean K.", "Mariam S.", "Olivier T.", "Fatou D.", "Koffi N."]

function review(authorIndex: number, sellerId: string, rating: number, comment: string, daysAgo: number, product?: string): MarketplaceReview {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return {
    id: `rev-${sellerId}-${authorIndex}`,
    sellerId,
    authorName: names[authorIndex]!,
    authorPhoto: avatars[authorIndex]!,
    rating,
    comment,
    date: d.toISOString(),
    productName: product,
    isVerifiedPurchase: true,
  }
}

export const MOCK_REVIEWS: MarketplaceReview[] = [
  // Quincaillerie ABC
  review(0, "seller-pro-1", 5, "Excellent service ! Livraison rapide et produits de qualité. Le ciment était bien conforme à la description.", 2, "Ciment Portland 42.5R"),
  review(1, "seller-pro-1", 5, "Je recommande vivement. Les prix sont compétitifs et le personnel est très professionnel.", 5),
  review(2, "seller-pro-1", 4, "Bon rapport qualité-prix. La livraison était un peu en retard mais le produit est conforme.", 8, "Peinture acrylique 10L"),
  review(3, "seller-pro-1", 5, "Toujours satisfait de mes achats chez ABC. La quincaillerie de référence à Abidjan.", 12),
  review(4, "seller-pro-1", 5, "J'ai commandé des carreaux et ils sont magnifiques. Pose facile. Merci !", 15, "Carreau de ciment 20x20"),
  review(0, "seller-pro-1", 4, "Bon choix de produits. Le marteau STANLEY est de bonne qualité.", 20, "Marteau de charpentier 500g"),
  review(1, "seller-pro-1", 5, "La serrure 3 points est parfaite. Installation facile grâce aux instructions fournies.", 25, "Serrure 3 points"),

  // Matériaux Yopougon
  review(2, "seller-pro-2", 4, "Bon fournisseur pour les matériaux de construction. Prix corrects.", 3, "Ciment Portland 32.5"),
  review(3, "seller-pro-2", 3, "Le tube cuivre est OK mais le délai de livraison était long.", 7, "Tube cuivre 14mm"),
  review(4, "seller-pro-2", 5, "Excellent rapport qualité-prix sur le parpaing. Je reprendrai.", 10, "Parpaing creux 20x20x40"),
  review(2, "seller-pro-2", 4, "Produits conformes. Communication correcte avec le vendeur.", 14),

  // BTP Express
  review(0, "seller-pro-3", 5, "Produit reçu en excellent état. La perceuse Bosch est géniale !", 1, "Perceuse sans fil 18V"),
  review(1, "seller-pro-3", 5, "Montage rapide du WC suspendu. Très satisfait.", 6, "WC suspendu complet"),
  review(3, "seller-pro-3", 4, "Bonne qualité des plaques de plâtre. Livraison soignée.", 11, "Plaque de plâtre BA13"),
  review(4, "seller-pro-3", 4, "Professionnel et réactif. Je recommande.", 18),

  // Plomberie Fofana
  review(0, "seller-pro-6", 5, "Le flexible inox est de très bonne qualité. Livraison rapide.", 4, "Flexible inox tressé 40cm"),
  review(2, "seller-pro-6", 5, "Très bon vendeur. La vanne d'arrêt est solide et bien finie.", 9, "Vanne d'arrêt quart de tour"),
  review(3, "seller-pro-6", 4, "Bon produit, emballage soigné. Je recommande.", 13, "Joint silicone 300ml"),
  review(1, "seller-pro-6", 5, "Plomberie Fofana est mon fournisseur attitré. Toujours satisfait.", 22),

  // Élec Shop
  review(4, "seller-pro-7", 5, "Matériel électrique de qualité. Le disjoncteur Hager est conforme aux normes.", 2, "Disjoncteur 20A"),
  review(0, "seller-pro-7", 5, "Large choix de câbles. Prix compétitifs. Livraison rapide.", 7, "Câble électrique 2.5mm²"),
  review(2, "seller-pro-7", 4, "Bon magasin d'électricité. L'ampoule LED est puissante.", 16, "Ampoule LED 20W"),

  // Matériaux Koumassi
  review(1, "seller-pro-8", 4, "Prix intéressant pour le lot de ciment. Livraison bien organisée.", 8, "Ciment Portland 42.5R lot 10"),
  review(3, "seller-pro-8", 5, "Le fer à béton est de bonne qualité. Livré à temps pour le chantier.", 14, "Fer à béton diam 10 lot 20"),
]

export function getReviewsBySeller(sellerId: string): MarketplaceReview[] {
  return MOCK_REVIEWS.filter((r) => r.sellerId === sellerId)
}

export function getAverageRating(sellerId: string): number {
  const reviews = getReviewsBySeller(sellerId)
  if (reviews.length === 0) return 0
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
}

export function getRatingDistribution(sellerId: string): Record<number, number> {
  const reviews = getReviewsBySeller(sellerId)
  const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.forEach((r) => { dist[r.rating] = (dist[r.rating] || 0) + 1 })
  return dist
}
