export interface MarketplaceCategory {
  id: string;
  name: string;
  emoji: string;
  image: string;
  itemCount: number;
}

export interface MarketplaceProduct {
  id: string;
  title: string;
  price: number;
  images: string[];
  description: string;
  condition: "Neuf" | "Occasion" | "Don";
  category: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    phone: string;
  };
  location: string;
  published: string;
  views: number;
  specs?: { label: string; value: string }[];
  promo?: boolean;
}

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  { id: "electronique", name: "Électronique & Téléphones", emoji: "📱", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop", itemCount: 1247 },
  { id: "vetements", name: "Vêtements & Chaussures", emoji: "👕", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop", itemCount: 892 },
  { id: "meubles", name: "Meubles & Décoration", emoji: "🛋️", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop", itemCount: 563 },
  { id: "electromenager", name: "Électroménager", emoji: "🧊", image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&h=400&fit=crop", itemCount: 721 },
  { id: "vehicules", name: "Véhicules & Pièces", emoji: "🚗", image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=400&fit=crop", itemCount: 434 },
  { id: "immobilier", name: "Immobilier", emoji: "🏠", image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop", itemCount: 312 },
  { id: "sante-beaute", name: "Santé & Beauté", emoji: "💄", image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop", itemCount: 678 },
  { id: "outils", name: "Outils & Quincaillerie", emoji: "🔧", image: "https://images.unsplash.com/photo-1567721913486-6585f069b332?w=400&h=400&fit=crop", itemCount: 445 },
  { id: "sports", name: "Sports & Loisirs", emoji: "⚽", image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=400&fit=crop", itemCount: 289 },
  { id: "education", name: "Livres & Éducation", emoji: "📚", image: "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=400&h=400&fit=crop", itemCount: 367 },
  { id: "jouets", name: "Jouets & Enfants", emoji: "🧸", image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=400&fit=crop", itemCount: 254 },
  { id: "restauration", name: "Restauration & Épicerie", emoji: "🍽️", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop", itemCount: 521 },
  { id: "materiel-pro", name: "Matériel Professionnel", emoji: "🏗️", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop", itemCount: 198 },
  { id: "animaux", name: "Animaux & Accessoires", emoji: "🐾", image: "https://images.unsplash.com/photo-1454023492550-5696f8ff10e1?w=400&h=400&fit=crop", itemCount: 176 },
  { id: "services", name: "Services Divers", emoji: "🛠️", image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=400&fit=crop", itemCount: 613 },
  { id: "occasion", name: "Articles d'Occasion", emoji: "🏷️", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=400&fit=crop", itemCount: 934 },
];

function seller(name: string, id: string): MarketplaceProduct["seller"] {
  const avatars: Record<string, string> = {
    "Aminata Koné": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    "Mamadou Traoré": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    "Fatou Diallo": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    "Kouamé N'Guessan": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    "Aïcha Ouattara": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    "Drissa Bamba": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
  };
  return {
    id,
    name,
    avatar: avatars[name] || avatars["Mamadou Traoré"]!,
    rating: +(3.5 + Math.random() * 1.5).toFixed(1),
    reviewCount: Math.floor(10 + Math.random() * 90),
    verified: Math.random() > 0.5,
    phone: `+225 ${Math.floor(10000000 + Math.random() * 90000000)}`,
  };
}

const SELLERS = [
  "Aminata Koné", "Mamadou Traoré", "Fatou Diallo",
  "Kouamé N'Guessan", "Aïcha Ouattara", "Drissa Bamba",
];

export const MARKETPLACE_PRODUCTS: MarketplaceProduct[] = [
  // ── Électronique & Téléphones ──
  { id: "p1", title: "iPhone 13 Pro Max 256GB", price: 650000, images: ["https://picsum.photos/seed/iphone13/400/400", "https://picsum.photos/seed/iphone13b/400/400", "https://picsum.photos/seed/iphone13c/400/400"], description: "iPhone 13 Pro Max en excellent état. Acheté en France, débloqué tous opérateurs. Batterie à 89%. Livré avec chargeur et coque de protection.", condition: "Occasion", category: "electronique", seller: seller(SELLERS[0]!, "s1"), location: "Cocody, Abidjan", published: "2026-07-10", views: 2340, specs: [{ label: "Marque", value: "Apple" }, { label: "Modèle", value: "iPhone 13 Pro Max" }, { label: "Stockage", value: "256 Go" }, { label: "État", value: "Très bon" }, { label: "Couleur", value: "Graphite" }] },
  { id: "p2", title: "MacBook Air M2 15\" 16Go RAM", price: 1200000, images: ["https://picsum.photos/seed/macbook/400/400", "https://picsum.photos/seed/macbookb/400/400"], description: "MacBook Air M2 15 pouces, 16Go de RAM unifiée, 512Go SSD. Utilisé 6 mois. Sous garantie Apple jusqu'en décembre 2026.", condition: "Neuf", category: "electronique", seller: seller(SELLERS[2]!, "s2"), location: "Plateau, Abidjan", published: "2026-07-14", views: 1567, specs: [{ label: "Marque", value: "Apple" }, { label: "Processeur", value: "M2" }, { label: "RAM", value: "16 Go" }, { label: "Stockage", value: "512 Go SSD" }] },
  // ── Vêtements & Chaussures ──
  { id: "p3", title: "Nike Air Max 90 Triple Blanc", price: 45000, images: ["https://picsum.photos/seed/nike90/400/400", "https://picsum.photos/seed/nike90b/400/400"], description: "Nike Air Max 90 taille 42. Portées 2 fois seulement. État impeccable. Boîte d'origine fournie.", condition: "Occasion", category: "vetements", seller: seller(SELLERS[3]!, "s3"), location: "Yopougon, Abidjan", published: "2026-07-12", views: 892 },
  { id: "p4", title: "Robe Africaine en Wax Coton", price: 18000, images: ["https://picsum.photos/seed/waxrobe/400/400"], description: "Magnifique robe en wax coton 100%. Confection sur mesure. Plusieurs motifs disponibles. Taille M/L.", condition: "Neuf", category: "vetements", seller: seller(SELLERS[4]!, "s4"), location: "Treichville, Abidjan", published: "2026-07-15", views: 445 },
  // ── Meubles & Décoration ──
  { id: "p5", title: "Canapé 3 places Cuir Véritable", price: 350000, images: ["https://picsum.photos/seed/canape/400/400", "https://picsum.photos/seed/canapeb/400/400", "https://picsum.photos/seed/canavec/400/400"], description: "Canapé 3 places en cuir véritable couleur camel. Structure bois massif. Livraison et montage inclus.", condition: "Neuf", category: "meubles", seller: seller(SELLERS[1]!, "s5"), location: "Marcory, Abidjan", published: "2026-07-08", views: 1123 },
  { id: "p6", title: "Table Basse Design Scandinave", price: 85000, images: ["https://picsum.photos/seed/tablebasse/400/400"], description: "Table basse style scandinave en bois manguier massif et métal noir. Dimensions : 120x60x45 cm.", condition: "Neuf", category: "meubles", seller: seller(SELLERS[5]!, "s6"), location: "Cocody, Abidjan", published: "2026-07-13", views: 678 },
  // ── Électroménager ──
  { id: "p7", title: "Réfrigérateur Samsung 320L", price: 450000, images: ["https://picsum.photos/seed/frigo/400/400", "https://picsum.photos/seed/frigob/400/400"], description: "Réfrigérateur Samsung 320L, classe A+, inverter. Très peu utilisé. Fonctionne parfaitement.", condition: "Occasion", category: "electromenager", seller: seller(SELLERS[0]!, "s7"), location: "Adjamé, Abidjan", published: "2026-07-05", views: 892 },
  { id: "p8", title: "Lave-linge LG 7kg TurboWash", price: 280000, images: ["https://picsum.photos/seed/lavelinge/400/400"], description: "Machine à laver LG 7kg, TurboWash 360. Garantie 1 an. Efficacité énergétique A+++.", condition: "Neuf", category: "electromenager", seller: seller(SELLERS[2]!, "s8"), location: "Yopougon, Abidjan", published: "2026-07-14", views: 567, promo: true },
  // ── Véhicules & Pièces ──
  { id: "p9", title: "Toyota Yaris 2019 Climatisée", price: 7500000, images: ["https://picsum.photos/seed/toyota/400/400", "https://picsum.photos/seed/toyotab/400/400", "https://picsum.photos/seed/toyotac/400/400"], description: "Toyota Yaris 2019, 75 000 km, climatisée, direction assistée. Carte grise à jour. Contrôle technique OK.", condition: "Occasion", category: "vehicules", seller: seller(SELLERS[1]!, "s9"), location: "Plateau, Abidjan", published: "2026-07-11", views: 3456 },
  { id: "p10", title: "Pneu Michelin 205/55 R16 neuf", price: 35000, images: ["https://picsum.photos/seed/pneu/400/400"], description: "Pneu Michelin Energy Saver 205/55 R16 neuf sous emballage. Année 2025.", condition: "Neuf", category: "vehicules", seller: seller(SELLERS[3]!, "s10"), location: "Koumassi, Abidjan", published: "2026-07-16", views: 234 },
  // ── Immobilier ──
  { id: "p11", title: "Appartement 2 pièces Cocody", price: 150000000, images: ["https://picsum.photos/seed/appart/400/400", "https://picsum.photos/seed/appartb/400/400"], description: "Appartement 2 pièces meublé à Cocody Angré. 55m², salon + chambre, cuisine équipée, climatisation, eau + électricité inclus.", condition: "Neuf", category: "immobilier", seller: seller(SELLERS[4]!, "s11"), location: "Cocody, Abidjan", published: "2026-07-09", views: 5678 },
  { id: "p12", title: "Terrain 500m² – Riviera Bonoumin", price: 45000000, images: ["https://picsum.photos/seed/terrain/400/400"], description: "Terrain viabilisé de 500m² à Riviera Bonoumin. Titre foncier. Proximité écoles et commerces.", condition: "Neuf", category: "immobilier", seller: seller(SELLERS[5]!, "s12"), location: "Riviera, Abidjan", published: "2026-07-07", views: 2345 },
  // ── Santé & Beauté ──
  { id: "p13", title: "Soin Visage Complet Bio", price: 15000, images: ["https://picsum.photos/seed/soin/400/400"], description: "Coffret soin visage bio : sérum vitamine C, crème hydratante, masque purifiant. Produits naturels.", condition: "Neuf", category: "sante-beaute", seller: seller(SELLERS[0]!, "s13"), location: "Angré, Abidjan", published: "2026-07-14", views: 789 },
  { id: "p14", title: "Perruque Brésilienne 100% Naturelle", price: 65000, images: ["https://picsum.photos/seed/perruque/400/400"], description: "Perruque en cheveux brésiliens 100% naturels. Longueur 45cm. Densité 200%. Lace front.", condition: "Neuf", category: "sante-beaute", seller: seller(SELLERS[2]!, "s14"), location: "Adjamé, Abidjan", published: "2026-07-15", views: 1234, promo: true },
  // ── Outils & Quincaillerie ──
  { id: "p15", title: "Perceuse sans fil Bosch 18V", price: 55000, images: ["https://picsum.photos/seed/perceuse/400/400"], description: "Perceuse-visseuse sans fil Bosch Professional 18V. Li-Ion. 2 batteries incluses + chargeur.", condition: "Neuf", category: "outils", seller: seller(SELLERS[1]!, "s15"), location: "Yopougon, Abidjan", published: "2026-07-12", views: 567 },
  { id: "p16", title: "Kit complet jardinage 15 pièces", price: 25000, images: ["https://picsum.photos/seed/jardinage/400/400"], description: "Kit jardinage 15 outils : sécateur, pelle, râteau, binette, gants, arrosoir. Idéal pour l'entretien.", condition: "Neuf", category: "outils", seller: seller(SELLERS[3]!, "s16"), location: "Marcory, Abidjan", published: "2026-07-10", views: 345 },
  // ── Sports & Loisirs ──
  { id: "p17", title: "Vélo VTT Ghost 29\" tout suspendu", price: 180000, images: ["https://picsum.photos/seed/velo/400/400", "https://picsum.photos/seed/velob/400/400"], description: "VTT Ghost Kato FS 29 tout suspendu. Fourche Rockshox, transmission Shimano Deore 12v. Taille L.", condition: "Occasion", category: "sports", seller: seller(SELLERS[5]!, "s17"), location: "Bingerville, Abidjan", published: "2026-07-06", views: 678 },
  { id: "p18", title: "Tapis de Course Électrique", price: 220000, images: ["https://picsum.photos/seed/tapiscourse/400/400"], description: "Tapis de course pliable, moteur 2CV, 12 programmes, inclinaison motorisée. Bon état.", condition: "Occasion", category: "sports", seller: seller(SELLERS[4]!, "s18"), location: "Cocody, Abidjan", published: "2026-07-11", views: 456 },
  // ── Livres & Éducation ──
  { id: "p19", title: "Manuels Maths Terminale S (lot)", price: 12000, images: ["https://picsum.photos/seed/livres/400/400"], description: "Lot de 5 manuels maths terminale S. État neuf. Indice, Hyperbole, et 3 cahiers d'exercices.", condition: "Occasion", category: "education", seller: seller(SELLERS[0]!, "s19"), location: "Plateau, Abidjan", published: "2026-07-13", views: 234 },
  { id: "p20", title: "Cours de Langue Anglaise en Ligne", price: 25000, images: ["https://picsum.photos/seed/english/400/400"], description: "Abonnement 1 mois à notre plateforme de cours d'anglais. 50 leçons interactives + coaching WhatsApp.", condition: "Neuf", category: "education", seller: seller(SELLERS[2]!, "s20"), location: "En ligne", published: "2026-07-16", views: 567 },
  // ── Jouets & Enfants ──
  { id: "p21", title: "Poussette Joie Ziggy (3 roues)", price: 75000, images: ["https://picsum.photos/seed/poussette/400/400"], description: "Poussette Joie Ziggy 3 roues tout-terrain. Utilisée 4 mois. Très bon état. Harnais 5 points.", condition: "Occasion", category: "jouets", seller: seller(SELLERS[3]!, "s21"), location: "Angré, Abidjan", published: "2026-07-12", views: 345 },
  { id: "p22", title: "Lego City 1200 pièces", price: 22000, images: ["https://picsum.photos/seed/lego/400/400"], description: "Set Lego City Police. 1200 pièces complet. Boîte et notice incluses.", condition: "Occasion", category: "jouets", seller: seller(SELLERS[5]!, "s22"), location: "Yopougon, Abidjan", published: "2026-07-08", views: 456 },
  // ── Restauration & Épicerie ──
  { id: "p23", title: "Panier de Fruits Bio (12kg)", price: 15000, images: ["https://picsum.photos/seed/panier/400/400"], description: "Panier de fruits bio 12kg : mangues, papayes, ananas, bananes, oranges. Livraison gratuite à Abidjan.", condition: "Neuf", category: "restauration", seller: seller(SELLERS[1]!, "s23"), location: "Cocody, Abidjan", published: "2026-07-16", views: 789, promo: true },
  { id: "p24", title: "Abonnement Café Local (1 mois)", price: 8000, images: ["https://picsum.photos/seed/cafe/400/400"], description: "Découvrez notre café ivoirien de spécialité. Abonnement 1 mois : 500g de café moulu livré chaque semaine.", condition: "Neuf", category: "restauration", seller: seller(SELLERS[4]!, "s24"), location: "Abidjan", published: "2026-07-14", views: 456 },
  // ── Matériel Professionnel ──
  { id: "p25", title: "Bureau Debout Électrique 160cm", price: 320000, images: ["https://picsum.photos/seed/bureau/400/400"], description: "Bureau assis-debout électrique. Plateau 160x80cm. Mémoire 4 positions. Livré monté.", condition: "Neuf", category: "materiel-pro", seller: seller(SELLERS[0]!, "s25"), location: "Plateau, Abidjan", published: "2026-07-10", views: 345 },
  { id: "p26", title: "Imprimante Multifonction HP LaserJet", price: 175000, images: ["https://picsum.photos/seed/imprimante/400/400"], description: "HP LaserJet Pro MFP M227fdw. Impression, scan, copie, fax. WiFi. Utilisée 3 mois.", condition: "Occasion", category: "materiel-pro", seller: seller(SELLERS[2]!, "s26"), location: "Marcory, Abidjan", published: "2026-07-09", views: 456 },
  // ── Animaux & Accessoires ──
  { id: "p27", title: "Chiot Berger Allemand LOF", price: 150000, images: ["https://picsum.photos/seed/chiot/400/400", "https://picsum.photos/seed/chiotb/400/400"], description: "Chiot berger allemand LOF, né le 15/03/2026. Mâle. Vacciné, pucé, carnet de santé. Parents sur place.", condition: "Neuf", category: "animaux", seller: seller(SELLERS[1]!, "s27"), location: "Bingerville, Abidjan", published: "2026-07-15", views: 2345 },
  { id: "p28", title: "Accessoires Chat (lot 15 pièces)", price: 12000, images: ["https://picsum.photos/seed/chat/400/400"], description: "Lot 15 accessoires chat : coussin, griffoir, balle, souris, plumeau, gamelle, collier.", condition: "Neuf", category: "animaux", seller: seller(SELLERS[3]!, "s28"), location: "Yopougon, Abidjan", published: "2026-07-13", views: 345 },
  // ── Services Divers ──
  { id: "p29", title: "Nettoyage Appartement Complet", price: 25000, images: ["https://picsum.photos/seed/nettoyage/400/400"], description: "Nettoyage complet appartement T2/T3. Produits fournis. 3h de prestation. Intervention rapide.", condition: "Neuf", category: "services", seller: seller(SELLERS[5]!, "s29"), location: "Abidjan", published: "2026-07-16", views: 890 },
  { id: "p30", title: "Cours particulier Maths/Physique", price: 10000, images: ["https://picsum.photos/seed/cours/400/400"], description: "Cours particulier en mathématiques et physique. Tous niveaux de la 6ème à la terminale. Déplacement possible.", condition: "Neuf", category: "services", seller: seller(SELLERS[0]!, "s30"), location: "Abidjan", published: "2026-07-11", views: 567 },
  // ── Articles d'Occasion ──
  { id: "p31", title: "Lit 140x190 + Matelas + Sommier", price: 180000, images: ["https://picsum.photos/seed/lit/400/400"], description: "Ensemble lit 140x190 : sommier tapissier + matelas mémoire de forme. Utilisé 1 an. Très bon état.", condition: "Occasion", category: "occasion", seller: seller(SELLERS[4]!, "s31"), location: "Cocody, Abidjan", published: "2026-07-04", views: 1234 },
  { id: "p32", title: "Appareil Photo Canon EOS 2000D", price: 250000, images: ["https://picsum.photos/seed/canon/400/400", "https://picsum.photos/seed/canonb/400/400"], description: "Canon EOS 2000D + objectif 18-55mm + sac + carte 32Go + batterie supplémentaire. Très bon état.", condition: "Occasion", category: "occasion", seller: seller(SELLERS[2]!, "s32"), location: "Plateau, Abidjan", published: "2026-07-07", views: 1567 },
];

export function getProductsByCategory(categoryId: string): MarketplaceProduct[] {
  return MARKETPLACE_PRODUCTS.filter((p) => p.category === categoryId);
}

export function getProductById(productId: string): MarketplaceProduct | undefined {
  return MARKETPLACE_PRODUCTS.find((p) => p.id === productId);
}

export function getCategoryById(categoryId: string): MarketplaceCategory | undefined {
  return MARKETPLACE_CATEGORIES.find((c) => c.id === categoryId);
}

export function formatPrice(price: number): string {
  return price.toLocaleString("fr-FR") + " FCFA";
}

export function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `Il y a ${weeks} sem`;
  return `Il y a ${Math.floor(days / 30)} mois`;
}

export function filterProducts(products: MarketplaceProduct[], filters: {
  condition?: string;
  query?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
}): MarketplaceProduct[] {
  let result = [...products];

  if (filters.query) {
    const q = filters.query.toLowerCase();
    result = result.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  if (filters.condition && filters.condition !== "all") {
    result = result.filter((p) => p.condition === filters.condition);
  }
  if (filters.minPrice != null) result = result.filter((p) => p.price >= filters.minPrice!);
  if (filters.maxPrice != null) result = result.filter((p) => p.price <= filters.maxPrice!);

  switch (filters.sort) {
    case "price_asc": result.sort((a, b) => a.price - b.price); break;
    case "price_desc": result.sort((a, b) => b.price - a.price); break;
    case "popular": result.sort((a, b) => b.views - a.views); break;
    default: result.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()); break;
  }

  return result;
}
