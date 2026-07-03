import type { ProfessionalDetails } from "../types";
import { MOCK_PROS } from "../services/mockData";

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

const CATEGORY_MAP: Record<string, string> = {
  "maison-reparations": "maison_reparations",
  "transport-livraison": "transport_livraison",
  evenements: "evenements",
  "education-formation": "education_formation",
  "social-media-informatique": "social_media_informatique",
  "assistance-services": "assistance_services",
};

const CATEGORY_LABELS: Record<string, string> = {
  "maison-reparations": "Maison & Réparations",
  "transport-livraison": "Transport & Livraison",
  evenements: "Événements",
  "education-formation": "Éducation & Formation",
  "social-media-informatique": "Social Media & Informatique",
  "assistance-services": "Assistance & Services",
};

function proToMockProvider(pro: ProfessionalDetails, idx: number): MockProvider {
  return {
    id: pro.id,
    name: pro.name,
    category: CATEGORY_LABELS[pro.category] || pro.category,
    rating: pro.rating / 10,
    reviewCount: pro.reviewCount,
    price: pro.hourlyRateXOF,
    distance: `${(1 + (idx % 5) * 0.8).toFixed(1).replace(".", ",")} km`,
    lat: pro.lat || (5.35 + (idx % 10) * 0.015),
    lng: pro.lng || (-4.01 - (idx % 8) * 0.012),
    image: pro.avatarUrl || "",
    skills: [pro.subCategory, CATEGORY_LABELS[pro.category] || pro.category].filter(Boolean),
    yearsExp: pro.experienceYears,
  };
}

export const abidjanProviders: MockProvider[] = MOCK_PROS.map(proToMockProvider);

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
  return `${cfa.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} F`;
}
