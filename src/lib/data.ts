export const CATEGORIES = [
  { name: "Plombier", slug: "plombier", icon: "💧", color: "bg-blue-50 text-blue-600" },
  { name: "Électricien", slug: "electricien", icon: "⚡", color: "bg-yellow-50 text-yellow-600" },
  { name: "Menuisier", slug: "menuisier", icon: "🔨", color: "bg-amber-50 text-amber-600" },
  { name: "Réparateur", slug: "reparateur", icon: "🔧", color: "bg-purple-50 text-purple-600" },
  { name: "Ménager", slug: "menager", icon: "🧹", color: "bg-pink-50 text-pink-600" },
  { name: "Cours & Coaching", slug: "cours-coaching", icon: "📚", color: "bg-green-50 text-green-600" },
  { name: "Climatisation", slug: "climatisation", icon: "❄️", color: "bg-cyan-50 text-cyan-600" },
  { name: "Coiffure & Beauté", slug: "coiffure-beaute", icon: "💇", color: "bg-rose-50 text-rose-600" },
];

export type Pro = {
  id: string;
  name: string;
  profession: string;
  category: string;
  rating: number;
  missions: number;
  badge: "NONE" | "BRONZE" | "SILVER" | "GOLD" | "ELITE";
  verified: boolean;
  onsiteVerified: boolean;
  responseTime: string;
  price: number;
  experience: string;
  zone: string;
  phone: string;
  trustScore: number;
  portfolio: null[];
  avatar: null;
  bio: string;
  pricing: { label: string; price: string }[];
  availability: { day: string; status: string; hours: string }[];
  reviews: { name: string; rating: number; text: string; date: string }[];
};

export const PROS: Pro[] = [
  {
    id: "1",
    name: "Koffi A.",
    profession: "Plombier",
    category: "plomberie",
    rating: 4.9,
    missions: 47,
    badge: "GOLD",
    verified: true,
    onsiteVerified: true,
    responseTime: "~5 min",
    price: 5000,
    experience: "8 ans",
    zone: "Cocody, Riviera, Angré",
    phone: "2250701020304",
    trustScore: 847,
    portfolio: [null, null, null, null, null],
    avatar: null,
    bio: "Plombier professionnel avec 8 ans d'expérience. Spécialisé en installation et réparation.",
    pricing: [
      { label: "Diagnostic", price: "5 000 FCFA" },
      { label: "Réparation standard", price: "15 000 FCFA" },
      { label: "Installation", price: "25 000 FCFA" },
    ],
    availability: [
      { day: "Aujourd'hui", status: "🟢", hours: "14h-18h" },
      { day: "Demain", status: "🟡", hours: "Sur demande" },
      { day: "Mercredi", status: "🔴", hours: "Indisponible" },
    ],
    reviews: [
      { name: "Amadou K.", rating: 5, text: "Travail impeccable, ponctuel et professionnel.", date: "10/06/2026" },
      { name: "Fatou D.", rating: 5, text: "Très bon travail, prix juste. Merci Koffi !", date: "05/06/2026" },
    ],
  },
  {
    id: "2",
    name: "Marie K.",
    profession: "Services de Ménage",
    category: "menage",
    rating: 4.8,
    missions: 32,
    badge: "SILVER",
    verified: true,
    onsiteVerified: false,
    responseTime: "~10 min",
    price: 3000,
    experience: "5 ans",
    zone: "Cocody, Riviera",
    phone: "2250705060708",
    trustScore: 720,
    portfolio: [null, null],
    avatar: null,
    bio: "Service de ménage professionnel. Maison, appartement, bureau.",
    pricing: [
      { label: "Ménage standard", price: "3 000 FCFA" },
      { label: "Ménage complet", price: "8 000 FCFA" },
    ],
    availability: [
      { day: "Aujourd'hui", status: "🟢", hours: "8h-17h" },
      { day: "Demain", status: "🟢", hours: "8h-17h" },
      { day: "Mercredi", status: "🟡", hours: "Sur demande" },
    ],
    reviews: [
      { name: "Aminata S.", rating: 5, text: "Maison impeccable, très professionnelle !", date: "08/06/2026" },
    ],
  },
  {
    id: "3",
    name: "Jean B.",
    profession: "Électricien",
    category: "electricite",
    rating: 4.9,
    missions: 51,
    badge: "GOLD",
    verified: true,
    onsiteVerified: true,
    responseTime: "~3 min",
    price: 7000,
    experience: "12 ans",
    zone: "Cocody, Angré, Deux-Plateaux",
    phone: "2250102030405",
    trustScore: 912,
    portfolio: [null, null, null, null],
    avatar: null,
    bio: "Électricien agréé. Installation, dépannage, mise aux normes.",
    pricing: [
      { label: "Diagnostic", price: "5 000 FCFA" },
      { label: "Réparation", price: "7 000 FCFA" },
      { label: "Installation complète", price: "25 000 FCFA" },
    ],
    availability: [
      { day: "Aujourd'hui", status: "🟢", hours: "9h-18h" },
      { day: "Demain", status: "🟢", hours: "9h-18h" },
      { day: "Mercredi", status: "🟡", hours: "Sur demande" },
    ],
    reviews: [
      { name: "Pierre A.", rating: 5, text: "Jean est un pro, travail soigné et rapide.", date: "01/06/2026" },
    ],
  },
  {
    id: "4",
    name: "Fatou S.",
    profession: "Coiffeuse",
    category: "coiffure",
    rating: 4.7,
    missions: 28,
    badge: "BRONZE",
    verified: false,
    onsiteVerified: false,
    responseTime: "~15 min",
    price: 4000,
    experience: "3 ans",
    zone: "Plateau, Cocody",
    phone: "2250908070605",
    trustScore: 580,
    portfolio: [null, null],
    avatar: null,
    bio: "Coiffure moderne et traditionnelle. À domicile ou au salon.",
    pricing: [
      { label: "Coupe femme", price: "4 000 FCFA" },
      { label: "Coupe homme", price: "2 000 FCFA" },
      { label: "Tresses", price: "8 000 FCFA" },
    ],
    availability: [
      { day: "Aujourd'hui", status: "🟢", hours: "10h-19h" },
      { day: "Demain", status: "🔴", hours: "Indisponible" },
      { day: "Mercredi", status: "🟢", hours: "10h-19h" },
    ],
    reviews: [
      { name: "Mariam D.", rating: 5, text: "Fatou est très talentueuse, je recommande !", date: "28/05/2026" },
    ],
  },
  {
    id: "5",
    name: "Amadou T.",
    profession: "Menuisier",
    category: "menuiserie",
    rating: 4.6,
    missions: 19,
    badge: "BRONZE",
    verified: true,
    onsiteVerified: false,
    responseTime: "~20 min",
    price: 10000,
    experience: "6 ans",
    zone: "Yopougon, Angré",
    phone: "2250504030201",
    trustScore: 610,
    portfolio: [null, null, null],
    avatar: null,
    bio: "Menuiserie générale. Meubles sur mesure, agencement intérieur.",
    pricing: [
      { label: "Petite réparation", price: "5 000 FCFA" },
      { label: "Meuble sur mesure", price: "À discuter" },
    ],
    availability: [
      { day: "Aujourd'hui", status: "🟡", hours: "Sur rendez-vous" },
      { day: "Demain", status: "🟢", hours: "8h-17h" },
      { day: "Mercredi", status: "🟢", hours: "8h-17h" },
    ],
    reviews: [],
  },
  {
    id: "6",
    name: "Sophie L.",
    profession: "Professeur de soutien",
    category: "cours",
    rating: 5.0,
    missions: 14,
    badge: "SILVER",
    verified: true,
    onsiteVerified: false,
    responseTime: "~2 min",
    price: 5000,
    experience: "10 ans",
    zone: "Cocody, Bingerville",
    phone: "2250605040302",
    trustScore: 780,
    portfolio: [],
    avatar: null,
    bio: "Enseignante certifiée. Maths, français, anglais. Tous niveaux.",
    pricing: [
      { label: "Cours particulier (1h)", price: "5 000 FCFA" },
      { label: "Forfait 10h", price: "40 000 FCFA" },
    ],
    availability: [
      { day: "Aujourd'hui", status: "🟢", hours: "15h-19h" },
      { day: "Demain", status: "🟢", hours: "15h-19h" },
      { day: "Mercredi", status: "🟡", hours: "Sur demande" },
    ],
    reviews: [
      { name: "Paul K.", rating: 5, text: "Excellente prof, ma fille a progressé en maths !", date: "15/05/2026" },
      { name: "Awa D.", rating: 5, text: "Très pédagogue et patiente.", date: "10/05/2026" },
    ],
  },
];

export function getWhatsAppUrl(phone: string, message?: string): string {
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${phone}${text}`;
}
