export interface SearchSubcategory {
  id: string;
  name: string;
  icon: string;
  target: string;
}

export interface SearchBranch {
  id: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  subcategories: SearchSubcategory[];
}

export const SEARCH_BRANCHES: SearchBranch[] = [
  {
    id: "services-domicile",
    label: "Services à domicile",
    icon: "🏠",
    color: "from-[rgba(45,106,79,0.18)] to-[rgba(69,123,157,0.10)]",
    description: "Pros locaux pour le quotidien : maison, transport, événements, santé",
    subcategories: [
      { id: "maison-reparations", name: "Maison & Réparations", icon: "🔧", target: "/professionals?category=maison-reparations" },
      { id: "transport-livraison", name: "Transport & Livraison", icon: "🚗", target: "/professionals?category=transport-livraison" },
      { id: "evenements", name: "Événements", icon: "🎉", target: "/professionals?category=evenements" },
      { id: "education-formation", name: "Éducation & Formation", icon: "📚", target: "/professionals?category=education-formation" },
      { id: "beaute-bien-etre", name: "Beauté & Bien-être", icon: "💇", target: "/professionals?category=beaute-bien-etre" },
      { id: "sante-domicile", name: "Santé à domicile", icon: "🩺", target: "/professionals?category=sante-domicile" },
      { id: "assistance-services", name: "Assistance & Quotidien", icon: "🤝", target: "/professionals?category=assistance-services" },
    ],
  },
  {
    id: "freelance",
    label: "Freelance",
    icon: "💻",
    color: "from-[rgba(69,123,157,0.18)] to-[rgba(82,183,136,0.10)]",
    description: "Talents digitaux pour vos projets : dev, design, marketing, data",
    subcategories: [
      { id: "dev", name: "Développement", icon: "💻", target: "/freelance?category=dev" },
      { id: "design", name: "Design", icon: "🎨", target: "/freelance?category=design" },
      { id: "marketing", name: "Marketing", icon: "📱", target: "/freelance?category=marketing" },
      { id: "redaction", name: "Rédaction & Traduction", icon: "✍️", target: "/freelance?category=redaction" },
      { id: "photo", name: "Photo & Vidéo", icon: "📸", target: "/freelance?category=photo" },
      { id: "ia-data", name: "IA & Data", icon: "🤖", target: "/freelance?category=ia-data" },
      { id: "finance", name: "Comptabilité & Finance", icon: "💼", target: "/freelance?category=finance" },
      { id: "juridique", name: "Juridique", icon: "⚖️", target: "/freelance?category=juridique" },
      { id: "audio", name: "Musique & Audio", icon: "🎵", target: "/freelance?category=audio" },
      { id: "consulting", name: "Consulting", icon: "🎯", target: "/freelance?category=consulting" },
      { id: "support", name: "Support virtuel", icon: "🤝", target: "/freelance?category=support" },
    ],
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: "🛍️",
    color: "from-[rgba(244,162,97,0.18)] to-[rgba(213,94,94,0.10)]",
    description: "Produits neufs : électronique, mode, maison, beauté",
    subcategories: [
      { id: "sh-electronique", name: "Électronique", icon: "📱", target: "/catalog?vert=shopping&sub=sh-electronique" },
      { id: "sh-electromenager", name: "Électroménager", icon: "🔌", target: "/catalog?vert=shopping&sub=sh-electromenager" },
      { id: "sh-maison", name: "Maison & déco", icon: "🛋️", target: "/catalog?vert=shopping&sub=sh-maison" },
      { id: "sh-mode", name: "Mode", icon: "👗", target: "/catalog?vert=shopping&sub=sh-mode" },
      { id: "sh-beaute", name: "Beauté", icon: "💄", target: "/catalog?vert=shopping&sub=sh-beaute" },
      { id: "boutiques", name: "Boutiques d'Abidjan", icon: "🏪", target: "/marketplace/boutiques" },
    ],
  },
  {
    id: "immobilier",
    label: "Immobilier",
    icon: "🏢",
    color: "from-[rgba(213,94,94,0.18)] to-[rgba(244,162,97,0.10)]",
    description: "Louer, acheter, courte durée : appartements, maisons, terrains",
    subcategories: [
      { id: "re-location", name: "Location", icon: "🏠", target: "/catalog?vert=real_estate&sub=re-location" },
      { id: "re-vente", name: "Achat", icon: "🏡", target: "/catalog?vert=real_estate&sub=re-vente" },
      { id: "re-airbnb", name: "Courte durée", icon: "🛎️", target: "/catalog?vert=real_estate&sub=re-airbnb" },
      { id: "re-terrains", name: "Terrains", icon: "🏞️", target: "/catalog?vert=real_estate&sub=re-terrains" },
      { id: "re-commerces", name: "Commerces", icon: "🏬", target: "/catalog?vert=real_estate&sub=re-commerces" },
    ],
  },
  {
    id: "vehicules",
    label: "Véhicules",
    icon: "🚗",
    color: "from-[rgba(59,130,246,0.18)] to-[rgba(69,123,157,0.10)]",
    description: "Voitures, motos, pièces détachées, pneus et accessoires",
    subcategories: [
      { id: "auto-voitures", name: "Voitures", icon: "🚙", target: "/catalog?vert=automobile&sub=auto-voitures" },
      { id: "auto-motos", name: "Motos", icon: "🏍️", target: "/catalog?vert=automobile&sub=auto-motos" },
      { id: "auto-pieces", name: "Pièces détachées", icon: "🔩", target: "/catalog?vert=automobile&sub=auto-pieces" },
      { id: "auto-pneus", name: "Pneus & jantes", icon: "🛞", target: "/catalog?vert=automobile&sub=auto-pneus" },
      { id: "auto-accessoires", name: "Accessoires", icon: "🎧", target: "/catalog?vert=automobile&sub=auto-accessoires" },
    ],
  },
  {
    id: "occasion",
    label: "Occasion",
    icon: "♻️",
    color: "from-[rgba(245,158,11,0.18)] to-[rgba(244,162,97,0.10)]",
    description: "Acheter et vendre de l'occasion : téléphones, meubles, vêtements",
    subcategories: [
      { id: "sh-phones", name: "Téléphones", icon: "📱", target: "/catalog?vert=second_hand&sub=sh-phones" },
      { id: "sh-vetements", name: "Vêtements", icon: "👕", target: "/catalog?vert=second_hand&sub=sh-vetements" },
      { id: "sh-meubles", name: "Meubles", icon: "🪑", target: "/catalog?vert=second_hand&sub=sh-meubles" },
      { id: "sh-vehicules", name: "Véhicules", icon: "🚗", target: "/catalog?vert=second_hand&sub=sh-vehicules" },
      { id: "sh-equipements", name: "Équipements", icon: "🎮", target: "/catalog?vert=second_hand&sub=sh-equipements" },
    ],
  },
  {
    id: "boutiques",
    label: "Boutiques d'Abidjan",
    icon: "🏪",
    color: "from-[rgba(82,183,136,0.18)] to-[rgba(45,106,79,0.10)]",
    description: "Commerces et boutiques près de chez vous, en ligne ou sur place",
    subcategories: [
      { id: "boutique-pro-supply", name: "Construction & Matériaux", icon: "🧱", target: "/marketplace/boutiques?vertical=pro_supply" },
      { id: "boutique-shopping", name: "Shopping", icon: "🛍️", target: "/marketplace/boutiques?vertical=shopping" },
      { id: "boutique-second-hand", name: "Seconde main", icon: "♻️", target: "/marketplace/boutiques?vertical=second_hand" },
      { id: "boutique-real-estate", name: "Immobilier", icon: "🏢", target: "/marketplace/boutiques?vertical=real_estate" },
      { id: "boutique-automobile", name: "Automobile", icon: "🚗", target: "/marketplace/boutiques?vertical=automobile" },
      { id: "boutique-online", name: "Boutiques en ligne", icon: "🌐", target: "/marketplace/boutiques?online=1" },
      { id: "boutique-physical", name: "Boutiques sur place", icon: "📍", target: "/marketplace/boutiques?surplace=1" },
    ],
  },
  {
    id: "materiaux",
    label: "Matériaux & Construction",
    icon: "🧱",
    color: "from-[rgba(69,123,157,0.18)] to-[rgba(45,106,79,0.10)]",
    description: "Ciment, acier, carrelage, peinture, outillage et équipements",
    subcategories: [
      { id: "ps-ciment", name: "Ciment & liants", icon: "🧱", target: "/catalog?vert=pro_supply&sub=ps-ciment" },
      { id: "ps-aciers", name: "Aciers & fers", icon: "🔩", target: "/catalog?vert=pro_supply&sub=ps-aciers" },
      { id: "ps-carrelage", name: "Carrelage", icon: "⬜", target: "/catalog?vert=pro_supply&sub=ps-carrelage" },
      { id: "ps-peinture", name: "Peintures", icon: "🎨", target: "/catalog?vert=pro_supply&sub=ps-peinture" },
      { id: "ps-plomberie", name: "Plomberie", icon: "🔧", target: "/catalog?vert=pro_supply&sub=ps-plomberie" },
      { id: "ps-electricite", name: "Électricité", icon: "💡", target: "/catalog?vert=pro_supply&sub=ps-electricite" },
      { id: "ps-menuiserie", name: "Menuiserie & bois", icon: "🪵", target: "/catalog?vert=pro_supply&sub=ps-menuiserie" },
      { id: "ps-outillage", name: "Outillage", icon: "🛠️", target: "/catalog?vert=pro_supply&sub=ps-outillage" },
    ],
  },
  {
    id: "location",
    label: "Location",
    icon: "🔑",
    color: "from-[rgba(124,58,237,0.16)] to-[rgba(69,123,157,0.10)]",
    description: "Louez équipements, véhicules ou logements le temps qu'il faut",
    subcategories: [
      { id: "loc-equipements", name: "Équipements & matériels", icon: "🛠️", target: "/catalog?vert=pro_supply&rental=1&sub=ps-equipement" },
      { id: "loc-vehicules", name: "Véhicules", icon: "🚙", target: "/catalog?vert=automobile&rental=1" },
      { id: "loc-airbnb", name: "Logements courte durée", icon: "🛎️", target: "/catalog?vert=real_estate&sub=re-airbnb" },
      { id: "loc-longue", name: "Logements longue durée", icon: "🏠", target: "/catalog?vert=real_estate&sub=re-location" },
    ],
  },
];

export function getSearchBranchById(id: string): SearchBranch | undefined {
  return SEARCH_BRANCHES.find((b) => b.id === id);
}

export function getSearchBranchSubcategory(branchId: string, subId: string): SearchSubcategory | undefined {
  const branch = getSearchBranchById(branchId);
  if (!branch) return undefined;
  return branch.subcategories.find((s) => s.id === subId);
}
