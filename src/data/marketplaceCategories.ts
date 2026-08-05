import type { MarketplaceCategory } from "../types/marketplace"

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  // ── Pro Supply ──
  {
    id: "pro_supply", vertical: "pro_supply", name: "Quincailleries",
    slug: "pro-supply", description: "Matériaux & fournitures pour professionnels",
    icon: "building-2", color: "#243318",
    children: [
      { id: "ps-ciment", name: "Ciment et liants", slug: "ciment-liants", description: "Ciment, chaux, plâtre", parentId: "pro_supply" },
      { id: "ps-aciers", name: "Aciers et fers", slug: "aciers-fers", description: "Barres, treillis, tôles", parentId: "pro_supply" },
      { id: "ps-carrelage", name: "Carrelages et revêtements", slug: "carrelages-revetements", description: "Carreaux, faïences, mosaïques", parentId: "pro_supply" },
      { id: "ps-gros-oeuvre", name: "Gros œuvre et structure", slug: "gros-oeuvre-structure", description: "Parpaings, briques, hourdis", parentId: "pro_supply" },
      { id: "ps-peinture", name: "Peintures et finitions", slug: "peintures-finitions", description: "Peinture, enduit, vernis", parentId: "pro_supply" },
      { id: "ps-plomberie", name: "Plomberie", slug: "plomberie", description: "Tuyaux, raccords, robinets", parentId: "pro_supply" },
      { id: "ps-electricite", name: "Électricité", slug: "electricite", description: "Câbles, appareillage, éclairage", parentId: "pro_supply" },
      { id: "ps-menuiserie", name: "Menuiserie et bois", slug: "menuiserie-bois", description: "Bois, portes, fenêtres", parentId: "pro_supply" },
      { id: "ps-quincaillerie", name: "Quincaillerie générale", slug: "quincaillerie-generale", description: "Clous, vis, serrures", parentId: "pro_supply" },
      { id: "ps-outillage", name: "Outillage", slug: "outillage", description: "Outils à main et électroportatifs", parentId: "pro_supply" },
      { id: "ps-equipement", name: "Équipements de chantier", slug: "equipements-chantier", description: "Échafaudages, bâches, sécurité", parentId: "pro_supply" },
      { id: "ps-clim", name: "Climatisation", slug: "climatisation", description: "Clims, ventilateurs, pièces détachées", parentId: "pro_supply" },
    ],
  },
  // ── Shopping ──
  {
    id: "shopping", vertical: "shopping", name: "Shopping",
    slug: "shopping", description: "Produits neufs",
    icon: "shopping-bag", color: "#AECB2A",
    children: [
      { id: "sh-electronique", name: "Électronique", slug: "electronique", description: "Smartphones, tablettes, PC, TV", parentId: "shopping" },
      { id: "sh-maison", name: "Maison & décoration", slug: "maison-decoration", description: "Meubles, déco, linge de maison", parentId: "shopping" },
      { id: "sh-mode", name: "Mode", slug: "mode", description: "Vêtements, chaussures, accessoires", parentId: "shopping" },
      { id: "sh-beaute", name: "Beauté", slug: "beaute", description: "Cosmétiques, parfums, soins", parentId: "shopping" },
      { id: "sh-jeux", name: "Jeux enfants", slug: "jeux-enfants", description: "Jouets, jeux, puériculture", parentId: "shopping" },
      { id: "sh-auto", name: "Automobile", slug: "automobile", description: "Accessoires auto, pièces détachées", parentId: "shopping" },
      { id: "sh-electromenager", name: "Électroménager", slug: "electromenager", description: "Réfrigérateur, lave-linge, cuisson", parentId: "shopping" },
    ],
  },
  // ── Second Hand ──
  {
    id: "second_hand", vertical: "second_hand", name: "Seconde main",
    slug: "seconde-main", description: "Articles d'occasion",
    icon: "refresh-cw", color: "#F59E0B",
    children: [
      { id: "sh-phones", name: "Téléphones", slug: "telephones", description: "Smartphones d'occasion", parentId: "second_hand" },
      { id: "sh-meubles", name: "Meubles", slug: "meubles", description: "Meubles d'occasion", parentId: "second_hand" },
      { id: "sh-vetements", name: "Vêtements", slug: "vetements", description: "Vêtements d'occasion", parentId: "second_hand" },
      { id: "sh-vehicules", name: "Véhicules", slug: "vehicules", description: "Voitures, motos d'occasion", parentId: "second_hand" },
      { id: "sh-equipements", name: "Équipements divers", slug: "equipements-divers", description: "Équipements électroniques, sport, etc.", parentId: "second_hand" },
    ],
  },
  // ── Real Estate ──
  {
    id: "real_estate", vertical: "real_estate", name: "Immobilier",
    slug: "immobilier", description: "Location, vente, Airbnb",
    icon: "home", color: "#EF4444",
    children: [
      { id: "re-location", name: "Location", slug: "location", description: "Appartements, maisons à louer", parentId: "real_estate" },
      { id: "re-vente", name: "Vente", slug: "vente", description: "Appartements, maisons à vendre", parentId: "real_estate" },
      { id: "re-airbnb", name: "Airbnb", slug: "airbnb", description: "Logements courte durée", parentId: "real_estate" },
      { id: "re-terrains", name: "Terrains", slug: "terrains", description: "Terrains nus et viabilisés", parentId: "real_estate" },
      { id: "re-commerces", name: "Commerces", slug: "commerces", description: "Locaux commerciaux et bureaux", parentId: "real_estate" },
    ],
  },
  // ── Automobile ──
  {
    id: "automobile", vertical: "automobile", name: "Automobile",
    slug: "automobile", description: "Voitures, motos, pièces détachées",
    icon: "car", color: "#3B82F6",
    children: [
      { id: "auto-voitures", name: "Voitures", slug: "voitures", description: "Véhicules neufs et occasion", parentId: "automobile" },
      { id: "auto-motos", name: "Motos", slug: "motos", description: "Motos et scooters", parentId: "automobile" },
      { id: "auto-pieces", name: "Pièces détachées", slug: "pieces-detachees", description: "Mécanique, carrosserie, pièces", parentId: "automobile" },
      { id: "auto-pneus", name: "Pneus et jantes", slug: "pneus-jantes", description: "Pneumatiques, jantes, accessoires", parentId: "automobile" },
      { id: "auto-accessoires", name: "Accessoires", slug: "accessoires-auto", description: "Audio, GPS, organes intérieurs", parentId: "automobile" },
    ],
  },
]

export function getCategoryById(id: string): MarketplaceCategory | undefined {
  return MARKETPLACE_CATEGORIES.find((c) => c.id === id)
}

export function getVerticalById(id: string): MarketplaceCategory | undefined {
  return MARKETPLACE_CATEGORIES.find((c) => c.id === id)
}

export function getSubcategoryById(id: string): { parent: MarketplaceCategory; sub: { id: string; name: string; slug: string; description: string; parentId: string } } | undefined {
  for (const cat of MARKETPLACE_CATEGORIES) {
    const sub = cat.children.find((s) => s.id === id)
    if (sub) return { parent: cat, sub }
  }
  return undefined
}
