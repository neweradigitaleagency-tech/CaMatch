import { ArrowLeft, CreditCard, Smartphone, Plus, Check } from "lucide-react";

interface ClientPaymentsScreenProps {
  onBack: () => void;
}

const methods = [
  { id: "om", name: "Orange Money", icon: "📱", desc: "+225 07 45 88 12", active: true },
  { id: "mtn", name: "MTN MoMo", icon: "💛", desc: "+225 05 32 99 44", active: true },
  { id: "wave", name: "Wave", icon: "🌊", desc: "Non connecté", active: false },
  { id: "card", name: "Carte bancaire", icon: "💳", desc: "Visa •••• 4821", active: true },
];

export default function ClientPaymentsScreen({ onBack }: ClientPaymentsScreenProps) {
  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-cream pb-32">
      <header className="flex items-center justify-between px-4 py-3 bg-brand-cream/90 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-brand-forest hover:bg-pale-mint transition-colors shadow-sm cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-sans text-sm font-bold">Moyens de paiement</h1>
        <div className="w-9 h-9" />
      </header>
      <div className="px-4 pt-4 space-y-2">
        {methods.map(m => (
          <div key={m.id} className="bg-white rounded-2xl p-4 border border-pale-mint/20 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pale-mint flex items-center justify-center text-lg">{m.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-bold">{m.name}</p>
              <p className="text-caption text-secondary">{m.desc}</p>
            </div>
            {m.active && <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"><Check className="w-3 h-3 text-green-600" /></div>}
          </div>
        ))}
        <button className="w-full h-12 bg-brand-lime rounded-2xl text-xs font-bold text-brand-forest flex items-center justify-center gap-2 cursor-pointer active:scale-95 mt-2">
          <Plus className="w-4 h-4" /> Ajouter un moyen de paiement
        </button>
      </div>
    </div>
  );
}
