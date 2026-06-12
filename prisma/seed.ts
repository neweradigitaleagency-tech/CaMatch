import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const firstNames = [
  "Kouamé", "Amoin", "Koné", "N'Dri", "Bamba", "Koffi", "Diallo", "Tano",
  "Ouattara", "Yao", "Kraidy", "Konan", "Zadi", "Boni", "Kouakou", "Timité",
  "Kassi", "Touré", "Mambo", "Akissi", "Kouadio", "Awa", "Lazare", "Estelle",
  "Martine", "Fanta", "Gérald", "Armande", "Ibrahim", "Emile", "Mamadou",
  "Chloé", "Souleymane", "Béatrice", "Adama", "Moussa", "Fousseni", "Salimata",
  "Nathalie", "Aminata", "Yasmine", "Fulgence", "Sidoine", "Aymar", "Murielle",
  "Joël", "Pélagie", "Arsène", "Lydie", "Dorgeles",
];

const lastNames = [
  "Coulibaly", "Touré", "Konaté", "Sangaré", "Kamagaté", "Bamba", "Koffi",
  "Kouamé", "Kouadio", "N'Guessan", "Yao", "Konan", "N'Dri", "Loba", "Aka",
  "Brou", "Ahoussou", "Dji", "Gooré", "Gboko", "Mambo", "Tano", "Kassi",
  "Zadi", "Boni", "Kraidy", "Ouattara", "Silué", "Sylla", "Diarra",
  "Keita", "Diallo", "Bah", "Cissé", "Camara", "Fofana", "Soro", "Kouyaté",
  "Traoré", "Koné",
];

const zones = [
  "Cocody", "Marcory", "Plateau", "Treichville", "Koumassi", "Yopougon",
  "Abobo", "Adjamé", "Port-Bouët", "Bingerville", "Attécoubé", "Williamsville",
  "Angré", "Riviera", "Deux-Plateaux",
];

function pick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function badgeForScore(score: number): "NONE" | "BRONZE" | "SILVER" | "GOLD" | "ELITE" {
  if (score >= 95) return "ELITE";
  if (score >= 85) return "GOLD";
  if (score >= 70) return "SILVER";
  if (score >= 50) return "BRONZE";
  return "NONE";
}

function scoreToExperience(score: number): number {
  return Math.max(1, Math.round(score * 0.18 + Math.random() * 5));
}

function scoreToMissions(score: number): number {
  return Math.round(score * 5.5 + Math.random() * 60);
}

function scoreToResponseTime(score: number): number {
  return Math.max(3, Math.round(65 - score * 0.6 + Math.random() * 8));
}

function scoreToAcceptance(score: number): number {
  return Math.min(99, Math.round(65 + score * 0.3 + Math.random() * 5));
}

function phoneFor(index: number): string {
  const base = 22501020300 + index;
  return `+225${base}`;
}

function indexToScore(index: number): number {
  const scores = [
    30, 35, 38, 42, 48,
    52, 56, 60, 63, 68,
    72, 75, 78, 80, 84,
    87, 90, 93, 96, 99,
  ];
  return scores[index] ?? 50 + index;
}

// ── Category-specific data ──

const categoryData: Record<string, {
  professions: string[];
  bios: string[];
  services: string[];
  pricings: { label: string; price: number; isStartingAt: boolean }[];
}> = {
  "Plombier": {
    professions: ["Plombier", "Plombier", "Plombière", "Plombier", "Plombier"],
    bios: [
      "Plombier expérimenté, je résous tous vos problèmes de canalisations avec rapidité et professionnalisme. Intervention dans tout Abidjan.",
      "Artisan plombier spécialisé dans l'installation sanitaire et le dépannage urgence. Devis gratuit et travail garanti.",
      "Plombière agréée avec plus de 10 ans d'expérience. Installation, rénovation et entretien de vos équipements sanitaires.",
      "Professionnel du bâtiment, je réalise tous vos travaux de plomberie: du simple robinet à la rénovation complète de salle d'eau.",
      "Jeune plombier dynamique, interventions rapides et prix abordables. Spécialiste en détection de fuites sans casse.",
    ],
    services: ["Dépannage urgence", "Installation robinetterie", "Détection fuite", "Rénovation salle de bain", "Installation chauffe-eau", "Curage canalisation"],
    pricings: [
      { label: "Dépannage standard", price: 12000, isStartingAt: true },
      { label: "Installation robinet", price: 25000, isStartingAt: false },
      { label: "Détection fuite", price: 20000, isStartingAt: false },
      { label: "Rénovation salle de bain", price: 150000, isStartingAt: true },
      { label: "Curage canalisation", price: 35000, isStartingAt: false },
    ],
  },
  "Électricien": {
    professions: ["Électricien", "Électricienne", "Électricien", "Électricien", "Électricienne"],
    bios: [
      "Électricien professionnel certifié. Installation électrique, dépannage et mise aux normes. Sécurité et conformité garanties.",
      "Spécialiste en électricité domestique et industrielle. Interventions soignées avec matériaux de qualité.",
      "Électricienne agréée, je réalise vos installations et dépannages avec précision. Devis gratuit et rapide.",
      "Artisan électricien avec 15 ans d'expérience. Domotique, tableaux électriques, éclairage. Garantie décennale.",
      "Électricien disponible 7j/7 pour tous vos dépannages urgents. Intervention rapide dans l'heure.",
    ],
    services: ["Installation électrique", "Dépannage urgences", "Tableau électrique", "Domotique", "Mise aux normes", "Éclairage intérieur/extérieur"],
    pricings: [
      { label: "Dépannage", price: 15000, isStartingAt: true },
      { label: "Installation prise", price: 5000, isStartingAt: false },
      { label: "Installation complète", price: 75000, isStartingAt: false },
      { label: "Mise aux normes", price: 50000, isStartingAt: false },
      { label: "Installation domotique", price: 200000, isStartingAt: true },
    ],
  },
  "Menuisier": {
    professions: ["Menuisier", "Menuisière", "Menuisier", "Menuisier", "Ébéniste"],
    bios: [
      "Menuisier ébéniste passionné. Meubles sur mesure, cuisines équipées, agencement intérieur. Travail artisanal de qualité.",
      "Artisan menuisier spécialisé dans la fabrication et l'installation de meubles. Bois massif et matériaux modernes.",
      "Menuisière décoratrice, je crée des pièces uniques pour votre intérieur. Alliez style et fonctionnalité.",
      "Menuisier général avec 20 ans d'expérience. Agencements, rénovations, meubles design. Devis gratuit.",
      "Ébéniste d'art, restauration de meubles anciens et création contemporaine. Pièces uniques sur commande.",
    ],
    services: ["Meubles sur mesure", "Cuisine équipée", "Agencement intérieur", "Mobilier design", "Rénovation", "Portes et fenêtres"],
    pricings: [
      { label: "Petite réparation", price: 10000, isStartingAt: true },
      { label: "Table sur mesure", price: 80000, isStartingAt: false },
      { label: "Cuisine équipée", price: 350000, isStartingAt: true },
      { label: "Bibliothèque", price: 120000, isStartingAt: false },
      { label: "Porte intérieure", price: 45000, isStartingAt: false },
    ],
  },
  "Réparateur": {
    professions: ["Réparateur téléphone", "Réparatrice smartphone", "Technicien PC", "Réparateur électroménager", "Technicienne tablette"],
    bios: [
      "Spécialiste en réparation de smartphones et tablettes. Remplacement écran, batterie, connectique. Pièces d'origine garanties.",
      "Technicien en électroménager. Je répare lave-linge, frigo, micro-ondes, cuisinière. Intervention à domicile possible.",
      "Réparatrice agréée Apple et Samsung. Diagnostique gratuit, réparation rapide avec garantie 6 mois.",
      "Expert en réparation PC et Mac. Problèmes logiciels, changement disque dur, mise à niveau. Déplacement possible.",
      "Je répare tous vos appareils électroniques: TV, chaîne hi-fi, console de jeux. 8 ans d'expérience.",
    ],
    services: ["Remplacement écran", "Changement batterie", "Réparation logicielle", "Réparation PC/Mac", "Réparation électroménager", "Diagnostic express"],
    pricings: [
      { label: "Diagnostic", price: 5000, isStartingAt: true },
      { label: "Remplacement écran", price: 25000, isStartingAt: false },
      { label: "Nettoyage logiciel", price: 7000, isStartingAt: true },
      { label: "Réparation PC", price: 20000, isStartingAt: false },
      { label: "Dépannage électroménager", price: 15000, isStartingAt: false },
    ],
  },
  "Ménager": {
    professions: ["Femme de ménage", "Agent d'entretien", "Nettoyeur professionnel", "Aide ménagère", "Responsable nettoyage"],
    bios: [
      "Service de nettoyage professionnel pour particuliers et entreprises. Équipe ponctuelle, produits écologiques, résultat impeccable.",
      "Agent d'entretien expérimenté. Nettoyage de bureaux, villas et appartements. Références fournies sur demande.",
      "Aide ménagère à domicile. Repassage, ménage, vitres. Je travaille avec sérieux et discrétion.",
      "Entreprise de nettoyage spécialisée dans les locaux professionnels. Devis gratuit, intervention rapide.",
      "Service de ménage complet avec produit et matériel fournis. De la poussière aux vitres, tout est nickel.",
    ],
    services: ["Nettoyage complet", "Nettoyage bureau", "Repassage", "Nettoyage vitres", "Grand nettoyage", "Nettoyage après travaux"],
    pricings: [
      { label: "Ménage 2h", price: 10000, isStartingAt: true },
      { label: "Nettoyage vitres", price: 15000, isStartingAt: false },
      { label: "Nettoyage bureau", price: 25000, isStartingAt: false },
      { label: "Grand nettoyage", price: 35000, isStartingAt: true },
      { label: "Repassage", price: 8000, isStartingAt: false },
    ],
  },
  "Cours & Coaching": {
    professions: ["Professeur d'anglais", "Coach sportif", "Professeur de maths", "Professeur de français", "Coach en développement"],
    bios: [
      "Professeur d'anglais certifié. Cours pour tous niveaux: scolaire, professionnel, conversation. Méthode interactive et résultats garantis.",
      "Coach sportif diplômé. Programmes personnalisés en musculation, cardio et perte de poids. Suivi en ligne et en présentiel.",
      "Professeur de mathématiques et sciences. J'accompagne les élèves du collège au lycée avec pédagogie adaptée.",
      "Professeur de français langue étrangère. Préparation aux examens, conversation, écriture. Cours particuliers ou en groupe.",
      "Coach en développement personnel. Accompagnement pour atteindre vos objectifs: confiance, organisation, leadership.",
    ],
    services: ["Cours d'anglais", "Coaching personnel", "Mathématiques", "Français", "Préparation examens", "Soutien scolaire"],
    pricings: [
      { label: "Cours 1h", price: 6000, isStartingAt: true },
      { label: "Forfait 10 séances", price: 55000, isStartingAt: false },
      { label: "Coaching mensuel", price: 80000, isStartingAt: false },
      { label: "Préparation examen", price: 15000, isStartingAt: true },
      { label: "Soutien scolaire", price: 5000, isStartingAt: false },
    ],
  },
  "Climatisation": {
    professions: ["Climaticien", "Installateur clim", "Technicien frigoriste", "Climaticienne", "Expert climatisation"],
    bios: [
      "Expert en climatisation depuis 15 ans. Installation, entretien et dépannage de tous types de clims. Agréé par les principales marques.",
      "Technicien frigoriste professionnel. Intervention 7j/7 sur tout Abidjan. Devis gratuit et travail garanti.",
      "Installateur de systèmes de climatisation et ventilation. Neuf et rénovation, particuliers et professionnels.",
      "Climaticienne agréée, spécialiste en entretien et dépannage de climatiseurs. Pièces d'origine et garantie.",
      "Spécialiste en froid et climatisation. Installation de split, gainable, central. Économie d'énergie garantie.",
    ],
    services: ["Installation climatisation", "Dépannage urgence", "Entretien annuel", "Nettoyage clim", "Ventilation", "Dépannage froid"],
    pricings: [
      { label: "Nettoyage clim", price: 10000, isStartingAt: true },
      { label: "Entretien clim", price: 15000, isStartingAt: false },
      { label: "Installation split", price: 85000, isStartingAt: false },
      { label: "Dépannage urgence", price: 25000, isStartingAt: false },
      { label: "Installation gainable", price: 350000, isStartingAt: true },
    ],
  },
  "Coiffure & Beauté": {
    professions: ["Coiffeuse", "Coiffeur", "Barbier", "Maquilleuse", "Esthéticienne", "Manucure"],
    bios: [
      "Coiffeuse professionnelle spécialisée dans les tresses, tissages et coupes modernes. Salon climatisé, produits de qualité.",
      "Barbier traditionnel et moderne. Coupe, barbe, soins visage. Ambiance conviviale et résultats impeccables.",
      "Maquilleuse professionnelle pour tous vos événements. Mariage, soirée, shooting. Produits hypoallergéniques de luxe.",
      "Esthéticienne diplômée. Soins du visage, épilation, massage. Détente et bien-être dans un cadre apaisant.",
      "Manucure pédicure experte. Pose de vernis semi-permanent, ongle gel, nail art. Des mains et pieds sublimes.",
    ],
    services: ["Tresses et tissages", "Coupe et brushing", "Barbe et moustache", "Maquillage événementiel", "Soins du visage", "Manucure pédicure"],
    pricings: [
      { label: "Coupe + brushing", price: 10000, isStartingAt: true },
      { label: "Tissage complet", price: 35000, isStartingAt: false },
      { label: "Coupe barbe", price: 5000, isStartingAt: false },
      { label: "Maquillage mariage", price: 50000, isStartingAt: true },
      { label: "Pose de vernis", price: 8000, isStartingAt: false },
    ],
  },
};

async function main() {
  // ── 1. Seed categories ──
  const categories = [
    { name: "Plombier", slug: "plombier", icon: "Wrench", order: 1 },
    { name: "Électricien", slug: "electricien", icon: "Lightbulb", order: 2 },
    { name: "Menuisier", slug: "menuisier", icon: "Sofa", order: 3 },
    { name: "Réparateur", slug: "reparateur", icon: "Smartphone", order: 4 },
    { name: "Ménager", slug: "menager", icon: "Sparkles", order: 5 },
    { name: "Cours & Coaching", slug: "cours-coaching", icon: "BookOpen", order: 6 },
    { name: "Climatisation", slug: "climatisation", icon: "Wind", order: 7 },
    { name: "Coiffure & Beauté", slug: "coiffure-beaute", icon: "Scissors", order: 8 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, order: cat.order },
      create: cat,
    });
  }
  console.log("✅ 8 catégories créées");

  // ── 2. Clear old data ──
  await prisma.review.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.message.deleteMany();
  await prisma.pricing.deleteMany();
  await prisma.service.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.savedPro.deleteMany();
  await prisma.profileView.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  console.log("🧹 Anciennes données supprimées");

  // ── 3. Demo client ──
  const client = await prisma.user.create({
    data: {
      phone: "+2250101020304",
      role: "CLIENT",
      status: "ACTIVE",
      profile: {
        create: {
          firstName: "Ahou",
          lastName: "Mireille",
          profession: "Cliente",
          bio: "Client Ça Match",
          zone: ["Cocody", "Marcory"],
          trustScore: 100,
          badge: "NONE",
        },
      },
    },
  });
  console.log("✅ Client démo créé");

  // ── 4. Generate 20 pros per category ──
  let phoneIndex = 1000;
  let proCount = 0;
  const proUserIds: string[] = [];

  for (const [categoryName, data] of Object.entries(categoryData)) {
    const usedFirstNames = new Set<string>();
    const usedLastNames = new Set<string>();

    for (let i = 0; i < 20; i++) {
      const score = indexToScore(i);
      const badge = badgeForScore(score);
      const isEliteOrGold = badge === "ELITE" || badge === "GOLD";

      let firstName: string;
      let lastName: string;

      do { firstName = firstNames[Math.floor(Math.random() * firstNames.length)]; } while (usedFirstNames.has(firstName));
      do { lastName = lastNames[Math.floor(Math.random() * lastNames.length)]; } while (usedLastNames.has(lastName));
      usedFirstNames.add(firstName);
      usedLastNames.add(lastName);

      const profession = data.professions[i % data.professions.length];
      const bio = data.bios[i % data.bios.length];
      const proZones = pick(zones, 1 + Math.floor(Math.random() * 3));
      const serviceCount = 2 + Math.floor(Math.random() * 2);
      const proServices = pick(data.services, serviceCount);
      const pricingCount = 2 + Math.floor(Math.random() * 1);
      const proPricing = pick(data.pricings, pricingCount);
      const experience = scoreToExperience(score);
      const missionCountSeed = scoreToMissions(score);
      const responseTime = scoreToResponseTime(score);
      const acceptanceRate = scoreToAcceptance(score);

      const phone = phoneFor(phoneIndex++);

      const user = await prisma.user.create({
        data: {
          phone,
          role: "PROFESSIONAL",
          status: "ACTIVE",
          profile: {
            create: {
              firstName,
              lastName,
              profession,
              bio,
              zone: proZones,
              trustScore: score,
              badge,
              isVerified: isEliteOrGold || Math.random() > 0.4,
              isOnsiteVerified: isEliteOrGold && Math.random() > 0.3,
              experience,
              missionCount: missionCountSeed,
              responseTime,
              acceptanceRate,
              isAvailable: Math.random() > 0.2,
              onboardingCompleted: true,
              availability: { weekdays: true, weekends: Math.random() > 0.5 },
              services: {
                create: proServices.map((name) => ({ name, category: categoryName })),
              },
              pricing: {
                create: proPricing.map((pr) => ({
                  service: pr.label,
                  label: pr.label,
                  price: pr.price,
                  isStartingAt: pr.isStartingAt,
                })),
              },
            },
          },
        },
      });

      proUserIds.push(user.id);
      proCount++;
    }
    console.log(`  ✅ ${categoryName}: 20 pros créés`);
  }

  console.log(`🎉 ${proCount} pros créés avec succès !`);

  // ── 5. Create missions, reviews, and portfolio ──
  console.log("📝 Création des missions et avis...");

  const reviewComments = [
    "Excellent travail ! Très professionnel et ponctuel. Je recommande vivement.",
    "Très bon service, je suis satisfait du résultat. Prix correct.",
    "Bon travail dans l'ensemble. Quelques petits détails à améliorer mais satisfaisant.",
    "Travail correct, livré dans les délais. Communication bonne.",
    "Service moyen, le résultat n'est pas exactement ce que j'avais demandé.",
    "Déçu du service. Le professionnel n'est pas venu à l'heure convenue.",
    "Très déçu. Travail bâclé et manque de professionnalisme.",
    "Super prestation ! Je referai appel sans hésiter. Merci encore !",
    "Professionnel attentionné et à l'écoute. Très belle réalisation.",
    "Rapport qualité-prix excellent. Je recommande les yeux fermés.",
  ];

  const portfolioDescriptions = [
    "Rénovation complète - Avant / Après",
    "Installation réalisée pour un client à Cocody",
    "Projet terminé en 2 jours - Client satisfait",
    "Avant / Après - Travail effectué à Marcory",
    "Réalisation du jour - Nouveau client",
  ];

  const serviceNames = Object.values(categoryData).flatMap((d) => d.services);
  const allZones = [...zones];
  const statuses: Array<"PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"> = ["COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "ACCEPTED", "IN_PROGRESS"];

  for (const proId of proUserIds) {
    const proUser = await prisma.user.findUnique({
      where: { id: proId },
      include: { profile: { include: { services: true } } },
    });
    if (!proUser?.profile) continue;

    const score = proUser.profile.trustScore;
    const missionsCount = 1 + Math.floor(Math.random() * 3);
    let totalRating = 0;
    let reviewCount = 0;

    for (let m = 0; m < missionsCount; m++) {
      const serviceName = proUser.profile.services[m % proUser.profile.services.length]?.name || "Service standard";
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const isCompleted = status === "COMPLETED";

      // Rating correlates with pro score, with some noise
      const ratingBase = Math.round((score / 100) * 5);
      const ratingVariation = Math.floor(Math.random() * 3) - 1; // -1 to +1
      const rating = Math.max(1, Math.min(5, ratingBase + ratingVariation));

      const mission = await prisma.mission.create({
        data: {
          clientId: client.id,
          proId,
          status,
          service: serviceName,
          description: `Demande de ${serviceName.toLowerCase()} pour mon domicile`,
          address: `${pick(allZones, 1)[0]}, Abidjan`,
          agreedPrice: Math.floor(Math.random() * 80000) + 10000,
          finalPrice: isCompleted ? Math.floor(Math.random() * 90000) + 10000 : null,
          clientRating: isCompleted ? rating : null,
          completedAt: isCompleted ? new Date(Date.now() - Math.random() * 30 * 86400000) : null,
        },
      });

      if (isCompleted) {
        const comment = reviewComments[Math.floor(Math.random() * reviewComments.length)];
        await prisma.review.create({
          data: {
            missionId: mission.id,
            reviewerId: client.id,
            rating,
            comment: rating >= 3 ? comment : reviewComments[reviewComments.length - Math.ceil(Math.random() * 3)],
            isVerified: rating >= 4,
            createdAt: new Date(Date.now() - Math.random() * 30 * 86400000),
          },
        });
        totalRating += rating;
        reviewCount++;
      }
    }

    // Portfolio for GOLD / ELITE pros
    if (score >= 80) {
      const portfolioCount = 1 + Math.floor(Math.random() * 3);
      for (let p = 0; p < portfolioCount; p++) {
        await prisma.portfolioItem.create({
          data: {
            profileId: proUser.profile.id,
            type: "IMAGE",
            description: portfolioDescriptions[Math.floor(Math.random() * portfolioDescriptions.length)],
            afterUrl: "/placeholder-portfolio.jpg",
          },
        });
      }
    }
  }

  console.log("✅ Missions, avis et portfolio créés !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
