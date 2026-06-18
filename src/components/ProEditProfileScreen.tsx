import { useState, useRef } from "react";
import { ArrowLeft, Camera, Save, Upload } from "lucide-react";
import { ProfessionalDetails } from "../types";

interface ProEditProfileScreenProps {
  pro: ProfessionalDetails;
  onSave: (updates: Partial<ProfessionalDetails> & { travelFeeXOF: number; serviceRadiusKm: number }) => void;
  onBack: () => void;
}

export default function ProEditProfileScreen({ pro, onSave, onBack }: ProEditProfileScreenProps) {
  const [form, setForm] = useState({
    title: pro.title,
    bio: pro.bio,
    phoneNumber: pro.phoneNumber,
    hourlyRateXOF: pro.hourlyRateXOF,
    locationNeighborhood: pro.locationNeighborhood,
    travelFeeXOF: 5000,
    serviceRadiusKm: 10,
    avatarUrl: pro.avatarUrl,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (key: string, value: string | number) => setForm((f) => ({ ...f, [key]: value }));

  const handleAvatarUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("avatarUrl", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave(form);
    onBack();
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-cream pb-8">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-brand-cream/90 backdrop-blur-md">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-brand-forest hover:bg-pale-mint transition-colors shadow-sm cursor-pointer active:scale-95">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-sans text-sm font-bold text-brand-forest">Modifier le profil</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="px-4 space-y-4 mt-2">
        {/* Avatar */}
        <div className="flex flex-col items-center py-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-brand-lime shadow-premium">
              <img alt="Avatar" className="w-full h-full object-cover" src={form.avatarUrl} />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-brand-lime flex items-center justify-center border-2 border-white cursor-pointer hover:bg-brand-lime/80 transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-brand-forest" />
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          <p className="text-[10px] text-on-surface-variant mt-2 font-medium">Appuyez pour changer la photo</p>
        </div>

        <EditField label="Titre professionnel" value={form.title} onChange={(v) => update("title", v)} />
        <EditField label="Bio" value={form.bio} onChange={(v) => update("bio", v)} textarea />
        <EditField label="Téléphone" value={form.phoneNumber} onChange={(v) => update("phoneNumber", v)} />
        <EditField label="Localisation" value={form.locationNeighborhood} onChange={(v) => update("locationNeighborhood", v)} />
        <EditField label="Taux horaire (F CFA)" value={form.hourlyRateXOF.toString()} onChange={(v) => update("hourlyRateXOF", parseInt(v) || 0)} numeric />
        <EditField label="Frais déplacement (F CFA)" value={form.travelFeeXOF.toString()} onChange={(v) => update("travelFeeXOF", parseInt(v) || 0)} numeric />
        <EditField label="Zone d'intervention (km)" value={form.serviceRadiusKm.toString()} onChange={(v) => update("serviceRadiusKm", parseInt(v) || 5)} numeric />

        <button
          onClick={handleSave}
          className="w-full bg-brand-forest text-white font-extrabold text-xs py-4 rounded-2xl uppercase tracking-wider hover:bg-brand-lime hover:text-brand-forest transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Enregistrer les modifications
        </button>
      </div>
    </div>
  );
}

function EditField({ label, value, onChange, textarea, numeric }: {
  label: string; value: string; onChange: (v: string) => void; textarea?: boolean; numeric?: boolean;
}) {
  return (
    <div>
      <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">{label}</p>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className="w-full text-sm bg-white rounded-xl p-3 outline-none focus:ring-1 focus:ring-brand-lime border border-pale-mint/20 resize-none min-h-[80px] shadow-sm" />
      ) : (
        <input type={numeric ? "number" : "text"} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-11 text-sm bg-white rounded-xl px-3 outline-none focus:ring-1 focus:ring-brand-lime border border-pale-mint/20 shadow-sm" />
      )}
    </div>
  );
}
