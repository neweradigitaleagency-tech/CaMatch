import { ArrowLeft, Plus, Check } from "lucide-react";

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
    <div className="flex flex-col w-full min-h-screen pb-32" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, #F5F0E8 100%)" }}>
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, rgba(216,243,220,0.90) 100%)" }}>
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-[12px] bg-[rgba(255,255,255,0.60)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] cursor-pointer active:scale-90 transition-all">
          <ArrowLeft className="w-4 h-4 text-ca-text-primary" />
        </button>
        <h1 className="text-[15px] font-bold text-ca-text-primary">Moyens de paiement</h1>
        <div className="w-9 h-9" />
      </header>
      <div className="px-4 pt-4 space-y-2">
        {methods.map(m => (
          <div key={m.id} className="bg-[rgba(255,255,255,0.60)] backdrop-blur-[16px] rounded-[16px] border border-[rgba(255,255,255,0.50)] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[rgba(255,255,255,0.50)] flex items-center justify-center text-lg">{m.icon}</div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-ca-text-primary">{m.name}</p>
              <p className="text-[12px] text-ca-text-muted mt-0.5">{m.desc}</p>
            </div>
            {m.active && <div className="w-5 h-5 rounded-full bg-[rgba(45,106,79,0.12)] flex items-center justify-center"><Check className="w-3 h-3 text-ca-green-primary" /></div>}
          </div>
        ))}
        <button className="w-full h-12 bg-[rgba(45,106,79,0.85)] rounded-[14px] text-[12px] font-bold text-white flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all mt-2 hover:bg-[rgba(45,106,79,0.95)]">
          <Plus className="w-4 h-4" /> Ajouter un moyen de paiement
        </button>
      </div>
    </div>
  );
}
