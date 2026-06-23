const fs = require("fs");
const DIST = {
  "maison-reparations": { subs: ["Plombier","Électricien","Maçon","Peintre","Carreleur","Menuisier","Soudeur","Vitrier","Serrurier","Climatisation","Nettoyage","Jardinage"], count: [5,5,4,4,4,5,4,4,4,5,4,4] },
  "transport-livraison": { subs: ["Chauffeur privé","Coursier","Déménagement","Transport de marchandises","Remorquage"], count: [5,5,4,4,4] },
  "evenements": { subs: ["DJ","Animateur","Photographe","Vidéaste","Décoration","Sonorisation","Éclairage","Traiteur","Serveur","Location de matériel"], count: [4,3,4,3,3,3,3,3,3,3] },
  "education-formation": { subs: ["Répétiteur","Informatique","Cybersécurité","Programmation","Intelligence artificielle","Langues","Préparation concours"], count: [3,3,2,3,2,3,2] },
  "social-media-informatique": { subs: ["Développement Web","Développement Mobile","Design Graphique","Création Logo","Community Management","Montage Vidéo","Marketing Digital","SEO","Publicité Facebook","Publicité Google"], count: [3,2,3,2,2,2,2,2,2,2] },
  "assistance-services": { subs: ["Femme de ménage","Baby-sitter","Garde-malade","Assistant personnel","Courses","Accompagnement administratif"], count: [3,3,2,2,2,2] }
};
const FN = ["Koffi","Aminata","Mamadou","Fatou","Adama","Kouamé","Aïchatou","Yao","Mariam","Soro","Bintou","Zié","Rokia","Lanciné","Maférima","Aboubacar","Yasmine","Tidiane","Maimouna","Adjaratou","Ismaël","Salimata","Fousseni","Djakaridja","Moussa","Kadiatou","Oumar","Djeneba","Vafin","Awa","Alassane","Hadja","Mamadi","Mariame","Sayon","Fanta","Karim","Binta","Chaka","Ramatou","Taoufik","Assitan","Drissa","Sitan","Moustapha","Ami","Bakary","Hawa","Makan","Safiatou"];
const LN = ["Koné","Touré","Traoré","Coulibaly","Ouattara","Diaby","Sylla","Bamba","Fofana","Soro","Keita","Diakité","Diallo","Cissé","Sangaré","Kouyaté","Camara","Dembélé","Tounkara","Sidibé","Soumahoro","Doumbia","Konaté","Kourouma","Diarra","Sissoko","Sacko","Berthé","Kanté","Sanogo"];
const TI = {};
const allSubs = [];
for (const [cat, { subs }] of Object.entries(DIST)) for (const s of subs) { 
  allSubs.push(s);
  TI[s] = [s, "Expert " + s, s + " Confirmé", s + " Agréé", "Senior " + s];
}
const AV = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face"
];
const LOC = ["Cocody","Marcory","Plateau","Yopougon","Angré","Treichville","Adjamé","Koumassi","Port-Bouët","Abobo","Riviera","Zone 4","Saint-Jean","Bingerville","Anyama"];

let id = 0;
const lines = [];
for (const [catId, { subs, count }] of Object.entries(DIST)) {
  for (let si = 0; si < subs.length; si++) {
    for (let pi = 0; pi < count[si]; pi++) {
      id++;
      const fn = FN[(id * 7 + pi * 3) % FN.length];
      const ln = LN[(id * 13 + pi * 5) % LN.length];
      const name = fn + " " + ln;
      const suf = pi > 0 ? "_" + "abcdef"[pi - 1] : "";
      const email = name.toLowerCase().replace(/[éèêë]/g,"e").replace(/[^a-z0-9.]/g,".") + suf + "@gmail.com";
      const titles = TI[subs[si]] || [subs[si], "Expert " + subs[si], subs[si] + " Confirmé"];
      const title = titles[pi % titles.length];
      const loc = LOC[(id + pi) % LOC.length] + ", Abidjan";
      const r = Math.floor(40 + Math.random() * 10);
      const rv = Math.floor(5 + Math.random() * 120);
      const rate = 7000 + Math.floor(Math.random() * 16000);
      const exp = 2 + Math.floor(Math.random() * 14);
      const cmp = Math.floor(5 + Math.random() * 160);
      const ver = Math.random() > 0.2;
      const phone = "+225 07 " + String(1000 + Math.floor(Math.random() * 8999)) + " " + String(100 + Math.floor(Math.random() * 899));
      lines.push(`  { id: "pro${id}", name: ${JSON.stringify(name)}, email: ${JSON.stringify(email)}, phoneNumber: ${JSON.stringify(phone)}, role: UserRole.PRO, avatarUrl: "${AV[(id + pi) % AV.length]}", category: ${JSON.stringify(catId)}, subCategory: ${JSON.stringify(subs[si])}, title: ${JSON.stringify(title)}, bio: "", experienceYears: ${exp}, rating: ${r}, reviewCount: ${rv}, hourlyRateXOF: ${rate}, locationNeighborhood: ${JSON.stringify(loc)}, isVerified: ${JSON.stringify(ver)}, completedInterventions: ${cmp}, availabilityStatus: "available", createdAt: "2026-06-18T05:25:00Z" },`);
    }
  }
}

fs.writeFileSync("C:\\Users\\a\\Desktop\\ça-match\\scripts\\pros_output.txt", lines.join("\n"), "utf8");
console.log("Generated " + id + " pros");
