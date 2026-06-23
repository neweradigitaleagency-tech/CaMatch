export interface SubCategory {
  name: string;
  keywords: string[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: SubCategory[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: "maison-reparations",
    name: "Maison & Réparations",
    icon: "🏠",
    color: "from-[rgba(45,106,79,0.15)] to-[rgba(69,123,157,0.10)]",
    subcategories: [
      { name: "Plombier", keywords: ["plombier", "plomberie", "fuite", "eau", "robinet", "canalisation", "tuyau", "chasse d'eau", "ballon d'eau"] },
      { name: "Électricien", keywords: ["électricien", "electricien", "électricité", "electricite", "lumière", "prise", "disjoncteur", "tableau électrique", "court-circuit", "panne"] },
      { name: "Maçon", keywords: ["maçon", "mac", "construction", "mur", "fondation", "brique", "ciment", "parpaing", "béton"] },
      { name: "Peintre", keywords: ["peintre", "peinture", "peindre", "mur", "couleur", "enduit", "crépis", "lasure"] },
      { name: "Carreleur", keywords: ["carreleur", "carrelage", "carreau", "dalle", "faïence", "joint", "sol"] },
      { name: "Menuisier", keywords: ["menuisier", "menuiserie", "bois", "porte", "fenêtre", "meuble", "charpente", "étagère", "armoire"] },
      { name: "Soudeur", keywords: ["soudeur", "soudure", "souder", "métal", "fer", "acier", "portail", "grillage"] },
      { name: "Vitrier", keywords: ["vitrier", "vitre", "verre", "fenêtre", "double vitrage", "miroir", "bris"] },
      { name: "Serrurier", keywords: ["serrurier", "serrure", "clé", "clef", "porte fermée", "verrou", "coffre", "cadenas", "blindée"] },
      { name: "Climatisation", keywords: ["climatisation", "climatiseur", "clim", "climatic", "froid", "frais", "air conditionné", "réfrigération", "pompe à chaleur"] },
      { name: "Nettoyage", keywords: ["nettoyage", "nettoyer", "ménage", "propre", "entretien", "lavage", "vitre", "sol", "poussière"] },
      { name: "Jardinage", keywords: ["jardinage", "jardin", "pelouse", "tonte", "arbre", "plante", "fleur", "haie", "terrain", "espace vert"] },
    ],
  },
  {
    id: "transport-livraison",
    name: "Transport & Livraison",
    icon: "🚗",
    color: "from-[rgba(244,162,97,0.15)] to-[rgba(45,106,79,0.10)]",
    subcategories: [
      { name: "Chauffeur privé", keywords: ["chauffeur", "conducteur", "voiture", "transport", "déplacement", "course", "VTC", "taxi", "conduite"] },
      { name: "Coursier", keywords: ["coursier", "livraison", "livrer", "colis", "document", "paquet", "course rapide", "urgent"] },
      { name: "Déménagement", keywords: ["déménagement", "demenagement", "déménageur", "demenageur", "carton", "meuble", "changer de maison", "camion"] },
      { name: "Transport de marchandises", keywords: ["transport marchandises", "marchandise", "camion", "cargaison", "transport", "logistique", "fret", "livraison"] },
      { name: "Remorquage", keywords: ["remorquage", "remorque", "panne", "voiture en panne", "dépannage", "dépanneuse", "véhicule"] },
    ],
  },
  {
    id: "evenements",
    name: "Événements",
    icon: "🎉",
    color: "from-[rgba(69,123,157,0.15)] to-[rgba(244,162,97,0.10)]",
    subcategories: [
      { name: "DJ", keywords: ["dj", "disc jockey", "musique", "son", "playlist", "mix", "soirée", "fête", "animation musicale"] },
      { name: "Animateur", keywords: ["animateur", "animation", "présentateur", "maître de cérémonie", "jeu", "ambiance"] },
      { name: "Photographe", keywords: ["photographe", "photo", "photographie", "mariage", "portrait", "séance photo", "shooting", "album"] },
      { name: "Vidéaste", keywords: ["vidéaste", "vidéo", "tournage", "film", "mariage", "clip", "documentaire", "montage vidéo"] },
      { name: "Décoration", keywords: ["décoration", "deco", "décorateur", "ornement", "salle", "mariage", "anniversaire", "fête", "thème"] },
      { name: "Sonorisation", keywords: ["sonorisation", "son", "enceinte", "micro", "sono", "baffle", "système son"] },
      { name: "Éclairage", keywords: ["éclairage", "lumière", "spot", "projecteur", "guirlande", "ambiance lumineuse", "bougie"] },
      { name: "Traiteur", keywords: ["traiteur", "repas", "buffet", "cocktail", "plat", "cuisine", "mariage", "réception", "catering"] },
      { name: "Serveur", keywords: ["serveur", "service", "table", "restaurant", "réception", "mariage", "buffet", "extra"] },
      { name: "Location de matériel", keywords: ["location matériel", "location", "matériel", "tente", "table", "chaise", "vaisselle", "équipement"] },
    ],
  },
  {
    id: "education-formation",
    name: "Éducation & Formation",
    icon: "📚",
    color: "from-[rgba(82,183,136,0.15)] to-[rgba(69,123,157,0.10)]",
    subcategories: [
      { name: "Répétiteur", keywords: ["répétiteur", "repétiteur", "répétition", "cours", "soutien scolaire", "devoir", "maths", "physique", "aide aux devoirs"] },
      { name: "Informatique", keywords: ["informatique", "ordinateur", "bureautique", "word", "excel", "powerpoint", "windows", "mac"] },
      { name: "Cybersécurité", keywords: ["cybersécurité", "cybersecurite", "sécurité informatique", "hacking", "protection", "piratage", "données"] },
      { name: "Programmation", keywords: ["programmation", "programmeur", "développement", "code", "javascript", "python", "react", "html", "css", "logiciel", "site web"] },
      { name: "Intelligence artificielle", keywords: ["intelligence artificielle", "ia", "machine learning", "deep learning", "data", "chatgpt", "openai", "gpt"] },
      { name: "Langues", keywords: ["langue", "langues", "anglais", "français", "espagnol", "allemand", "cours de langue", "traduction"] },
      { name: "Préparation concours", keywords: ["préparation concours", "concours", "examen", "test", "admission", "fonction publique", "bac", "université"] },
    ],
  },
  {
    id: "social-media-informatique",
    name: "Social media & Informatique",
    icon: "💻",
    color: "from-[rgba(69,123,157,0.15)] to-[rgba(82,183,136,0.10)]",
    subcategories: [
      { name: "Développement Web", keywords: ["développement web", "developpement web", "site web", "site internet", "application web", "frontend", "backend", "fullstack", "responsive"] },
      { name: "Développement Mobile", keywords: ["développement mobile", "developpement mobile", "application mobile", "app", "ios", "android", "react native", "flutter"] },
      { name: "Design Graphique", keywords: ["design graphique", "graphiste", "designer", "affiche", "flyer", "carte visite", "bannière", "illustration", "visuel", "logo"] },
      { name: "Création Logo", keywords: ["logo", "marque", "identité visuelle", "branding", "charte graphique", "création logo"] },
      { name: "Community Management", keywords: ["community manager", "community management", "réseaux sociaux", "instagram", "facebook", "tiktok", "linkedin", "publication", "engagement"] },
      { name: "Montage Vidéo", keywords: ["montage vidéo", "montage video", "éditeur vidéo", "video editor", "capcut", "premiere pro", "final cut", "after effects"] },
      { name: "Marketing Digital", keywords: ["marketing digital", "marketing", "marketeur", "stratégie", "campagne", "acquisition", "lead", "conversion"] },
      { name: "SEO", keywords: ["seo", "référencement", "référencement naturel", "site visible", "google", "classement", "mots clés", "trafic"] },
      { name: "Publicité Facebook", keywords: ["publicité facebook", "pub facebook", "facebook ads", "meta ads", "facebook"] },
      { name: "Publicité Google", keywords: ["publicité google", "pub google", "google ads", "adwords", "google", "sea"] },
    ],
  },
  {
    id: "assistance-services",
    name: "Assistance & Services Quotidiens",
    icon: "🤝",
    color: "from-[rgba(244,162,97,0.12)] to-[rgba(45,106,79,0.10)]",
    subcategories: [
      { name: "Femme de ménage", keywords: ["femme de ménage", "femme de menage", "ménage", "nettoyage maison", "entretien", "domestique", "aide ménagère"] },
      { name: "Baby-sitter", keywords: ["baby-sitter", "babysitter", "baby sitter", "nounou", "garde d'enfant", "enfant", "bébé", "petit", "garderie"] },
      { name: "Garde-malade", keywords: ["garde-malade", "garde malade", "infirmier", "soignant", "personne âgée", "aide soignant", "malade", "soin"] },
      { name: "Assistant personnel", keywords: ["assistant personnel", "assistant", "secrétaire", "administratif", "organisation", "planning", "agenda"] },
      { name: "Courses", keywords: ["course", "courses", "commissions", "achat", "supermarché", "marché", "faire les courses", "shopping"] },
      { name: "Accompagnement administratif", keywords: ["accompagnement administratif", "administratif", "papier", "document", "cni", "passeport", "carte", "dossier", "préfecture"] },
    ],
  },
];

export function flattenSubcategories(): { categoryId: string; categoryName: string; sub: SubCategory }[] {
  const result: { categoryId: string; categoryName: string; sub: SubCategory }[] = [];
  for (const cat of SERVICE_CATEGORIES) {
    for (const sub of cat.subcategories) {
      result.push({ categoryId: cat.id, categoryName: cat.name, sub });
    }
  }
  return result;
}

export function findBestMatch(query: string): { categoryId: string; categoryName: string; subName: string; score: number } | null {
  const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const flat = flattenSubcategories();
  let best: { categoryId: string; categoryName: string; subName: string; score: number } | null = null;

  for (const item of flat) {
    let score = 0;
    const subNameNorm = item.sub.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (q.includes(subNameNorm) || subNameNorm.includes(q)) {
      score += 5;
    }
    for (const kw of item.sub.keywords) {
      const kwNorm = kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (q.includes(kwNorm)) {
        score += kwNorm.length / q.length * 3;
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { categoryId: item.categoryId, categoryName: item.categoryName, subName: item.sub.name, score };
    }
  }
  return best;
}

export function smartSearchSuggestions(query: string): { label: string; subName: string; categoryId: string }[] {
  const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const matches: { label: string; subName: string; categoryId: string }[] = [];
  const flat = flattenSubcategories();

  for (const item of flat) {
    const subNorm = item.sub.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (q.includes(subNorm) || subNorm.includes(q)) {
      matches.push({ label: item.sub.name, subName: item.sub.name, categoryId: item.categoryId });
      continue;
    }
    for (const kw of item.sub.keywords) {
      const kwNorm = kw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (q.includes(kwNorm) || kwNorm.includes(q)) {
        matches.push({ label: `${item.sub.name}`, subName: item.sub.name, categoryId: item.categoryId });
        break;
      }
    }
  }
  return matches.slice(0, 6);
}

export const CATEGORY_ICONS: Record<string, string> = {
  "maison-reparations": "🏠",
  "transport-livraison": "🚗",
  "evenements": "🎉",
  "education-formation": "📚",
  "social-media-informatique": "💻",
  "assistance-services": "🤝",
};
