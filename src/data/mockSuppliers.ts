export interface SupplierShop {
  id: string;
  name: string;
  owner: string;
  phone: string;
  address: string;
  city: string;
  rating: number;
  deliveryFee: number;
  minOrder: number;
  deliveryTime: string;
  logo: string;
  isOpen: boolean;
  products: SupplierProduct[];
}

export interface SupplierProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice?: number;
  unit: string;
  brand: string;
  image: string;
  stock: number;
  onSale: boolean;
  isAvailable: boolean;
}

const SUPPLIERS: SupplierShop[] = [
  {
    id: "supplier-1",
    name: "Quincaillerie ABC",
    owner: "Mamadou Diallo",
    phone: "+225 07 12 34 56 78",
    address: "15 Rue des Commercants",
    city: "Cocody",
    rating: 4.8,
    deliveryFee: 3000,
    minOrder: 5000,
    deliveryTime: "2h-4h",
    logo: "",
    isOpen: true,
    products: [
      { id: "sp-26", name: "Ampoule LED 12W E27", description: "Blanc froid 6500K, 25000h, économie 80%", category: "Électricité", subcategory: "Éclairage", price: 1500, originalPrice: 2000, unit: "pièce", brand: "PHILIPS", image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=200", stock: 300, onSale: true, isAvailable: true },
      { id: "sp-27", name: "Interrupteur double allumage", description: "Encastrable 2 modules, blanc, norme CE", category: "Électricité", subcategory: "Appareillage", price: 3500, originalPrice: 4200, unit: "pièce", brand: "LEGRAND", image: "", stock: 80, onSale: false, isAvailable: true },
      { id: "sp-28", name: "Prise électrique double 2P+T", description: "Avec obturateurs, encastrable, blanc", category: "Électricité", subcategory: "Appareillage", price: 2800, originalPrice: 3500, unit: "pièce", brand: "SCHNEIDER", image: "", stock: 120, onSale: false, isAvailable: true },
      { id: "sp-29", name: "Disjoncteur 20A unipolaire", description: "Modulaire 20A, pouvoir coupure 6kA", category: "Électricité", subcategory: "Tableau électrique", price: 4500, originalPrice: 5500, unit: "pièce", brand: "HAGER", image: "", stock: 60, onSale: false, isAvailable: true },
      { id: "sp-30", name: "Câble électrique 2.5mm² 50m", description: "Cuivre rigide U-1000 R2V, bleu", category: "Électricité", subcategory: "Câbles et fils", price: 22000, originalPrice: 25000, unit: "rouleau", brand: "PRYSMIAN", image: "https://images.unsplash.com/photo-1616531770192-6eaea74c2456?w=200", stock: 25, onSale: false, isAvailable: true },
      { id: "sp-31", name: "Compteur d'eau DN15", description: "Jet unique, débit 2.5m³/h", category: "Plomberie", subcategory: "Compteurs", price: 18500, originalPrice: 22000, unit: "pièce", brand: "WATERTEC", image: "", stock: 15, onSale: false, isAvailable: true },
      { id: "sp-32", name: "Raccord PVC colle DN40", description: "Raccord droit PVC pression 10 bars", category: "Plomberie", subcategory: "Raccords", price: 1200, originalPrice: 1500, unit: "pièce", brand: "NICHIREE", image: "", stock: 200, onSale: false, isAvailable: true },
      { id: "sp-11", name: "Robinet mitigeur évier chromé", description: "Monocommande cuisine, garantie 2 ans", category: "Plomberie", subcategory: "Robinets", price: 25000, originalPrice: 28000, unit: "pièce", brand: "GROHE", image: "", stock: 15, onSale: false, isAvailable: true },
      { id: "demo_sup_abc_1", name: "Flexible inox tressé 40cm", description: "Flexible d'arrivée d'eau pour évier, robinet", category: "Plomberie", subcategory: "Flexibles", price: 3500, unit: "pièce", brand: "NICHIREE", image: "", stock: 80, onSale: false, isAvailable: true },
      { id: "demo_sup_abc_2", name: "Joint d'étanchéité universel lot 10", description: "Joints caoutchouc multi-diamètres", category: "Plomberie", subcategory: "Joints", price: 2500, unit: "lot", brand: "GENERIC", image: "", stock: 150, onSale: false, isAvailable: true },
      { id: "demo_sup_abc_3", name: "Ruban PTFE 10m", description: "Ruban d'étanchéité pour filetage", category: "Plomberie", subcategory: "Étanchéité", price: 1500, unit: "pièce", brand: "GENERIC", image: "", stock: 200, onSale: false, isAvailable: true },
      { id: "demo_sup_abc_4", name: "Clé à molette 250mm", description: "Acier chrome vanadium, mâchoires réglables", category: "Outillage", subcategory: "Clés", price: 6000, unit: "pièce", brand: "STANLEY", image: "", stock: 30, onSale: false, isAvailable: true },
      { id: "demo_sup_abc_5", name: "Siphon évier double bac", description: "PVC, avec tube de trop-plein", category: "Plomberie", subcategory: "Éviers", price: 3000, unit: "pièce", brand: "NICHIREE", image: "", stock: 40, onSale: false, isAvailable: true },
      { id: "sp-38", name: "Marteau de charpentier 500g", description: "Manche bois hêtre, tête acier poli", category: "Outillage", subcategory: "Marteaux", price: 7500, originalPrice: 9000, unit: "pièce", brand: "STANLEY", image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=200", stock: 30, onSale: true, isAvailable: true },
      { id: "sp-39", name: "Tournevis set 6 pièces", description: "Cruciformes et plats, manche bi-matière", category: "Outillage", subcategory: "Tournevis", price: 12000, originalPrice: 15000, unit: "set", brand: "FACOM", image: "", stock: 20, onSale: false, isAvailable: true },
      { id: "demo_sup_abc_6", name: "Mastic silicone sanitaire blanc", description: "Cartouche 300ml, anti-moisissure", category: "Plomberie", subcategory: "Étanchéité", price: 3500, unit: "pièce", brand: "SILIRI", image: "", stock: 60, onSale: false, isAvailable: true },
      { id: "sp-44", name: "Pinceau plat 50mm", description: "Soies synthétiques qualité pro", category: "Peinture", subcategory: "Pinceaux", price: 2000, originalPrice: 2800, unit: "pièce", brand: "BÜRKLE", image: "", stock: 80, onSale: false, isAvailable: true },
      { id: "sp-45", name: "Rouleau à peinture 18cm", description: "Avec manche télescopique + 3 rechanges", category: "Peinture", subcategory: "Rouleaux", price: 4500, originalPrice: 5800, unit: "set", brand: "BÜRKLE", image: "", stock: 40, onSale: false, isAvailable: true },
      { id: "sp-46", name: "Ruban de masquage 48mm x 50m", description: "Crêpe, bonne adhérence", category: "Peinture", subcategory: "Accessoires", price: 2500, originalPrice: 3200, unit: "pièce", brand: "TESA", image: "", stock: 60, onSale: false, isAvailable: true },
    ],
  },
  {
    id: "supplier-2",
    name: "Matériaux Yopougon",
    owner: "Soro Ibrahim",
    phone: "+225 07 34 56 78 90",
    address: "45 Av. de la Liberté",
    city: "Yopougon",
    rating: 4.2,
    deliveryFee: 2500,
    minOrder: 3000,
    deliveryTime: "3h-6h",
    logo: "",
    isOpen: true,
    products: [
      { id: "sp-53", name: "Ampoule LED 15W E27", description: "Blanc chaud 3000K, équivalent 120W", category: "Électricité", subcategory: "Éclairage", price: 1800, unit: "pièce", brand: "OMNILUX", image: "", stock: 200, onSale: false, isAvailable: true },
      { id: "sp-18", name: "Interrupteur simple allumage", description: "Encastrable blanc, norme CE", category: "Électricité", subcategory: "Appareillage", price: 2500, originalPrice: 3000, unit: "pièce", brand: "LEGRAND", image: "", stock: 0, onSale: false, isAvailable: false },
      { id: "sp-20", name: "Kit câble 1.5mm² 100m", description: "Cuivre rigide U-1000 R2V, rouge", category: "Électricité", subcategory: "Câbles et fils", price: 35000, unit: "rouleau", brand: "NEXANS", image: "", stock: 10, onSale: false, isAvailable: true },
      { id: "sp-16", name: "Tube cuivre diam 14mm", description: "Barre 5m, cuivre recuit pour plomberie", category: "Plomberie", subcategory: "Tubes", price: 12000, unit: "barre", brand: "WIELAND", image: "", stock: 40, onSale: false, isAvailable: true },
      { id: "demo_sup_yop_1", name: "Robinet de lavabo chromé", description: "Mitigeur monocommande lavabo, garantie 1 an", category: "Plomberie", subcategory: "Robinets", price: 15000, originalPrice: 18000, unit: "pièce", brand: "GENERIC", image: "", stock: 25, onSale: true, isAvailable: true },
      { id: "demo_sup_yop_2", name: "Câble électrique 4mm² 50m", description: "Cuivre rigide U-1000 R2V, pour cuisinière", category: "Électricité", subcategory: "Câbles et fils", price: 32000, unit: "rouleau", brand: "PRYSMIAN", image: "", stock: 15, onSale: false, isAvailable: true },
      { id: "demo_sup_yop_3", name: "Disjoncteur différentiel 40A 30mA", description: "Type AC, modulaire 2 pôles", category: "Électricité", subcategory: "Tableau électrique", price: 12000, unit: "pièce", brand: "HAGER", image: "", stock: 20, onSale: false, isAvailable: true },
      { id: "demo_sup_yop_4", name: "Prise de courant simple 2P+T", description: "Encastrable blanc, avec obturateur", category: "Électricité", subcategory: "Appareillage", price: 1800, unit: "pièce", brand: "LEGRAND", image: "", stock: 150, onSale: false, isAvailable: true },
      { id: "demo_sup_yop_5", name: "Collier de serrage inox 20-40mm", description: "Lot de 5, vis sans fin", category: "Plomberie", subcategory: "Raccords", price: 3500, unit: "lot", brand: "GENERIC", image: "", stock: 60, onSale: false, isAvailable: true },
      { id: "demo_sup_yop_6", name: "Joint caoutchouc évier lot 5", description: "Multi-diamètres pour siphon et vidange", category: "Plomberie", subcategory: "Joints", price: 1500, unit: "lot", brand: "GENERIC", image: "", stock: 100, onSale: false, isAvailable: true },
      { id: "sp-54", name: "Scie égoïne 500mm", description: "Lame acier trempé, manche bi-matière", category: "Outillage", subcategory: "Scies", price: 5500, unit: "pièce", brand: "STANLEY", image: "", stock: 20, onSale: false, isAvailable: true },
      { id: "sp-17", name: "Peinture glycéro blanc satiné 5L", description: "Pour boiseries et métaux", category: "Peinture", subcategory: "Peinture", price: 18000, unit: "seau", brand: "AKZO", image: "", stock: 5, onSale: false, isAvailable: true },
    ],
  },
  {
    id: "supplier-3",
    name: "BTP Express",
    owner: "Achi Esther",
    phone: "+225 07 45 67 89 01",
    address: "8 Rue de la Bourse",
    city: "Marcory",
    rating: 4.5,
    deliveryFee: 3500,
    minOrder: 10000,
    deliveryTime: "1h-3h",
    logo: "",
    isOpen: true,
    products: [
      { id: "demo_sup_btp_1", name: "Robinet mitigeur évier chromé PRO", description: "Qualité supérieure, cartouche céramique, garantie 5 ans", category: "Plomberie", subcategory: "Robinets", price: 22000, unit: "pièce", brand: "GROHE", image: "", stock: 10, onSale: false, isAvailable: true },
      { id: "demo_sup_btp_2", name: "Tube cuivre diam 14mm 1m", description: "Cuivre recuit diamètre 14mm, soudable", category: "Plomberie", subcategory: "Tubes", price: 3000, unit: "mètre", brand: "WIELAND", image: "", stock: 50, onSale: false, isAvailable: true },
      { id: "demo_sup_btp_3", name: "Raccord cuivre 14mm à souder", description: "Coudes et tés en laiton chromé", category: "Plomberie", subcategory: "Raccords", price: 1000, unit: "pièce", brand: "COPPERFIT", image: "", stock: 100, onSale: false, isAvailable: true },
      { id: "demo_sup_btp_4", name: "Câble électrique 6mm² 25m", description: "Cuivre rigide pour installation puissante", category: "Électricité", subcategory: "Câbles et fils", price: 28000, unit: "rouleau", brand: "PRYSMIAN", image: "", stock: 8, onSale: false, isAvailable: true },
      { id: "demo_sup_btp_5", name: "Tableau électrique 13 modules", description: "IP65, avec porte transparente, prêt à équiper", category: "Électricité", subcategory: "Tableau électrique", price: 35000, unit: "pièce", brand: "HAGER", image: "", stock: 5, onSale: false, isAvailable: true },
      { id: "demo_sup_btp_6", name: "Disjoncteur 16A unipolaire", description: "Pour éclairage et prises, 6kA", category: "Électricité", subcategory: "Tableau électrique", price: 3800, unit: "pièce", brand: "HAGER", image: "", stock: 40, onSale: false, isAvailable: true },
      { id: "demo_sup_btp_7", name: "Prise étanche Plexo 2P+T", description: "IP44 avec capuchon, pour extérieur", category: "Électricité", subcategory: "Appareillage", price: 4500, unit: "pièce", brand: "LEGRAND", image: "", stock: 25, onSale: false, isAvailable: true },
      { id: "sp-55", name: "Gant de protection latex (paire)", description: "Taille L, protection chimique EN388", category: "Équipement", subcategory: "Sécurité", price: 2500, unit: "paire", brand: "PROMAIN", image: "", stock: 50, onSale: false, isAvailable: true },
      { id: "sp-56", name: "Bac à peinture 30x40cm", description: "Avec grille d'essorage intégrée", category: "Peinture", subcategory: "Accessoires", price: 3500, unit: "pièce", brand: "BÜRKLE", image: "", stock: 25, onSale: false, isAvailable: true },
      { id: "sp-21", name: "Plaque de plâtre BA13", description: "Standard 1.2x2.5m pour cloisonnement", category: "Matériaux", subcategory: "Plâtrerie", price: 7500, unit: "pièce", brand: "PLACO", image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200", stock: 60, onSale: false, isAvailable: true },
    ],
  },
  {
    id: "supplier-4",
    name: "Fournitures Générales",
    owner: "Tano Didier",
    phone: "+225 07 56 78 90 12",
    address: "22 Bd de la Paix",
    city: "Treichville",
    rating: 3.8,
    deliveryFee: 2000,
    minOrder: 2000,
    deliveryTime: "4h-8h",
    logo: "",
    isOpen: false,
    products: [
      { id: "demo_sup_fg_1", name: "Câble électrique 1.5mm² 25m", description: "Cuivre rigide, pour éclairage", category: "Électricité", subcategory: "Câbles et fils", price: 8500, unit: "rouleau", brand: "GENERIC", image: "", stock: 30, onSale: false, isAvailable: true },
      { id: "demo_sup_fg_2", name: "Robinet simple évier", description: "Mitigeur économique chromé", category: "Plomberie", subcategory: "Robinets", price: 8500, originalPrice: 10000, unit: "pièce", brand: "ECONOMIC", image: "", stock: 20, onSale: true, isAvailable: true },
      { id: "demo_sup_fg_3", name: "Interrupteur va-et-vient", description: "Blanc encastrable, avec plaque", category: "Électricité", subcategory: "Appareillage", price: 2200, unit: "pièce", brand: "GENERIC", image: "", stock: 60, onSale: false, isAvailable: true },
      { id: "demo_sup_fg_4", name: "Prise téléphone RJ45", description: "Encastrable blanche 2 prises", category: "Électricité", subcategory: "Appareillage", price: 3000, unit: "pièce", brand: "GENERIC", image: "", stock: 25, onSale: false, isAvailable: true },
      { id: "demo_sup_fg_5", name: "Flexible douche 1.5m", description: "Acier inoxydable, raccord universel", category: "Plomberie", subcategory: "Flexibles", price: 4000, unit: "pièce", brand: "GENERIC", image: "", stock: 35, onSale: false, isAvailable: true },
    ],
  },
  {
    id: "supplier-5",
    name: "Nouvelle Quincaillerie",
    owner: "Kouamé Paul",
    phone: "+225 07 67 89 01 23",
    address: "5 Av. Kennedy",
    city: "Cocody",
    rating: 4.0,
    deliveryFee: 3000,
    minOrder: 5000,
    deliveryTime: "2h-5h",
    logo: "",
    isOpen: true,
    products: [
      { id: "demo_sup_nq_1", name: "Goulotte GTL 40x60mm 2m", description: "Goulotte technique logement, avec clips", category: "Électricité", subcategory: "Gestion câbles", price: 4500, unit: "barre", brand: "LEGRAND", image: "", stock: 30, onSale: false, isAvailable: true },
      { id: "demo_sup_nq_2", name: "Disjoncteur 32A unipolaire", description: "Pour cuisinière et clim, 6kA", category: "Électricité", subcategory: "Tableau électrique", price: 5000, unit: "pièce", brand: "SCHNEIDER", image: "", stock: 20, onSale: false, isAvailable: true },
      { id: "demo_sup_nq_3", name: "Câble RV-K 3G2.5 20m", description: "Câble souple multi-brins pour machine", category: "Électricité", subcategory: "Câbles et fils", price: 18000, unit: "rouleau", brand: "NEXANS", image: "", stock: 12, onSale: false, isAvailable: true },
      { id: "demo_sup_nq_4", name: "Réducteur de pression d'eau", description: "DN15, pression réglable 1-6 bars", category: "Plomberie", subcategory: "Accessoires", price: 8500, unit: "pièce", brand: "WATERTEC", image: "", stock: 8, onSale: false, isAvailable: true },
      { id: "demo_sup_nq_5", name: "Vanne d'arrêt quart de tour", description: "Laiton chromé DN15, pour évier", category: "Plomberie", subcategory: "Robinets", price: 3500, unit: "pièce", brand: "NICHIREE", image: "", stock: 40, onSale: false, isAvailable: true },
      { id: "demo_sup_nq_6", name: "Kit joint silicone + pistolet", description: "Cartouche 300ml + pistolet à mastic", category: "Plomberie", subcategory: "Étanchéité", price: 5500, unit: "kit", brand: "SILIRI", image: "", stock: 25, onSale: false, isAvailable: true },
      { id: "demo_sup_nq_7", name: "Niveau laser auto nivelant", description: "Ligne croisée verte, avec trépied", category: "Outillage", subcategory: "Mesure", price: 45000, unit: "pièce", brand: "BOSCH", image: "", stock: 3, onSale: false, isAvailable: true },
    ],
  },
];

export default SUPPLIERS;

export function getSupplierById(id: string): SupplierShop | undefined {
  return SUPPLIERS.find((s) => s.id === id);
}

export function getProductsBySupplier(supplierId: string): SupplierProduct[] {
  return SUPPLIERS.find((s) => s.id === supplierId)?.products || [];
}

export function searchProducts(query: string): SupplierProduct[] {
  const q = query.toLowerCase();
  return SUPPLIERS.flatMap((s) => s.products).filter(
    (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.subcategory.toLowerCase().includes(q),
  );
}
