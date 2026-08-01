export interface FreelancerProfile {
  id: string;
  name: string;
  title: string;
  category: string;
  avatarUrl: string;
  rating: number;
  reviewCount: number;
  location: string;
  verified: boolean;
  hourlyRate: number;
  badge?: string;
}

export interface FreelanceCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export const FREELANCE_CATEGORIES: FreelanceCategory[] = [
  { id: "dev", name: "Développement Web & Mobile", icon: "💻", count: 203 },
  { id: "design", name: "Graphisme & Design", icon: "🎨", count: 156 },
  { id: "marketing", name: "Marketing Digital & Social Media", icon: "📱", count: 167 },
  { id: "redaction", name: "Rédaction & Traduction", icon: "✍️", count: 89 },
  { id: "photo", name: "Photographie & Vidéo", icon: "📸", count: 98 },
  { id: "ia-data", name: "IA & Data", icon: "🤖", count: 61 },
  { id: "finance", name: "Comptabilité & Finance", icon: "💼", count: 52 },
  { id: "juridique", name: "Juridique", icon: "⚖️", count: 38 },
  { id: "consulting", name: "Consulting & Coaching", icon: "🎯", count: 74 },
  { id: "audio", name: "Musique & Audio", icon: "🎵", count: 45 },
  { id: "support", name: "Support & Assistant Virtuel", icon: "🤝", count: 112 },
];

export const FREELANCERS: Record<string, FreelancerProfile[]> = {
  "dev": [
    { id: "f5", name: "N'Guessan Franck", title: "Développeur Fullstack", category: "dev", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face", rating: 4.9, reviewCount: 112, location: "Cocody", verified: true, hourlyRate: 35000, badge: "Expert" },
    { id: "f6", name: "Diaby Aïcha", title: "Développeuse Mobile React Native", category: "dev", avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=64&h=64&fit=crop&crop=face", rating: 4.8, reviewCount: 73, location: "Plateau", verified: true, hourlyRate: 30000 },
    { id: "f7", name: "Kouamé Olivier", title: "Développeur WordPress", category: "dev", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=face", rating: 4.6, reviewCount: 98, location: "Abobo", verified: false, hourlyRate: 20000 },
  ],
  "design": [
    { id: "f1", name: "Koné Aminata", title: "Graphiste senior", category: "design", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face", rating: 4.9, reviewCount: 87, location: "Cocody", verified: true, hourlyRate: 25000, badge: "Top 5%" },
    { id: "f2", name: "Bamba Yacouba", title: "UI/UX Designer", category: "design", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face", rating: 4.7, reviewCount: 54, location: "Plateau", verified: true, hourlyRate: 30000 },
    { id: "f3", name: "Coulibaly Mariam", title: "Motion designer", category: "design", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face", rating: 4.5, reviewCount: 32, location: "Marcory", verified: false, hourlyRate: 20000 },
    { id: "f4", name: "Touré Karim", title: "Illustrateur", category: "design", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face", rating: 4.8, reviewCount: 61, location: "Yopougon", verified: true, hourlyRate: 18000 },
  ],
  "marketing": [
    { id: "f10", name: "Soro Nafissatou", title: "Community Manager", category: "marketing", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&crop=face", rating: 4.8, reviewCount: 93, location: "Cocody", verified: true, hourlyRate: 20000, badge: "Top 5%" },
    { id: "f11", name: "Konaté Ismaël", title: "Spécialiste SEA/ADS", category: "marketing", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face", rating: 4.6, reviewCount: 47, location: "Plateau", verified: true, hourlyRate: 25000 },
    { id: "f12", name: "Diarrassouba Fatoumata", title: "Stratège contenu digital", category: "marketing", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face", rating: 4.9, reviewCount: 78, location: "Marcory", verified: false, hourlyRate: 22000 },
  ],
  "redaction": [
    { id: "f8", name: "Yao Esther", title: "Rédactrice web SEO", category: "redaction", avatarUrl: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=64&h=64&fit=crop&crop=face", rating: 4.7, reviewCount: 65, location: "Cocody", verified: true, hourlyRate: 15000, badge: "Top 10%" },
    { id: "f9", name: "Koffi Arnaud", title: "Traducteur EN/FR", category: "redaction", avatarUrl: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=64&h=64&fit=crop&crop=face", rating: 4.5, reviewCount: 41, location: "Treichville", verified: true, hourlyRate: 12000 },
  ],
  "photo": [
    { id: "f13", name: "Kouakou Jean-Baptiste", title: "Photographe portrait & studio", category: "photo", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=face", rating: 4.9, reviewCount: 134, location: "Cocody", verified: true, hourlyRate: 35000 },
    { id: "f14", name: "Méité Salif", title: "Vidéaste & Monteur", category: "photo", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face", rating: 4.7, reviewCount: 89, location: "Bingerville", verified: true, hourlyRate: 40000 },
  ],
  "ia-data": [
    { id: "f21", name: "Aïcha Konaté", title: "Data Scientist", category: "ia-data", avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=64&h=64&fit=crop&crop=face", rating: 4.9, reviewCount: 45, location: "Cocody", verified: true, hourlyRate: 40000, badge: "Expert" },
    { id: "f22", name: "Ibrahim Touré", title: "Ingénieur IA / Machine Learning", category: "ia-data", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face", rating: 4.7, reviewCount: 29, location: "Plateau", verified: true, hourlyRate: 45000 },
    { id: "f27", name: "Clarisse N'Dri", title: "Analyste de données BI", category: "ia-data", avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=64&h=64&fit=crop&crop=face", rating: 4.6, reviewCount: 18, location: "Marcory", verified: false, hourlyRate: 28000 },
  ],
  "finance": [
    { id: "f23", name: "Rosine Boga", title: "Expert-comptable", category: "finance", avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=64&h=64&fit=crop&crop=face", rating: 4.8, reviewCount: 67, location: "Marcory", verified: true, hourlyRate: 35000, badge: "Top 5%" },
    { id: "f24", name: "Cheick Ouattara", title: "Analyste financier", category: "finance", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face", rating: 4.6, reviewCount: 22, location: "Plateau", verified: true, hourlyRate: 30000 },
  ],
  "juridique": [
    { id: "f25", name: "Mariam Kéita", title: "Juriste droit des affaires", category: "juridique", avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=64&h=64&fit=crop&crop=face", rating: 4.9, reviewCount: 38, location: "Cocody", verified: true, hourlyRate: 50000, badge: "Expert" },
    { id: "f26", name: "Yacouba Diabaté", title: "Consultant RGPD & droit digital", category: "juridique", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face", rating: 4.5, reviewCount: 19, location: "Yopougon", verified: false, hourlyRate: 40000 },
  ],
  "consulting": [
    { id: "f15", name: "Brou Daniel", title: "Coach en leadership", category: "consulting", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=face", rating: 4.8, reviewCount: 56, location: "Cocody", verified: true, hourlyRate: 50000, badge: "Expert" },
    { id: "f16", name: "Gnahoua Béatrice", title: "Consultante RH", category: "consulting", avatarUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=64&h=64&fit=crop&crop=face", rating: 4.6, reviewCount: 34, location: "Plateau", verified: false, hourlyRate: 40000 },
  ],
  "audio": [
    { id: "f17", name: "Dembélé Mamadou", title: "Producteur musical", category: "audio", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face", rating: 4.7, reviewCount: 43, location: "Yopougon", verified: true, hourlyRate: 30000 },
    { id: "f18", name: "Konan Serge", title: "Ingénieur son", category: "audio", avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face", rating: 4.5, reviewCount: 28, location: "Cocody", verified: false, hourlyRate: 25000 },
  ],
  "support": [
    { id: "f19", name: "Adjoua Roseline", title: "Assistante virtuelle", category: "support", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&h=64&fit=crop&crop=face", rating: 4.9, reviewCount: 167, location: "Cocody", verified: true, hourlyRate: 10000, badge: "Top 5%" },
    { id: "f20", name: "Tano Marc", title: "Support client multilingue", category: "support", avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=64&h=64&fit=crop&crop=face", rating: 4.4, reviewCount: 52, location: "Abobo", verified: true, hourlyRate: 8000 },
  ],
};

export function getFreelanceCategoryById(id: string): FreelanceCategory | undefined {
  return FREELANCE_CATEGORIES.find((c) => c.id === id);
}

export function getFreelancersByCategory(id: string): FreelancerProfile[] {
  return FREELANCERS[id] || [];
}

export function getAllFreelancers(): FreelancerProfile[] {
  return Object.values(FREELANCERS).flat();
}
