import { ArrowLeft, MapPin, Plus, Home, Building, Trash2 } from "lucide-react";

interface ClientAddressesScreenProps { onBack: () => void; }

const addresses = [
  { id: "a1", label: "Domicile", icon: Home, addr: "Cocody Riviera 3, Abidjan", default: true },
  { id: "a2", label: "Bureau", icon: Building, addr: "Plateau, Avenue Noguès, Abidjan", default: false },
  { id: "a3", label: "Parents", icon: Home, addr: "Marcory Zone 4, Abidjan", default: false },
];

export default function ClientAddressesScreen({ onBack }: ClientAddressesScreenProps) {
  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-elevated border-b border-cm-border">
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-[12px] border border-cm-border bg-cm-elevated cursor-pointer active:scale-90 transition-all">
          <ArrowLeft className="w-4 h-4 text-cm-text" />
        </button>
        <h1 className="text-[15px] font-bold text-cm-text">Adresses</h1>
        <div className="w-9 h-9" />
      </header>
      <div className="px-4 pt-4 space-y-2">
        {addresses.map(a => (
          <div key={a.id} className="bg-cm-elevated border border-cm-border rounded-[16px] p-4 flex items-center gap-3 shadow-cm-sm">
            <div className="w-10 h-10 rounded-[12px] bg-cm-accent-soft flex items-center justify-center"><a.icon className="w-4 h-4 text-cm-accent" /></div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-bold text-cm-text">{a.label}</p>
                {a.default && <span className="text-[10px] font-medium bg-cm-accent-soft text-cm-accent px-1.5 py-0.5 rounded-full">Par défaut</span>}
              </div>
              <p className="text-[12px] text-cm-text-muted mt-0.5">{a.addr}</p>
            </div>
            <Trash2 className="w-4 h-4 text-cm-text-muted shrink-0" />
          </div>
        ))}
        <button className="w-full h-12 bg-cm-text rounded-[14px] text-[12px] font-bold text-white flex items-center justify-center gap-2 cursor-pointer active:scale-[0.97] transition-all mt-2 hover:opacity-90">
          <Plus className="w-4 h-4" /> Ajouter une adresse
        </button>
      </div>
    </div>
  );
}
