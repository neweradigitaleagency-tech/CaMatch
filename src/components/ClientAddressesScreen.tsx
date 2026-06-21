import { ArrowLeft, MapPin, Plus, Home, Building, Trash2 } from "lucide-react";

interface ClientAddressesScreenProps { onBack: () => void; }

const addresses = [
  { id: "a1", label: "Domicile", icon: Home, addr: "Cocody Riviera 3, Abidjan", default: true },
  { id: "a2", label: "Bureau", icon: Building, addr: "Plateau, Avenue Noguès, Abidjan", default: false },
  { id: "a3", label: "Parents", icon: Home, addr: "Marcory Zone 4, Abidjan", default: false },
];

export default function ClientAddressesScreen({ onBack }: ClientAddressesScreenProps) {
  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-cream pb-32">
      <header className="flex items-center justify-between px-4 py-3 bg-brand-cream/90 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-brand-forest hover:bg-pale-mint transition-colors shadow-sm cursor-pointer active:scale-95"><ArrowLeft className="w-5 h-5" /></button>
        <h1 className="font-sans text-sm font-bold">Adresses</h1>
        <div className="w-9 h-9" />
      </header>
      <div className="px-4 pt-4 space-y-2">
        {addresses.map(a => (
          <div key={a.id} className="bg-white rounded-2xl p-4 border border-pale-mint/20 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pale-mint flex items-center justify-center"><a.icon className="w-4 h-4 text-brand-forest" /></div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold">{a.label}</p>
                {a.default && <span className="text-caption bg-brand-lime/20 text-brand-forest font-bold px-1.5 py-0.5 rounded-full">Par défaut</span>}
              </div>
              <p className="text-caption text-secondary">{a.addr}</p>
            </div>
            <Trash2 className="w-4 h-4 text-secondary/50" />
          </div>
        ))}
        <button className="w-full h-12 bg-brand-lime rounded-2xl text-xs font-bold text-brand-forest flex items-center justify-center gap-2 cursor-pointer active:scale-95 mt-2">
          <Plus className="w-4 h-4" /> Ajouter une adresse
        </button>
      </div>
    </div>
  );
}
