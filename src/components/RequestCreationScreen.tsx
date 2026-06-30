import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, MapPin, Check, AlertTriangle, Camera, ChevronRight,
  Wrench, Zap, Fan, Hammer, Sparkles, Info, Truck, Video, X,
  FileText, Clock, CalendarDays, Coins, PartyPopper, BookOpen,
  Monitor, Handshake, Navigation,
} from "lucide-react";
import MapView from "./ui/MapView";
import { SERVICE_CATEGORIES, type ServiceCategory } from "../data/serviceCategories";
import type { ProCategory } from "../types";

export interface AiRequestDetails {
  category: ProCategory;
  subCategory: string;
  urgency: "low" | "medium" | "high" | "emergency";
  estimatedPriceMinXOF: number;
  estimatedPriceMaxXOF: number;
  summary: string;
}

export interface RequestPayload {
  title: string;
  description: string;
  photos: string[];
  videos?: string[];
  category: string;
  subCategory?: string;
  address: string;
  lat?: number;
  lng?: number;
  budgetXOF: number;
  urgency: "immediate" | "today" | "this_week" | "flexible";
  scheduledAt?: string;
  materialsProvided?: boolean;
  materialsCost?: number;
}

interface RequestCreationScreenProps {
  onBack: () => void;
  onAnalyze: (description: string) => Promise<AiRequestDetails>;
  onProceedToMatching: (details: AiRequestDetails & { address: string; description: string; lat: number; lng: number; videos?: string[]; scheduledAt?: string; materialsProvided?: boolean; materialsCost?: number }) => void;
  onSubmit?: (request: RequestPayload) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "maison-reparations": Wrench,
  "transport-livraison": Truck,
  evenements: PartyPopper,
  "education-formation": BookOpen,
  "social-media-informatique": Monitor,
  "assistance-services": Handshake,
};

const CATEGORIES: { id: ProCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] =
  SERVICE_CATEGORIES.map((cat) => ({
    id: cat.id as ProCategory,
    label: cat.name,
    icon: ICON_MAP[cat.id] || Sparkles,
  }));

const URGENCY_OPTIONS: { value: "emergency" | "high" | "medium" | "low"; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { value: "emergency", label: "Immédiat", icon: Zap, desc: "Intervention dans l'heure" },
  { value: "high", label: "Aujourd'hui", icon: Clock, desc: "Avant la fin de journée" },
  { value: "medium", label: "Cette semaine", icon: CalendarDays, desc: "Sous 3 à 4 jours" },
  { value: "low", label: "Flexible", icon: Sparkles, desc: "Pas d'urgence" },
];

const STEP_LABELS = ["Catégorie", "Description", "Matériaux", "Budget"];

const CATEGORY_RESPONSES: Record<string, { subCategory: string; icon: React.ComponentType<{ className?: string }>; title: string; desc: string }[]> = {
  "maison-reparations": [
    { subCategory: "Électricien", icon: Zap, title: "Le courant a sauté", desc: "Le disjoncteur général a sauté, toute la maison est sans électricité..." },
    { subCategory: "Électricien", icon: Zap, title: "Prise qui ne fonctionne plus", desc: "Une prise électrique ne marche plus, peut-être grillée..." },
    { subCategory: "Électricien", icon: Zap, title: "Disjoncteur qui saute", desc: "Le disjoncteur saute régulièrement quand j'allume un appareil..." },
    { subCategory: "Électricien", icon: Zap, title: "Installer un luminaire", desc: "Je dois installer un lustre, un spot ou un ventilateur au plafond..." },
    { subCategory: "Plombier", icon: Wrench, title: "Fuite d'eau", desc: "Un robinet ou un tuyau fuit sous l'évier..." },
    { subCategory: "Plombier", icon: Wrench, title: "Canalisation bouchée", desc: "L'eau ne s'écoule plus dans l'évier, la douche ou les toilettes..." },
    { subCategory: "Plombier", icon: Wrench, title: "Chauffe-eau en panne", desc: "Le ballon d'eau chaude ne chauffe plus ou fuit..." },
    { subCategory: "Plombier", icon: Wrench, title: "Toilettes qui fuient", desc: "La chasse d'eau reste bloquée ou le joint du WC fuit..." },
    { subCategory: "Climatisation", icon: Fan, title: "Clim ne refroidit plus", desc: "Le climatiseur souffle de l'air tiède, le gaz est peut-être à recharger..." },
    { subCategory: "Climatisation", icon: Fan, title: "Clim qui fuit", desc: "De l'eau coule du climatiseur, l'évacuation est bouchée..." },
    { subCategory: "Climatisation", icon: Fan, title: "Installer une clim neuve", desc: "Je veux faire installer un climatiseur split dans une chambre..." },
    { subCategory: "Menuisier", icon: Hammer, title: "Porte qui ferme mal", desc: "Une porte intérieure ne ferme plus correctement ou gondole..." },
    { subCategory: "Menuisier", icon: Hammer, title: "Meuble sur mesure", desc: "Je veux fabriquer un placard, une bibliothèque ou une armoire..." },
    { subCategory: "Menuisier", icon: Hammer, title: "Étagère cassée", desc: "Une étagère ou un meuble s'est effondré..." },
    { subCategory: "Maçon", icon: Wrench, title: "Mur à construire ou abattre", desc: "Je veux construire, abattre ou percer un mur intérieur..." },
    { subCategory: "Maçon", icon: Wrench, title: "Fissure dans le mur", desc: "Une fissure apparaît sur un mur, besoin d'un diagnostic..." },
    { subCategory: "Peintre", icon: Wrench, title: "Peinture murale", desc: "Je veux repeindre une ou plusieurs pièces de la maison..." },
    { subCategory: "Peintre", icon: Wrench, title: "Enduit ou crépis", desc: "Besoin de refaire l'enduit ou le crépi d'un mur extérieur..." },
    { subCategory: "Serrurier", icon: Wrench, title: "Serrure bloquée", desc: "La clé ne tourne plus dans la serrure ou est cassée dedans..." },
    { subCategory: "Serrurier", icon: Wrench, title: "Porte fermée à clé", desc: "Je me suis enfermé dehors, besoin d'ouverture de porte d'urgence..." },
    { subCategory: "Carreleur", icon: Wrench, title: "Carrelage à poser", desc: "Je veux faire poser du carrelage dans une pièce..." },
    { subCategory: "Carreleur", icon: Wrench, title: "Joint de carrelage", desc: "Les joints du carrelage sont abîmés ou noircis..." },
    { subCategory: "Vitrier", icon: Wrench, title: "Vitre cassée", desc: "Une vitre est cassée, besoin de la remplacer..." },
    { subCategory: "Soudeur", icon: Wrench, title: "Portail métallique cassé", desc: "Mon portail en fer est cassé, besoin de soudure..." },
    { subCategory: "Soudeur", icon: Wrench, title: "Rampe d'escalier", desc: "La rampe d'escalier est dessoudée..." },
    { subCategory: "Nettoyage", icon: Sparkles, title: "Nettoyage complet", desc: "Besoin d'un service de ménage complet pour la maison..." },
    { subCategory: "Nettoyage", icon: Sparkles, title: "Nettoyage vitres", desc: "Je veux faire nettoyer toutes les vitres..." },
    { subCategory: "Jardinage", icon: Wrench, title: "Tonte de pelouse", desc: "Ma pelouse a besoin d'être tondue et entretenue..." },
    { subCategory: "Jardinage", icon: Wrench, title: "Taille de haies", desc: "Les haies et arbustes du jardin sont à tailler..." },
  ],
  "transport-livraison": [
    { subCategory: "Coursier", icon: Truck, title: "Livraison urgente", desc: "Besoin d'un coursier pour livrer un colis rapidement..." },
    { subCategory: "Coursier", icon: Truck, title: "Document à remettre", desc: "Je dois envoyer un document en mains propres..." },
    { subCategory: "Chauffeur privé", icon: Truck, title: "Course en ville", desc: "Besoin d'un chauffeur pour un déplacement en ville..." },
    { subCategory: "Chauffeur privé", icon: Truck, title: "Trajet aéroport", desc: "Je dois aller à l'aéroport, besoin d'un chauffeur..." },
    { subCategory: "Déménagement", icon: Truck, title: "Petit déménagement", desc: "Je déménage un studio, besoin d'un camion et d'aide..." },
    { subCategory: "Déménagement", icon: Truck, title: "Transport mobilier", desc: "Je dois transporter un canapé ou un lit d'un point A à B..." },
    { subCategory: "Transport de marchandises", icon: Truck, title: "Transport de colis", desc: "Besoin de transporter des cartons de marchandises..." },
    { subCategory: "Transport de marchandises", icon: Truck, title: "Livraison fournisseur", desc: "Je dois acheminer une commande fournisseur..." },
    { subCategory: "Remorquage", icon: Truck, title: "Voiture en panne", desc: "Ma voiture est en panne sur la voie, besoin d'une dépanneuse..." },
    { subCategory: "Remorquage", icon: Truck, title: "Véhicule à déplacer", desc: "Besoin de remorquer un véhicule jusqu'au garage..." },
  ],
  evenements: [
    { subCategory: "DJ", icon: PartyPopper, title: "DJ pour soirée", desc: "Je cherche un DJ pour animer une soirée ou un anniversaire..." },
    { subCategory: "DJ", icon: PartyPopper, title: "Sonorisation", desc: "Besoin d'une sono avec micro pour un événement en salle..." },
    { subCategory: "Photographe", icon: PartyPopper, title: "Photographe mariage", desc: "Je cherche un photographe pour couvrir mon mariage..." },
    { subCategory: "Photographe", icon: PartyPopper, title: "Séance photo pro", desc: "Besoin d'un shooting photo professionnel (portrait / produit)..." },
    { subCategory: "Vidéaste", icon: PartyPopper, title: "Vidéaste événement", desc: "Je veux un vidéaste pour filmer mon événement..." },
    { subCategory: "Traiteur", icon: PartyPopper, title: "Traiteur pour réception", desc: "Besoin d'un traiteur pour un buffet ou un cocktail..." },
    { subCategory: "Décoration", icon: PartyPopper, title: "Décoration de salle", desc: "Je veux une décoration pour une salle de réception..." },
    { subCategory: "Location de matériel", icon: PartyPopper, title: "Location tables/chaises", desc: "Je cherche à louer des tables, chaises et tentes..." },
    { subCategory: "Animateur", icon: PartyPopper, title: "Animateur pour enfants", desc: "Besoin d'un animateur pour une fête d'enfants..." },
    { subCategory: "Éclairage", icon: PartyPopper, title: "Éclairage d'ambiance", desc: "Besoin d'un éclairage pour une soirée ou un mariage..." },
    { subCategory: "Serveur", icon: PartyPopper, title: "Serveur extra", desc: "Je cherche un serveur pour le service lors d'une réception..." },
    { subCategory: "Sonorisation", icon: PartyPopper, title: "Sono & micro", desc: "Location de système son avec micro pour conférence..." },
  ],
  "education-formation": [
    { subCategory: "Répétiteur", icon: BookOpen, title: "Aide aux devoirs", desc: "Je cherche un répétiteur pour mon enfant en maths et physique..." },
    { subCategory: "Répétiteur", icon: BookOpen, title: "Cours particuliers", desc: "Besoin de cours particuliers en français ou en anglais..." },
    { subCategory: "Langues", icon: BookOpen, title: "Cours d'anglais", desc: "Je veux apprendre l'anglais (débutant ou intermédiaire)..." },
    { subCategory: "Langues", icon: BookOpen, title: "Cours d'espagnol", desc: "Je cherche un professeur d'espagnol..." },
    { subCategory: "Programmation", icon: BookOpen, title: "Apprendre à coder", desc: "Je veux apprendre Python ou JavaScript pour débutant..." },
    { subCategory: "Programmation", icon: BookOpen, title: "Développement web", desc: "Besoin d'un coach en développement web (React / Node.js)..." },
    { subCategory: "Informatique", icon: BookOpen, title: "Bureautique (Excel)", desc: "Je veux maîtriser Excel, Word et PowerPoint..." },
    { subCategory: "Informatique", icon: BookOpen, title: "Initiation PC", desc: "Besoin de cours d'initiation à l'informatique..." },
    { subCategory: "Cybersécurité", icon: BookOpen, title: "Sécurité informatique", desc: "Je veux apprendre les bases de la cybersécurité..." },
    { subCategory: "Intelligence artificielle", icon: BookOpen, title: "Découverte de l'IA", desc: "Je veux comprendre ChatGPT et les outils d'IA..." },
    { subCategory: "Préparation concours", icon: BookOpen, title: "Prépa concours", desc: "Besoin d'un coach pour préparer un concours..." },
    { subCategory: "Préparation concours", icon: BookOpen, title: "Prépa Bac", desc: "Je cherche un prof pour préparer le bac ou un examen..." },
  ],
  "social-media-informatique": [
    { subCategory: "Développement Web", icon: Monitor, title: "Site vitrine", desc: "Je veux créer un site vitrine pour mon entreprise..." },
    { subCategory: "Développement Web", icon: Monitor, title: "Site e-commerce", desc: "Besoin d'une boutique en ligne pour vendre mes produits..." },
    { subCategory: "Développement Mobile", icon: Monitor, title: "App mobile", desc: "Je veux développer une application pour iOS et Android..." },
    { subCategory: "Design Graphique", icon: Monitor, title: "Flyer / Affiche", desc: "Besoin d'un design pour un flyer ou une affiche pub..." },
    { subCategory: "Création Logo", icon: Monitor, title: "Création de logo", desc: "Je cherche un designer pour créer le logo de ma marque..." },
    { subCategory: "Community Management", icon: Monitor, title: "Gestion réseaux sociaux", desc: "Besoin de quelqu'un pour gérer Instagram et Facebook..." },
    { subCategory: "Community Management", icon: Monitor, title: "Création de contenu", desc: "Je veux des publications régulières pour mes réseaux..." },
    { subCategory: "Montage Vidéo", icon: Monitor, title: "Montage vidéo", desc: "Je dois faire monter une vidéo promotionnelle..." },
    { subCategory: "Montage Vidéo", icon: Monitor, title: "Réel TikTok/Instagram", desc: "Besoin d'un monteur pour des vidéos courtes..." },
    { subCategory: "Marketing Digital", icon: Monitor, title: "Stratégie marketing", desc: "Besoin d'une stratégie marketing digitale..." },
    { subCategory: "SEO", icon: Monitor, title: "Référencement Google", desc: "Je veux améliorer le SEO de mon site web..." },
    { subCategory: "Publicité Facebook", icon: Monitor, title: "Campagne Facebook Ads", desc: "Je veux lancer des pubs Facebook pour mon activité..." },
    { subCategory: "Publicité Google", icon: Monitor, title: "Campagne Google Ads", desc: "Besoin d'aide pour créer des annonces Google Ads..." },
  ],
  "assistance-services": [
    { subCategory: "Femme de ménage", icon: Handshake, title: "Ménage régulier", desc: "Je cherche une femme de ménage pour un entretien hebdomadaire..." },
    { subCategory: "Femme de ménage", icon: Handshake, title: "Grand nettoyage", desc: "Besoin d'un nettoyage en profondeur de toute la maison..." },
    { subCategory: "Baby-sitter", icon: Handshake, title: "Garde d'enfants", desc: "Je cherche une nounou pour garder mon bébé en journée..." },
    { subCategory: "Baby-sitter", icon: Handshake, title: "Baby-sitter soirée", desc: "Besoin d'une baby-sitter pour une soirée (18h-23h)..." },
    { subCategory: "Garde-malade", icon: Handshake, title: "Aide pour personne âgée", desc: "Je cherche un aide-soignant pour ma mère à domicile..." },
    { subCategory: "Garde-malade", icon: Handshake, title: "Infirmier à domicile", desc: "Besoin d'un infirmier pour des soins à domicile..." },
    { subCategory: "Assistant personnel", icon: Handshake, title: "Assistant administratif", desc: "Je cherche un assistant pour gérer mon planning..." },
    { subCategory: "Assistant personnel", icon: Handshake, title: "Secrétariat", desc: "Besoin d'un secrétaire pour des tâches administratives..." },
    { subCategory: "Courses", icon: Handshake, title: "Faire les courses", desc: "Besoin de quelqu'un pour faire mes courses au supermarché..." },
    { subCategory: "Courses", icon: Handshake, title: "Courses au marché", desc: "Je cherche une personne pour acheter au marché..." },
    { subCategory: "Accompagnement administratif", icon: Handshake, title: "Démarche CNI/passeport", desc: "Besoin d'aide pour les démarches à la préfecture..." },
    { subCategory: "Accompagnement administratif", icon: Handshake, title: "Remplir un dossier", desc: "Aide pour remplir des formulaires administratifs..." },
  ],
};

function getContextualResponses(category: ProCategory | null, subCategory: string | null) {
  if (!category) return [];
  const all = CATEGORY_RESPONSES[category];
  if (!all) return [];
  if (subCategory) {
    return all.filter((r) => r.subCategory === subCategory);
  }
  const seen = new Set<string>();
  return all.filter((r) => {
    if (!seen.has(r.subCategory)) { seen.add(r.subCategory); return true; }
    return false;
  });
}

export default function RequestCreationScreen({ onBack, onAnalyze, onProceedToMatching, onSubmit }: RequestCreationScreenProps) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<ProCategory | null>(null);
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [budget, setBudget] = useState(50000);
  const [address, setAddress] = useState("Cocody Riviera 3, Abidjan");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high" | "emergency" | null>(null);
  const [showAiPill, setShowAiPill] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiDetails, setAiDetails] = useState<AiRequestDetails | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [needsMaterials, setNeedsMaterials] = useState(true);
  const [materialsCost, setMaterialsCost] = useState(0);
  const [mapCoords, setMapCoords] = useState({ lat: 5.35, lng: -4.00 });
  const [isLocating, setIsLocating] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const selectedCategoryData = category ? SERVICE_CATEGORIES.find((c) => c.id === category) : null;
  const subcategories = selectedCategoryData?.subcategories.map((s) => s.name) ?? [];

  useEffect(() => {
    setShowAiPill(description.length >= 30 && !aiDetails);
  }, [description, aiDetails]);

  const goNext = () => { if (step < 4) setStep((s) => s + 1); else handleAnalyze(); };
  const goPrev = () => { if (step > 1) setStep((s) => s - 1); else onBack(); };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const details = await onAnalyze(description);
      setAiDetails(details);
      setShowAiPill(false);
      if (!category) setCategory(details.category);
      if (!urgency) setUrgency(details.urgency);
      if (!subCategory) setSubCategory(details.subCategory);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => setPhotos((prev) => [...prev, reader.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const handleVideoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setVideo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removePhoto = (i: number) => setPhotos((prev) => prev.filter((_, idx) => idx !== i));

  const handleGpsLocate = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMapCoords({ lat, lng });
        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleMapClick = (lat: number, lng: number) => {
    setMapCoords({ lat, lng });
  };

  const handleSubmit = () => {
    const cat: ProCategory = (category || aiDetails?.category || "maison-reparations") as ProCategory;
    const urg: AiRequestDetails["urgency"] = (urgency || aiDetails?.urgency || "medium") as AiRequestDetails["urgency"];
    const sub = subCategory || aiDetails?.subCategory || "Autre";
    const detailsPayload = {
      category: cat,
      subCategory: sub,
      urgency: urg,
      estimatedPriceMinXOF: aiDetails?.estimatedPriceMinXOF || 10000,
      estimatedPriceMaxXOF: aiDetails?.estimatedPriceMaxXOF || 30000,
      summary: aiDetails?.summary || description.slice(0, 100),
      address,
      description,
      lat: mapCoords.lat,
      lng: mapCoords.lng,
      videos: video ? [video] : undefined,
      scheduledAt: scheduledDate || undefined,
      materialsProvided: !needsMaterials,
      materialsCost: needsMaterials ? materialsCost : undefined,
    };
    onProceedToMatching(detailsPayload);
  };

  const inputBase = "w-full h-11 px-4 text-[13px] font-bold bg-white border border-gray-200 rounded-xl text-gray-900 outline-none focus:border-gray-900";

  return (
    <div className="flex flex-col w-full min-h-screen pb-8 bg-gray-50">
      <header className="flex items-center justify-between px-4 pt-3 pb-4 sticky top-0 z-10 bg-gray-50">
        <button onClick={goPrev} className="w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-700 cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-0">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
                  s <= step ? "bg-gray-900" : "bg-gray-200"
                }`}>
                  {s < step && <Check className="w-2 h-2 text-white" />}
                </div>
                <span className={`text-[9px] font-bold whitespace-nowrap transition-colors ${
                  s === step ? "text-gray-900" : "text-gray-400"
                }`}>{STEP_LABELS[s - 1]}</span>
              </div>
              {s < 4 && (
                <div className={`w-8 sm:w-12 h-[2px] mx-0.5 rounded-full self-start mt-[5px] transition-colors ${
                  s < step ? "bg-gray-900" : "bg-gray-200"
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="w-11 h-11" />
      </header>

      {(showAiPill || isAnalyzing) && (
        <div className="px-5 mb-3">
          <button onClick={handleAnalyze} disabled={isAnalyzing || description.length < 10}
            className={`w-full py-3 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.97] cursor-pointer ${
              isAnalyzing
                ? "bg-white text-gray-500 border border-gray-200"
                : "bg-gray-900 text-white hover:opacity-90"
            }`}>
            {isAnalyzing ? (
              <><Sparkles className="w-4 h-4 animate-spin" /> Analyse en cours...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Analyser avec l'IA</>
            )}
          </button>
        </div>
      )}

      {aiDetails && (
        <div className="mx-4 mb-4 p-3 bg-gray-100 rounded-xl flex items-start gap-2.5 border border-gray-900/10">
          <Sparkles className="w-4 h-4 text-gray-900 mt-0.5 shrink-0" />
          <div>
            <p className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Analyse IA</p>
            <p className="text-[12px] text-gray-700 mt-0.5">{aiDetails.summary}</p>
            <p className="text-[11px] font-mono text-gray-500 mt-1">
              Estimé : {aiDetails.estimatedPriceMinXOF.toLocaleString()} - {aiDetails.estimatedPriceMaxXOF.toLocaleString()} F
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 px-4 space-y-5">
        {step === 1 && (
          <>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900">De quoi s'agit-il ?</h2>
              <p className="text-[13px] text-gray-500 mt-1">Choisissez la catégorie qui correspond à votre besoin</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const selected = category === cat.id;
                return (
                  <button key={cat.id} onClick={() => { setCategory(cat.id); setSubCategory(null); }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-[0.97] cursor-pointer ${
                      selected
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-900/30"
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? "bg-white/20" : "bg-gray-100"}`}>
                      <Icon className={`w-5 h-5 ${selected ? "text-white" : "text-gray-900"}`} />
                    </div>
                    <span className="text-[11px] font-bold text-center">{cat.label}</span>
                  </button>
                );
              })}
            </div>
            {category && subcategories.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sous-catégorie</h3>
                <div className="flex flex-wrap gap-2">
                  {subcategories.map((sub) => (
                    <button key={sub} onClick={() => setSubCategory(sub)}
                      className={`px-3.5 py-2 rounded-[10px] text-[11px] font-medium transition-all active:scale-95 cursor-pointer ${
                        subCategory === sub
                          ? "bg-gray-900 text-white"
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                      }`}>
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {category && !subCategory && (
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <Info className="w-3.5 h-3.5" />
                Sélectionnez une sous-catégorie pour affiner votre demande
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900">
                {subCategory
                  ? `Décrivez votre besoin en ${subCategory.toLowerCase()}`
                  : category
                    ? `Décrivez votre problème de ${CATEGORIES.find((c) => c.id === category)?.label?.toLowerCase() || "maison"}`
                    : "Décrivez le problème"}
              </h2>
              <p className="text-[13px] text-gray-500 mt-1">
                {category
                  ? `Choisissez une suggestion ci-dessous ou décrivez précisément votre besoin en ${subCategory || CATEGORIES.find((c) => c.id === category)?.label?.toLowerCase() || "maison"}`
                  : "Sélectionnez d'abord une catégorie à l'étape précédente, ou décrivez directement votre besoin"}
              </p>
            </div>

            {category && (
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
                {getContextualResponses(category, subCategory).map((r) => {
                  const Icon = r.icon;
                  return (
                    <button key={r.title} onClick={() => setDescription(r.desc)}
                      className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl whitespace-nowrap cursor-pointer active:scale-95 hover:bg-gray-100 transition-all shrink-0">
                      <Icon className="w-4 h-4 text-gray-900" />
                      <div className="text-left">
                        <p className="text-[11px] font-bold text-gray-900">{r.title}</p>
                        <p className="text-[9px] text-gray-400">{r.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={subCategory
                ? `Ex: Décrivez votre besoin précis en ${subCategory.toLowerCase()}...`
                : category
                  ? `Ex: Décrivez le problème rencontré dans le domaine ${CATEGORIES.find((c) => c.id === category)?.label?.toLowerCase() || "concerné"}...`
                  : "Ex: Ma clim split ne s'allume plus, la télécommande ne répond pas..."}
              className="w-full h-36 text-[14px] bg-white border border-gray-200 rounded-2xl p-4 outline-none resize-none text-gray-900 placeholder-gray-400 font-medium focus:border-gray-900"
            />

            <div>
              <div className="flex items-center gap-3 mb-3">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Photos</p>
                <span className="text-[10px] text-gray-400">Optionnel</span>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {photos.map((p, i) => (
                  <div key={i} className="relative w-[68px] h-[68px] rounded-xl overflow-hidden border border-gray-200 shrink-0">
                    <img src={p} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {video && (
                  <div className="relative w-[68px] h-[68px] rounded-xl overflow-hidden border border-gray-900 shrink-0 bg-gray-100 flex items-center justify-center">
                    <Video className="w-6 h-6 text-gray-900" />
                    <button onClick={() => setVideo(null)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <button onClick={() => photoInputRef.current?.click()} className="w-[68px] h-[68px] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-0.5 text-gray-400 bg-white cursor-pointer hover:border-gray-900/30 transition-all shrink-0">
                  <Camera className="w-5 h-5" />
                  <span className="text-[8px] font-medium">Photo</span>
                </button>
                <button onClick={() => videoInputRef.current?.click()} className="w-[68px] h-[68px] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-0.5 text-gray-400 bg-white cursor-pointer hover:border-gray-900/30 transition-all shrink-0">
                  <Video className="w-5 h-5" />
                  <span className="text-[8px] font-medium">Vidéo</span>
                </button>
              </div>
              <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} />
              <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoAdd} />
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-100/50 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-gray-900 shrink-0" />
              <p className="text-[11px] text-gray-500">Notre IA analysera votre description pour estimer le coût et la durée de l'intervention.</p>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900">Matériaux & équipement</h2>
              <p className="text-[13px] text-gray-500 mt-1">Le professionnel peut apporter le matériel nécessaire</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center transition-all ${
                  needsMaterials ? "bg-gray-900 border-gray-900" : "border-gray-300"
                }`}>
                  {needsMaterials && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-gray-900">Je veux inclure les matériaux</p>
                  <p className="text-[11px] text-gray-500">Le pro apporte tout le nécessaire</p>
                </div>
                <input type="checkbox" checked={needsMaterials} onChange={() => setNeedsMaterials(!needsMaterials)} className="hidden" />
              </label>
            </div>

            {needsMaterials && (
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Coût estimé des matériaux (FCFA)</label>
                <div className="relative">
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="number" value={materialsCost} onChange={(e) => setMaterialsCost(Number(e.target.value))}
                      className={`${inputBase} pl-9`} placeholder="10 000" />
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] text-gray-500">Frais de déplacement</span>
                <span className="text-[12px] font-bold text-gray-900 font-mono">5 000 F</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-gray-500">Main-d'œuvre</span>
                <span className="text-[12px] font-bold text-gray-900 font-mono">Estimé par le pro</span>
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900">Budget & urgence</h2>
              <p className="text-[13px] text-gray-500 mt-1">Quel est votre budget et votre niveau d'urgence ?</p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Votre budget max (FCFA)</label>
              <div className="relative">
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))}
                  className={`${inputBase} pl-9`} />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 mt-1 px-1">
                <span>5 000</span>
                <span>250 000+</span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Date souhaitée</label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className={`${inputBase} pl-9 text-[13px]`} />
              </div>
            </div>

            <div>
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Niveau d'urgence</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {URGENCY_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const selected = urgency === opt.value;
                  return (
                    <button key={opt.value} onClick={() => setUrgency(opt.value)}
                      className={`flex items-start gap-2.5 p-3.5 rounded-2xl border-2 transition-all text-left active:scale-[0.97] cursor-pointer ${
                        selected
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-900/30"
                      }`}>
                      <Icon className={`w-4 h-4 mt-0.5 ${selected ? "text-white" : "text-gray-900"}`} />
                      <div>
                        <p className="text-[12px] font-bold">{opt.label}</p>
                        <p className={`text-[10px] ${selected ? "text-white/70" : "text-gray-400"} mt-0.5`}>{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Adresse d'intervention</label>
              <button onClick={() => setShowMapPicker(true)}
                className="w-full flex items-center gap-2.5 p-3 bg-white border border-gray-200 rounded-2xl text-left cursor-pointer active:scale-[0.97] hover:bg-gray-100 transition-all">
                <MapPin className="w-5 h-5 text-gray-900 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-gray-900 truncate">{address}</p>
                  <p className="text-[10px] text-gray-400">Appuyez pour modifier</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-200 space-y-2.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-gray-500">Catégorie</span>
                <span className="font-bold text-gray-900">{category ? CATEGORIES.find((c) => c.id === category)?.label : aiDetails ? CATEGORIES.find((c) => c.id === aiDetails.category)?.label : "-"}</span>
              </div>
              {subCategory && (
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-gray-500">Sous-catégorie</span>
                  <span className="font-bold text-gray-900">{subCategory}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-gray-500">Budget max</span>
                <span className="font-bold text-gray-900 font-mono">{budget.toLocaleString()} F</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-gray-500">Urgence</span>
                <span className="font-bold text-gray-900">{URGENCY_OPTIONS.find((o) => o.value === urgency)?.label || "-"}</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-gray-500">Adresse</span>
                <span className="font-bold text-gray-900 text-right max-w-[180px] truncate">{address}</span>
              </div>
              {needsMaterials && (
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-gray-500">Matériaux inclus</span>
                  <span className="font-bold text-gray-900 font-mono">{materialsCost.toLocaleString()} F</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="sticky bottom-0 px-4 pt-3 pb-6 bg-gray-50 border-t border-gray-200 mt-4">
        {step < 4 ? (
          <button onClick={goNext}
            disabled={step === 1 && (!category || !subCategory) || step === 2 && description.length < 5}
            className={`w-full py-4 rounded-xl text-[13px] font-bold transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 ${
              (step === 1 && (!category || !subCategory)) || (step === 2 && description.length < 5)
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-900 text-white hover:opacity-90"
            }`}>
            Continuer <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit}
            disabled={!urgency || !address || budget < 1000}
            className={`w-full py-4 rounded-xl text-[13px] font-bold transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center gap-2 ${
              !urgency || !address || budget < 1000
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-900 text-white hover:opacity-90"
            }`}>
            <Sparkles className="w-4 h-4" /> Trouver un professionnel
          </button>
        )}
      </div>

      {/* Map Picker Bottom Sheet */}
      {showMapPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setShowMapPicker(false)}>
          <div className="w-full max-w-md bg-gray-50 rounded-t-[24px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 flex items-center justify-between border-b border-gray-200">
              <h3 className="text-[14px] font-bold text-gray-900">Choisir l'adresse</h3>
              <button onClick={() => setShowMapPicker(false)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center cursor-pointer">
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>
            <div className="h-64 relative">
              <MapView
                height="h-64"
                center={[mapCoords.lat, mapCoords.lng]}
                markers={[{ id: "client", lat: mapCoords.lat, lng: mapCoords.lng, label: address }]}
                interactive
                onMapClick={handleMapClick}
              />
              <button
                onClick={handleGpsLocate}
                disabled={isLocating}
                className="absolute top-3 right-3 z-[1000] w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors active:scale-95 disabled:opacity-50"
              >
                <Navigation className={`w-5 h-5 text-gray-900 ${isLocating ? "animate-spin" : ""}`} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={inputBase}
                placeholder="Entrez votre adresse" />
              <button onClick={() => { setShowMapPicker(false); }}
                className="w-full py-4 bg-gray-900 text-white font-bold text-[13px] rounded-xl hover:opacity-90 transition-all cursor-pointer active:scale-[0.97]">
                Confirmer l'adresse
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
