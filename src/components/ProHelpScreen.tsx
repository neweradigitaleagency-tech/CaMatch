import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Phone,
  Mail,
  FileText,
  Shield,
  DollarSign,
  UserCheck,
  Clock,
  ArrowLeft,
  ExternalLink,
  Search,
} from "lucide-react";
import { FaqItem } from "../types";

interface Props {
  onBack: () => void;
}

const FAQS: FaqItem[] = [
  { id: "f1", question: "Comment sont calculés mes revenus ?", answer: "Vos revenus sont calculés en soustrayant la commission plateforme (12%) du montant total de chaque mission. Le délai de paiement dépend de votre niveau de vérification : 48h pour les nouveaux, instantané pour les niveaux Élite.", category: "finance" },
  { id: "f2", question: "Comment retirer mon argent ?", answer: "Rendez-vous dans l'onglet Finance, saisissez le montant et choisissez votre mode de retrait : Wave, Orange Money ou MTN MoMo. Le transfert est généralement instantané.", category: "finance" },
  { id: "f3", question: "Que faire si un client ne se présente pas ?", answer: "Contactez le support dans les 15 minutes suivant l'heure prévue. Vous serez indemnisé à hauteur de 50% du montant estimé si le client est absent sans prévenir.", category: "support" },
  { id: "f4", question: "Comment fonctionne la vérification ?", answer: "Ça Match utilise un système à 6 niveaux : Téléphone (OTP), Identité (CNI), Confiance (casier judiciaire), Expert (certification), et Élite (100 missions, 4.9+). Chaque niveau débloque plus d'avantages.", category: "verification" },
  { id: "f5", question: "Puis-je annuler une mission acceptée ?", answer: "Oui, mais des frais peuvent s'appliquer. Si vous annulez moins de 2h avant le rendez-vous, une pénalité de 5 000 F CFA est déduite de vos gains.", category: "jobs" },
  { id: "f6", question: "Comment sont classés les prestataires ?", answer: "Le matching utilise 8 critères : proximité (30%), disponibilité (10%), capacité (5%), note (15%), vérification (15%), vitesse réponse (10%), spécialisation (10%), et prix (5%).", category: "verification" },
  { id: "f7", question: "Puis-je travailler avec une équipe ?", answer: "Oui, les comptes Business permettent d'ajouter jusqu'à 5 assistants, d'assigner des missions et de suivre leur performance.", category: "profile" },
  { id: "f8", question: "Comment modifier mes disponibilités ?", answer: "Dans l'onglet Planning, vous pouvez définir des créneaux récurrents par jour de la semaine et bloquer des dates spécifiques (congés, fériés).", category: "profile" },
];

const CATEGORIES = [
  { id: "all", label: "Tout" },
  { id: "finance", label: "Finance" },
  { id: "jobs", label: "Missions" },
  { id: "verification", label: "Vérification" },
  { id: "profile", label: "Profil" },
  { id: "support", label: "Support" },
];

export default function ProHelpScreen({ onBack }: Props) {
  const [search, setSearch] = useState("");
  const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = FAQS.filter((f) => {
    if (activeCategory !== "all" && f.category !== activeCategory) return false;
    if (search && !f.question.toLowerCase().includes(search.toLowerCase()) && !f.answer.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="px-5 py-5 pb-32 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm cursor-pointer">
          <ArrowLeft className="w-5 h-5 text-brand-forest" />
        </button>
        <h2 className="font-sans text-lg font-extrabold">Aide & Support</h2>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher dans l'aide..."
          className="w-full h-11 pl-10 pr-4 text-xs bg-white rounded-xl border border-pale-mint/30 outline-none focus:ring-1 focus:ring-brand-lime"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-caption font-medium transition-all cursor-pointer ${
              activeCategory === cat.id ? "bg-brand-forest text-white" : "bg-white text-secondary border border-pale-mint/30"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQ List or Detail */}
      <AnimatePresence mode="wait">
        {selectedFaq ? (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
            <button onClick={() => setSelectedFaq(null)} className="flex items-center gap-1 text-caption font-medium text-secondary cursor-pointer">
              <ChevronLeft className="w-3.5 h-3.5" /> Retour aux questions
            </button>
            <div className="bg-white p-5 rounded-3xl shadow-premium border border-pale-mint/15 space-y-3">
              <h3 className="font-sans text-sm font-extrabold">{selectedFaq.question}</h3>
              <p className="text-xs text-secondary leading-relaxed">{selectedFaq.answer}</p>
            </div>
            <div className="bg-pale-mint p-4 rounded-2xl space-y-2">
              <p className="text-caption font-medium text-secondary uppercase tracking-wider">Encore besoin d'aide ?</p>
              <div className="flex gap-2">
                <button className="flex-1 py-2.5 bg-white rounded-xl text-caption font-medium flex items-center justify-center gap-1 cursor-pointer hover:bg-brand-lime/20 transition-colors">
                  <MessageSquare className="w-3.5 h-3.5" /> Chat
                </button>
                <button className="flex-1 py-2.5 bg-white rounded-xl text-caption font-medium flex items-center justify-center gap-1 cursor-pointer hover:bg-brand-lime/20 transition-colors">
                  <Phone className="w-3.5 h-3.5" /> Appel
                </button>
                <button className="flex-1 py-2.5 bg-white rounded-xl text-caption font-medium flex items-center justify-center gap-1 cursor-pointer hover:bg-brand-lime/20 transition-colors">
                  <Mail className="w-3.5 h-3.5" /> Email
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {filtered.length === 0 ? (
              <div className="bg-white p-6 rounded-3xl text-center">
                <HelpCircle className="w-8 h-8 text-secondary/60 mx-auto mb-2" />
                <p className="text-xs text-secondary">Aucun résultat pour votre recherche</p>
              </div>
            ) : (
              filtered.map((faq) => (
                <div
                  key={faq.id}
                  onClick={() => setSelectedFaq(faq)}
                  className="bg-white p-4 rounded-2xl shadow-premium border border-pale-mint/15 flex items-center justify-between cursor-pointer hover:bg-pale-mint/30 transition-colors active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pale-mint flex items-center justify-center">
                      <HelpCircle className="w-4 h-4 text-secondary" />
                    </div>
                    <p className="text-xs font-medium max-w-[250px]">{faq.question}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-secondary shrink-0" />
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
