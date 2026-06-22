import { ArrowLeft, MapPin, Plus, Home, Building, Trash2 } from "lucide-react";

interface ClientAddressesScreenProps { onBack: () => void; }

const addresses = [
  { id: "a1", label: "Domicile", icon: Home, addr: "Cocody Riviera 3, Abidjan", default: true },
  { id: "a2", label: "Bureau", icon: Building, addr: "Plateau, Avenue Noguès, Abidjan", default: false },
  { id: "a3", label: "Parents", icon: Home, addr: "Marcory Zone 4, Abidjan", default: false },
];

export default function ClientAddressesScreen({ onBack }: ClientAddressesScreenProps) {
  return (
    <div className="flex flex-col w-full min-h-screen pb-32" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, #F5F0E8 100%)" }}>
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, rgba(216,243,220,0.90) 100%)" }}>
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-[12px] bg-[rgba(255,255,255,0.60)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] cursor-pointer active:scale-90 transition-all"><ArrowLeft className="w-4 h-4 text-ca-text-primary" /></button>
        <h1 className="text-[15px] font-bold text-ca-text-primary">Adresses</h1>
        <div className="w-9 h-9" />
      </header>
      <div className="px-4 pt-4 space-y-2">
        {addresses.map(a => (
          <div key={a.id} className="bg-[rgba(255,255,255,0.60)] backdrop-blur-[16px] rounded-[16px] border border-[rgba(255,255,255,0.50)] p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[rgba(255,255,255,0.50)] flex items-center justify-center"><a.icon className="w-4 h-4 text-ca-text-primary" /></div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-bold text-ca-text-primary">{a.label}</p>
                {a.default && <span className="text-[10px] font-medium bg-[rgba(45,106,79,0.12)] text-ca-green-primary px-1.5 py-0.5 rounded-full">Par défaut</span>}
              </div>
              <p className="text-[12px] text-ca-text-muted mt-0.5">{a.addr}</p>
            </div>
            <Trash2 className="w-4 h-4 text-ca-text-muted shrink-0" />
          </div>
        ))}
        <button className="w-full h-12 bg-[rgba(45,106,79,0.85)] rounded-[14px] text-[12px] font-bold text-white flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all mt-2 hover:bg-[rgba(45,106,79,0.95)]">
          <Plus className="w-4 h-4" /> Ajouter une adresse
        </button>
      </div>
    </div>
  );
}
