import type {
  ProfessionalSeller, IndividualSeller, CaMatchProSeller, Seller, DeliveryZone,
} from "../types/marketplace"

// ─── Professional Sellers (Pro Supply) ───

export const PROFESSIONAL_SELLERS: ProfessionalSeller[] = [
  {
    id: "seller-pro-1", userId: "user-pro-1", type: "professional",
    verticals: ["pro_supply"],
    companyName: "Quincaillerie ABC", slug: "quincaillerie-abc",
    logo: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=200&h=200&fit=crop",
    banner: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&h=400&fit=crop",
    description: "La plus grande quincaillerie d'Abidjan. Plus de 2000 références en stock. Livraison rapide dans tout Abidjan.",
    photos: [
      "https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=800",
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800",
    ],
    address: "15 Rue des Commercants", city: "Cocody",
    phone: "+225 07 12 34 56 78", email: "contact@abc-quincaillerie.ci",
    hours: "Lun-Sam 7h30-18h30 · Dim 8h-13h",
    legalDocs: ["/docs/abc-registre.pdf", "/docs/abc-identifiant.pdf"],
    categories: ["ps-ciment", "ps-aciers", "ps-carrelage", "ps-peinture", "ps-plomberie", "ps-electricite", "ps-menuiserie", "ps-quincaillerie", "ps-outillage", "ps-equipement", "ps-gros-oeuvre", "ps-clim"],
    deliveryZones: [
      { id: "dz-abc-1", city: "Cocody", price: 5000, estimatedDelayHours: 2, isActive: true },
      { id: "dz-abc-2", city: "Plateau", price: 5000, estimatedDelayHours: 2, isActive: true },
      { id: "dz-abc-3", city: "Marcory", price: 4000, estimatedDelayHours: 3, isActive: true },
      { id: "dz-abc-4", city: "Yopougon", price: 6000, estimatedDelayHours: 4, isActive: true },
      { id: "dz-abc-5", city: "Treichville", price: 4000, estimatedDelayHours: 3, isActive: true },
    ],
    verificationStatus: "active", rating: 4.8, reviewCount: 312, totalSales: 2560,
    hasProfessionalPricing: true,
    createdAt: "2026-06-15T08:00:00Z", updatedAt: "2026-07-18T10:00:00Z",
  },
  {
    id: "seller-pro-2", userId: "user-pro-2", type: "professional",
    verticals: ["pro_supply"],
    companyName: "Matériaux Yopougon", slug: "materiaux-yopougon",
    logo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=200&h=200&fit=crop",
    banner: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=400&fit=crop",
    description: "Fournisseur de matériaux de construction à Yopougon. Prix compétitifs sur le ciment, acier et plomberie.",
    photos: ["https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800"],
    address: "45 Av. de la Liberté", city: "Yopougon",
    phone: "+225 07 34 56 78 90", email: "contact@materiaux-yop.ci",
    hours: "Lun-Ven 8h-18h · Sam 8h-16h",
    legalDocs: ["/docs/yop-registre.pdf"],
    categories: ["ps-ciment", "ps-gros-oeuvre", "ps-plomberie", "ps-electricite", "ps-peinture", "ps-equipement", "ps-outillage"],
    deliveryZones: [
      { id: "dz-yop-1", city: "Yopougon", price: 2500, estimatedDelayHours: 3, isActive: true },
      { id: "dz-yop-2", city: "Cocody", price: 5000, estimatedDelayHours: 5, isActive: true },
      { id: "dz-yop-3", city: "Marcory", price: 4500, estimatedDelayHours: 4, isActive: true },
    ],
    verificationStatus: "active", rating: 4.2, reviewCount: 156, totalSales: 1200,
    hasProfessionalPricing: false,
    createdAt: "2026-06-20T10:00:00Z", updatedAt: "2026-07-17T11:00:00Z",
  },
  {
    id: "seller-pro-3", userId: "user-pro-3", type: "professional",
    verticals: ["pro_supply"],
    companyName: "BTP Express", slug: "btp-express",
    logo: "https://images.unsplash.com/photo-1570488676426-87b3f25574fb?w=200&h=200&fit=crop",
    banner: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=400&fit=crop",
    description: "Spécialiste BTP et plomberie professionnelle. Matériaux de qualité pour les artisans et particuliers.",
    photos: [],
    address: "8 Rue de la Bourse", city: "Marcory",
    phone: "+225 07 45 67 89 01", email: "esther@btpexpress.ci",
    hours: "Lun-Sam 7h-19h",
    legalDocs: [],
    categories: ["ps-plomberie", "ps-electricite", "ps-menuiserie", "ps-peinture", "ps-equipement", "ps-outillage"],
    deliveryZones: [
      { id: "dz-btp-1", city: "Marcory", price: 3500, estimatedDelayHours: 2, isActive: true },
      { id: "dz-btp-2", city: "Plateau", price: 4000, estimatedDelayHours: 2, isActive: true },
      { id: "dz-btp-3", city: "Cocody", price: 4500, estimatedDelayHours: 3, isActive: true },
    ],
    verificationStatus: "active", rating: 4.5, reviewCount: 98, totalSales: 780,
    hasProfessionalPricing: true,
    createdAt: "2026-07-01T08:00:00Z", updatedAt: "2026-07-16T15:00:00Z",
  },
  {
    id: "seller-pro-4", userId: "user-pro-4", type: "professional",
    verticals: ["pro_supply"],
    companyName: "Fournitures Générales", slug: "fournitures-generales",
    logo: "", banner: "",
    description: "Fournitures générales pour le bâtiment et la construction.",
    photos: [],
    address: "22 Bd de la Paix", city: "Treichville",
    phone: "+225 07 56 78 90 12", email: "tano@fournitures-gen.ci",
    hours: "Lun-Ven 8h-17h30",
    legalDocs: [],
    categories: ["ps-electricite", "ps-plomberie"],
    deliveryZones: [
      { id: "dz-fg-1", city: "Treichville", price: 2000, estimatedDelayHours: 4, isActive: true },
    ],
    verificationStatus: "suspended", rating: 3.8, reviewCount: 12, totalSales: 45,
    hasProfessionalPricing: false,
    createdAt: "2026-06-28T13:00:00Z", updatedAt: "2026-07-04T16:00:00Z",
  },
  {
    id: "seller-pro-5", userId: "user-pro-5", type: "professional",
    verticals: ["pro_supply"],
    companyName: "Nouvelle Quincaillerie", slug: "nouvelle-quincaillerie",
    logo: "", banner: "",
    description: "Nouvelle quincaillerie à Cocody. Ouverture prochaine.",
    photos: [],
    address: "5 Av. Kennedy", city: "Cocody",
    phone: "+225 07 67 89 01 23", email: "paul@nouvelle-quincaillerie.ci",
    hours: "Lun-Sam 8h-18h",
    legalDocs: [],
    categories: ["ps-electricite", "ps-plomberie", "ps-outillage"],
    deliveryZones: [],
    verificationStatus: "pending", rating: 0, reviewCount: 0, totalSales: 0,
    hasProfessionalPricing: false,
    createdAt: "2026-07-10T08:00:00Z", updatedAt: "2026-07-10T08:00:00Z",
  },
  {
    id: "seller-pro-6", userId: "user-pro-6", type: "professional",
    verticals: ["pro_supply", "shopping"],
    companyName: "Plomberie Fofana", slug: "plomberie-fofana",
    logo: "https://images.unsplash.com/photo-1590959651373-a3db0f38a961?w=200&h=200&fit=crop",
    banner: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&h=400&fit=crop",
    description: "Spécialiste en plomberie et sanitaire. Tuyaux, robinets, joints, WC, lavabos. Marques européennes et locales.",
    photos: [],
    address: "12 Rue des Frères", city: "Adjamé",
    phone: "+225 07 89 01 23 45", email: "contact@plomberie-fofana.ci",
    hours: "Lun-Sam 8h-18h30",
    legalDocs: ["/docs/fofana-registre.pdf", "/docs/fofana-id.pdf"],
    categories: ["ps-plomberie"],
    deliveryZones: [
      { id: "dz-fof-1", city: "Adjamé", price: 3000, estimatedDelayHours: 2, isActive: true },
      { id: "dz-fof-2", city: "Cocody", price: 4000, estimatedDelayHours: 3, isActive: true },
      { id: "dz-fof-3", city: "Plateau", price: 3500, estimatedDelayHours: 2, isActive: true },
      { id: "dz-fof-4", city: "Yopougon", price: 5000, estimatedDelayHours: 4, isActive: true },
    ],
    verificationStatus: "active", rating: 4.6, reviewCount: 87, totalSales: 420,
    hasProfessionalPricing: true,
    createdAt: "2026-06-10T08:00:00Z", updatedAt: "2026-07-15T09:00:00Z",
  },
  {
    id: "seller-pro-7", userId: "user-pro-7", type: "professional",
    verticals: ["pro_supply"],
    companyName: "Élec Shop Abidjan", slug: "elec-shop-abidjan",
    logo: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200&h=200&fit=crop",
    banner: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1200&h=400&fit=crop",
    description: "Matériel électrique professionnel et particulier. Legrand, Schneider, Hager, Philips. Éclairage, tableau électrique, câbles.",
    photos: [],
    address: "30 Bd Valéry Giscard d'Estaing", city: "Plateau",
    phone: "+225 07 90 12 34 56", email: "info@elecshop.ci",
    hours: "Lun-Ven 8h-18h · Sam 9h-15h",
    legalDocs: [],
    categories: ["ps-electricite", "ps-clim"],
    deliveryZones: [
      { id: "dz-elec-1", city: "Plateau", price: 3000, estimatedDelayHours: 1, isActive: true },
      { id: "dz-elec-2", city: "Cocody", price: 4500, estimatedDelayHours: 2, isActive: true },
      { id: "dz-elec-3", city: "Marcory", price: 4000, estimatedDelayHours: 2, isActive: true },
    ],
    verificationStatus: "verified", rating: 4.7, reviewCount: 134, totalSales: 890,
    hasProfessionalPricing: true,
    createdAt: "2026-06-12T08:00:00Z", updatedAt: "2026-07-14T10:00:00Z",
  },
  {
    id: "seller-pro-8", userId: "user-pro-8", type: "professional",
    verticals: ["pro_supply"],
    companyName: "Matériaux Koumassi", slug: "materiaux-koumassi",
    logo: "https://images.unsplash.com/photo-1567529684892-09290a1b2d05?w=200&h=200&fit=crop",
    banner: "https://images.unsplash.com/photo-1513828583688-c52646db42da?w=1200&h=400&fit=crop",
    description: "Grossiste en matériaux de construction. Ciment, fer, sable, gravier. Livraison en camion 6m³ minimum.",
    photos: [],
    address: "Route de Koumassi", city: "Koumassi",
    phone: "+225 07 01 23 45 67", email: "commande@materiaux-koumassi.ci",
    hours: "Lun-Sam 7h-17h",
    legalDocs: [],
    categories: ["ps-ciment", "ps-aciers", "ps-gros-oeuvre"],
    deliveryZones: [
      { id: "dz-kms-1", city: "Koumassi", price: 10000, estimatedDelayHours: 4, isActive: true },
      { id: "dz-kms-2", city: "Treichville", price: 12000, estimatedDelayHours: 5, isActive: true },
      { id: "dz-kms-3", city: "Marcory", price: 15000, estimatedDelayHours: 6, isActive: true },
    ],
    verificationStatus: "active", rating: 4.3, reviewCount: 64, totalSales: 340,
    hasProfessionalPricing: true,
    createdAt: "2026-06-18T08:00:00Z", updatedAt: "2026-07-12T14:00:00Z",
  },
  {
    id: "seller-pro-9", userId: "user-pro-9", type: "professional",
    verticals: ["pro_supply"],
    companyName: "Peinture Plus", slug: "peinture-plus",
    logo: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=200&h=200&fit=crop",
    banner: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&h=400&fit=crop",
    description: "Spécialiste en peinture et décoration intérieure/extérieure. Large gamme de couleurs, rouleaux, pinceaux et accessoires.",
    photos: [],
    address: "7 Rue des Artisans", city: "Cocody",
    phone: "+225 07 11 22 33 44", email: "contact@peintureplus.ci",
    hours: "Lun-Sam 8h-18h",
    legalDocs: [],
    categories: ["ps-peinture", "ps-carrelage"],
    deliveryZones: [
      { id: "dz-pp-1", city: "Cocody", price: 3000, estimatedDelayHours: 2, isActive: true },
      { id: "dz-pp-2", city: "Plateau", price: 4000, estimatedDelayHours: 2, isActive: true },
      { id: "dz-pp-3", city: "Marcory", price: 3500, estimatedDelayHours: 3, isActive: true },
    ],
    verificationStatus: "active", rating: 4.4, reviewCount: 72, totalSales: 380,
    hasProfessionalPricing: true,
    createdAt: "2026-06-25T09:00:00Z", updatedAt: "2026-07-20T11:00:00Z",
  },
  {
    id: "seller-pro-10", userId: "user-pro-10", type: "professional",
    verticals: ["pro_supply"],
    companyName: "Menuiserie du Sud", slug: "menuiserie-du-sud",
    logo: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=200&h=200&fit=crop",
    banner: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&h=400&fit=crop",
    description: "Menuiserie bois et sur mesure. Portes, fenêtres, escaliers, meubles. Fabrication artisanale et finition soignée.",
    photos: [],
    address: "18 Av. de la République", city: "Treichville",
    phone: "+225 07 22 33 44 55", email: "atelier@menuiseriesud.ci",
    hours: "Lun-Sam 7h30-17h30",
    legalDocs: [],
    categories: ["ps-menuiserie", "ps-outillage"],
    deliveryZones: [
      { id: "dz-ms-1", city: "Treichville", price: 2000, estimatedDelayHours: 2, isActive: true },
      { id: "dz-ms-2", city: "Cocody", price: 5000, estimatedDelayHours: 4, isActive: true },
    ],
    verificationStatus: "active", rating: 4.1, reviewCount: 45, totalSales: 210,
    hasProfessionalPricing: false,
    createdAt: "2026-07-05T08:00:00Z", updatedAt: "2026-07-22T09:00:00Z",
  },
  {
    id: "seller-pro-11", userId: "user-pro-11", type: "professional",
    verticals: ["pro_supply"],
    companyName: "Carrelage Premium", slug: "carrelage-premium",
    logo: "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=200&h=200&fit=crop",
    banner: "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=1200&h=400&fit=crop",
    description: "Carrelage et sols haut de gamme. Grès cérame, faïence, mosaïque. Pose et conseil par des professionnels.",
    photos: [],
    address: "33 Rue du Commerce", city: "Marcory",
    phone: "+225 07 33 44 55 66", email: "showroom@carrelagepremium.ci",
    hours: "Lun-Sam 9h-19h",
    legalDocs: [],
    categories: ["ps-carrelage", "ps-gros-oeuvre"],
    deliveryZones: [
      { id: "dz-cp-1", city: "Marcory", price: 3000, estimatedDelayHours: 2, isActive: true },
      { id: "dz-cp-2", city: "Cocody", price: 4500, estimatedDelayHours: 3, isActive: true },
      { id: "dz-cp-3", city: "Plateau", price: 4000, estimatedDelayHours: 2, isActive: true },
      { id: "dz-cp-4", city: "Yopougon", price: 6000, estimatedDelayHours: 4, isActive: true },
    ],
    verificationStatus: "active", rating: 4.6, reviewCount: 108, totalSales: 620,
    hasProfessionalPricing: true,
    createdAt: "2026-06-08T08:00:00Z", updatedAt: "2026-07-19T14:00:00Z",
  },
  {
    id: "seller-pro-12", userId: "user-pro-12", type: "professional",
    verticals: ["pro_supply"],
    companyName: "Énergie Pro", slug: "energie-pro",
    logo: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=200&h=200&fit=crop",
    banner: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1200&h=400&fit=crop",
    description: "Solutions solaires et énergie renouvelable. Panneaux, batteries, onduleurs. Installation et maintenance.",
    photos: [],
    address: "12 Av. des Industriels", city: "Yopougon",
    phone: "+225 07 44 55 66 77", email: "contact@energiepro.ci",
    hours: "Lun-Ven 8h-17h · Sam 9h-13h",
    legalDocs: [],
    categories: ["ps-electricite", "ps-equipement"],
    deliveryZones: [
      { id: "dz-ep-1", city: "Yopougon", price: 3000, estimatedDelayHours: 3, isActive: true },
      { id: "dz-ep-2", city: "Cocody", price: 5000, estimatedDelayHours: 4, isActive: true },
      { id: "dz-ep-3", city: "Koumassi", price: 4500, estimatedDelayHours: 3, isActive: true },
    ],
    verificationStatus: "active", rating: 4.3, reviewCount: 56, totalSales: 290,
    hasProfessionalPricing: true,
    createdAt: "2026-07-02T10:00:00Z", updatedAt: "2026-07-21T16:00:00Z",
  },
]

// ─── Individual Sellers ───

export const INDIVIDUAL_SELLERS: IndividualSeller[] = [
  {
    id: "seller-ind-1", userId: "user-ind-1", type: "individual",
    verticals: ["second_hand"],
    displayName: "Aminata Koné", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    city: "Cocody", phone: "+225 07 12 34 56 78",
    phoneVerified: true, saleHistory: 23, memberSince: "2025-08-15",
    verificationStatus: "active", rating: 4.7, reviewCount: 18, totalSales: 23,
    createdAt: "2025-08-15T10:00:00Z", updatedAt: "2026-07-10T08:00:00Z",
  },
  {
    id: "seller-ind-2", userId: "user-ind-2", type: "individual",
    verticals: ["second_hand"],
    displayName: "Mamadou Traoré", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    city: "Plateau", phone: "+225 07 34 56 78 90",
    phoneVerified: true, saleHistory: 15, memberSince: "2025-10-20",
    verificationStatus: "active", rating: 4.5, reviewCount: 12, totalSales: 15,
    createdAt: "2025-10-20T10:00:00Z", updatedAt: "2026-07-08T12:00:00Z",
  },
  {
    id: "seller-ind-3", userId: "user-ind-3", type: "individual",
    verticals: ["second_hand", "shopping"],
    displayName: "Fatou Diallo", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    city: "Marcory", phone: "+225 07 45 67 89 01",
    phoneVerified: true, saleHistory: 8, memberSince: "2026-01-05",
    verificationStatus: "verified", rating: 4.2, reviewCount: 6, totalSales: 8,
    createdAt: "2026-01-05T10:00:00Z", updatedAt: "2026-07-12T14:00:00Z",
  },
  {
    id: "seller-ind-4", userId: "user-ind-4", type: "individual",
    verticals: ["second_hand"],
    displayName: "Kouamé N'Guessan", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    city: "Yopougon", phone: "+225 07 56 78 90 12",
    phoneVerified: false, saleHistory: 5, memberSince: "2026-03-10",
    verificationStatus: "verified", rating: 3.8, reviewCount: 3, totalSales: 5,
    createdAt: "2026-03-10T10:00:00Z", updatedAt: "2026-07-05T09:00:00Z",
  },
  {
    id: "seller-ind-5", userId: "user-ind-5", type: "individual",
    verticals: ["second_hand", "real_estate"],
    displayName: "Aïcha Ouattara", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
    city: "Cocody", phone: "+225 07 67 89 01 23",
    phoneVerified: true, saleHistory: 12, memberSince: "2025-06-01",
    verificationStatus: "active", rating: 4.9, reviewCount: 11, totalSales: 12,
    createdAt: "2025-06-01T10:00:00Z", updatedAt: "2026-07-15T16:00:00Z",
  },
]

// ─── CaMatch Pro Sellers ───

export const CA_MATCH_PRO_SELLERS: CaMatchProSeller[] = [
  {
    id: "seller-cm-1", userId: "user-cm-1", type: "ca_match_pro",
    verticals: ["pro_supply"],
    professionalId: "pro-plumber-1",
    businessName: "Koffi Plomberie", photo: "",
    city: "Cocody",
    hasProfessionalPricing: true,
    verificationStatus: "active", rating: 4.8, reviewCount: 45, totalSales: 120,
    createdAt: "2026-05-20T08:00:00Z", updatedAt: "2026-07-10T10:00:00Z",
  },
]

// ─── Unified helpers ───

export const ALL_SELLERS: Seller[] = [
  ...PROFESSIONAL_SELLERS,
  ...INDIVIDUAL_SELLERS,
  ...CA_MATCH_PRO_SELLERS,
]

export function getSellerById(id: string): Seller | undefined {
  const found = ALL_SELLERS.find((s) => s.id === id)
  if (!found) {
    console.warn("[getSellerById] not found for id:", id, "total sellers:", ALL_SELLERS.length)
    const fallback = PROFESSIONAL_SELLERS.find((s) => s.slug === id) || PROFESSIONAL_SELLERS.find((s) => s.id === id)
    const fallback2 = INDIVIDUAL_SELLERS.find((s) => s.id === id)
    const fallback3 = CA_MATCH_PRO_SELLERS.find((s) => s.id === id)
    return fallback || fallback2 || fallback3
  }
  return found
}

export function getSellersByVertical(vertical: string): Seller[] {
  return ALL_SELLERS.filter((s) => s.verticals.includes(vertical as never))
}

export function getSellersByCategory(categoryId: string): Seller[] {
  return PROFESSIONAL_SELLERS.filter((s) => s.categories.includes(categoryId))
}

export function formatSellerRating(rating: number): string {
  return rating > 0 ? rating.toFixed(1) : "Nouveau"
}
