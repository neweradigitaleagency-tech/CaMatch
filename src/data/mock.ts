export interface MockProvider {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  price: number;
  distance: string;
  lat: number;
  lng: number;
  image: string;
  skills: string[];
  yearsExp: number;
}

export const abidjanProviders: MockProvider[] = [
  {
    id: "p1",
    name: "Kouamé Jean",
    category: "Plomberie",
    rating: 4.8,
    reviewCount: 127,
    price: 5000,
    distance: "1,2 km",
    lat: 5.362,
    lng: -4.018,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    skills: ["Plomberie", "Chauffage", "Dépannage"],
    yearsExp: 8,
  },
  {
    id: "p2",
    name: "Diarrassouba Moussa",
    category: "Électricité",
    rating: 4.6,
    reviewCount: 93,
    price: 4500,
    distance: "2,0 km",
    lat: 5.366,
    lng: -4.006,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    skills: ["Électricité", "Domotique", "Câblage"],
    yearsExp: 12,
  },
  {
    id: "p3",
    name: "N'Guessan Awa",
    category: "Nettoyage",
    rating: 4.9,
    reviewCount: 210,
    price: 3000,
    distance: "0,8 km",
    lat: 5.358,
    lng: -4.012,
    image: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=200&h=200&fit=crop",
    skills: ["Nettoyage", "Repassage", "Désinfection"],
    yearsExp: 5,
  },
  {
    id: "p4",
    name: "Touré Ibrahim",
    category: "Menuiserie",
    rating: 4.7,
    reviewCount: 65,
    price: 8000,
    distance: "3,5 km",
    lat: 5.373,
    lng: -4.025,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    skills: ["Menuiserie", "Ébénisterie", "Montage"],
    yearsExp: 15,
  },
  {
    id: "p5",
    name: "Koffi Aimé",
    category: "Peinture",
    rating: 4.5,
    reviewCount: 41,
    price: 6000,
    distance: "1,8 km",
    lat: 5.352,
    lng: -4.008,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
    skills: ["Peinture", "Revêtement", "Décoration"],
    yearsExp: 10,
  },
  {
    id: "p6",
    name: "Fofana Mamadou",
    category: "Jardinage",
    rating: 4.4,
    reviewCount: 33,
    price: 4000,
    distance: "2,5 km",
    lat: 5.355,
    lng: -4.03,
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=200&h=200&fit=crop",
    skills: ["Jardinage", "Élagage", "Tonte"],
    yearsExp: 7,
  },
];

export const categories = [
  { id: "plomberie", label: "Plomberie", icon: "💧" },
  { id: "electricite", label: "Électricité", icon: "⚡" },
  { id: "nettoyage", label: "Nettoyage", icon: "🧹" },
  { id: "menuiserie", label: "Menuiserie", icon: "🪚" },
  { id: "peinture", label: "Peinture", icon: "🎨" },
  { id: "jardinage", label: "Jardinage", icon: "🌿" },
  { id: "mecanique", label: "Mécanique", icon: "🔧" },
  { id: "climatisation", label: "Climatisation", icon: "❄️" },
  { id: "serrurerie", label: "Serrurerie", icon: "🔑" },
  { id: "maçonnerie", label: "Maçonnerie", icon: "🧱" },
];

export const categoryImages: Record<string, string> = {
  plomberie: "https://images.unsplash.com/photo-1581578722626-5cae76a7a7dc?w=600&h=400&fit=crop",
  electricite: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop",
  nettoyage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop",
  menuiserie: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=600&h=400&fit=crop",
  peinture: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=600&h=400&fit=crop",
  jardinage: "https://images.unsplash.com/photo-1557429287-b2e26467fc2b?w=600&h=400&fit=crop",
};

export function formatPrice(cfa: number): string {
  return `${cfa.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} FCFA`;
}
