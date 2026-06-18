import { useState, useRef } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Camera, MapPin, DollarSign, Clock, AlertTriangle, Check, X, ImagePlus } from "lucide-react";
import { Urgency, URGENCY_LABELS } from "../types";

const CATEGORIES = [
  { id: "electricity", name: "Électricité", emoji: "⚡" },
  { id: "plumbing", name: "Plomberie", emoji: "🔧" },
  { id: "ac", name: "Climatisation", emoji: "❄️" },
  { id: "cleaning", name: "Ménage", emoji: "🧹" },
  { id: "painting", name: "Peinture", emoji: "🎨" },
  { id: "carpentry", name: "Menuiserie", emoji: "🪚" },
];

interface NewRequestScreenProps {
  onBack: () => void;
  onSubmit: (request: {
    title: string;
    description: string;
    photos: string[];
    category: string;
    address: string;
    budgetXOF: number;
    urgency: Urgency;
  }) => void;
}

export default function NewRequestScreen({ onBack, onSubmit }: NewRequestScreenProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [category, setCategory] = useState("");
  const [address, setAddress] = useState("");
  const [budget, setBudget] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("flexible");
  const [step, setStep] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoAdd = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) setPhotos((p) => [...p, reader.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (i: number) => setPhotos((p) => p.filter((_, idx) => idx !== i));

  const handleSubmit = () => {
    if (!title || !category || !address) return;
    onSubmit({
      title, description, photos, category, address,
      budgetXOF: parseInt(budget) || 0,
      urgency,
    });
  };

  const steps = [
    // Step 0: Category + Urgency
    <div key="step0" className="space-y-5">
      <div>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">Catégorie</p>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`p-3 rounded-2xl border text-left transition-all active:scale-95 cursor-pointer ${
                category === c.id
                  ? "bg-brand-forest text-white border-brand-forest"
                  : "bg-white text-brand-forest border-pale-mint/30 hover:shadow-sm"
              }`}
            >
              <span className="text-lg">{c.emoji}</span>
              <p className="text-xs font-bold mt-1">{c.name}</p>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">Urgence</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(URGENCY_LABELS) as [Urgency, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setUrgency(key)}
              className={`p-3 rounded-2xl border text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-2 ${
                urgency === key
                  ? "bg-amber-50 text-amber-700 border-amber-300"
                  : "bg-white text-brand-forest border-pale-mint/30 hover:shadow-sm"
              }`}
            >
              <Clock className={`w-4 h-4 ${urgency === key ? "text-amber-500" : "text-secondary"}`} />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 1: Title + Description
    <div key="step1" className="space-y-4">
      <div>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Titre du problème</p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Fuite d'eau sous l'évier"
          className="w-full h-12 text-sm bg-white border border-pale-mint/30 rounded-xl px-4 outline-none focus:ring-1 focus:ring-brand-forest"
        />
      </div>
      <div>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Description</p>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Décrivez votre problème en détail..."
          className="w-full text-sm bg-white border border-pale-mint/30 rounded-xl p-4 outline-none focus:ring-1 focus:ring-brand-forest resize-none min-h-[120px]"
        />
      </div>
    </div>,

    // Step 2: Photos + Address + Budget
    <div key="step2" className="space-y-4">
      <div>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Photos</p>
        <div className="flex gap-2 flex-wrap">
          {photos.map((p, i) => (
            <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-pale-mint/20">
              <img src={p} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removePhoto(i)} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/50 flex items-center justify-center cursor-pointer">
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
          ))}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 rounded-xl border-2 border-dashed border-pale-mint/40 flex items-center justify-center text-secondary hover:border-brand-lime transition-colors cursor-pointer"
          >
            <ImagePlus className="w-5 h-5" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoAdd} />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <MapPin className="w-3 h-3" /> Adresse
        </p>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Votre adresse complète"
          className="w-full h-12 text-sm bg-white border border-pale-mint/30 rounded-xl px-4 outline-none focus:ring-1 focus:ring-brand-forest"
        />
      </div>
      <div>
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <DollarSign className="w-3 h-3" /> Budget proposé (FCFA)
        </p>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Montant max"
          className="w-full h-12 text-sm bg-white border border-pale-mint/30 rounded-xl px-4 outline-none focus:ring-1 focus:ring-brand-forest"
        />
      </div>
    </div>,
  ];

  const canProceed = () => {
    if (step === 0) return !!category;
    if (step === 1) return title.length >= 3;
    if (step === 2) return address.length >= 5;
    return true;
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-cream pb-32">
      <header className="flex items-center justify-between px-4 py-3 bg-brand-cream/90 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-brand-forest hover:bg-pale-mint transition-colors shadow-sm cursor-pointer active:scale-95">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex gap-1">
          {[0, 1, 2].map((s) => (
            <div key={s} className={`w-8 h-1 rounded-full transition-colors ${s <= step ? "bg-brand-forest" : "bg-pale-mint"}`} />
          ))}
        </div>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 py-4">
        <h2 className="font-sans text-lg font-extrabold mb-1">
          {step === 0 ? "De quoi s'agit-il ?" : step === 1 ? "Décrivez le problème" : "Finalisez votre demande"}
        </h2>
        <p className="text-xs text-on-surface-variant mb-6">
          {step === 0 ? "Choisissez une catégorie et le niveau d'urgence" : step === 1 ? "Donnez un maximum de détails" : "Ajoutez photos, adresse et budget"}
        </p>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
          {steps[step]}
        </motion.div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-4 max-w-md mx-auto">
        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => setStep((s) => s - 1)} className="flex-1 h-12 bg-white border border-pale-mint/30 rounded-2xl text-xs font-bold text-brand-forest cursor-pointer active:scale-95 transition-all">
              Retour
            </button>
          )}
          <button
            onClick={() => step < 2 ? setStep((s) => s + 1) : handleSubmit()}
            disabled={!canProceed()}
            className={`flex-1 h-12 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
              canProceed()
                ? step < 2
                  ? "bg-brand-forest text-white hover:bg-brand-lime hover:text-brand-forest"
                  : "bg-brand-lime text-brand-forest"
                : "bg-pale-mint text-secondary/50 cursor-not-allowed"
            }`}
          >
            {step < 2 ? "Suivant" : "Publier la demande"}
            {step < 2 && <ArrowLeft className="w-3.5 h-3.5 rotate-180" />}
          </button>
        </div>
      </div>
    </div>
  );
}
