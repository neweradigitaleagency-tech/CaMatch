import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { OfferModalProps, ServiceModalProps } from "./types";

/* ───── OfferModal ───── */
export function OfferModal({ open, mode, initial, onClose, onSave }: OfferModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("Promo");
  const [badgeColor, setBadgeColor] = useState("bg-amber-500");
  const [price, setPrice] = useState<number | undefined>();
  const [originalPrice, setOriginalPrice] = useState<number | undefined>();

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setDescription(initial.description);
      setBadge(initial.badge);
      setBadgeColor(initial.badgeColor);
      setPrice(initial.price);
      setOriginalPrice(initial.originalPrice);
    } else {
      setTitle(""); setDescription(""); setBadge("Promo"); setBadgeColor("bg-amber-500"); setPrice(undefined); setOriginalPrice(undefined);
    }
  }, [initial, open]);

  if (!open) return null;

  const handleSave = () => {
    const data = { title, description, badge, badgeColor, price, originalPrice };
    if (mode === "edit" && initial) {
      onSave({ ...initial, ...data });
    } else {
      onSave(data);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-[24px] sm:rounded-[24px] w-full max-w-sm p-6 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-black text-gray-900">{mode === "edit" ? "Modifier l'offre" : "Nouvelle offre"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3.5">
          <InputField label="Titre" value={title} onChange={setTitle} placeholder="Ex: Pack Découverte" />
          <TextField label="Description" value={description} onChange={setDescription} placeholder="Décrivez l'offre..." />
          <InputField label="Badge" value={badge} onChange={setBadge} placeholder="Ex: Promo" />
          <div className="flex gap-2">
            {["bg-amber-500", "bg-emerald-500", "bg-red-500", "bg-blue-500"].map((c) => (
              <button key={c} onClick={() => setBadgeColor(c)}
                className={`w-8 h-8 rounded-[10px] ${c} ${badgeColor === c ? "ring-2 ring-gray-900 ring-offset-2" : ""} cursor-pointer`} />
            ))}
          </div>
          <InputField label="Prix" value={price || 0} onChange={(v) => setPrice(Number(v) || undefined)} type="number" suffix="F" />
          <InputField label="Prix original (optionnel)" value={originalPrice || 0} onChange={(v) => setOriginalPrice(Number(v) || undefined)} type="number" suffix="F" />
        </div>
        <button onClick={handleSave}
          className="w-full h-12 rounded-[14px] bg-gray-900 text-white text-[12px] font-black uppercase tracking-wider mt-6 cursor-pointer active:scale-[0.98] hover:bg-gray-800">
          {mode === "edit" ? "Enregistrer" : "Ajouter l'offre"}
        </button>
      </div>
    </div>
  );
}

/* ───── ServiceModal ───── */
export function ServiceModal({ open, mode, initial, onClose, onSave }: ServiceModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceEstimateXOF, setPriceEstimateXOF] = useState(0);

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setDescription(initial.description);
      setPriceEstimateXOF(initial.priceEstimateXOF);
    } else {
      setName(""); setDescription(""); setPriceEstimateXOF(0);
    }
  }, [initial, open]);

  if (!open) return null;

  const handleSave = () => {
    const data = { name, description, priceEstimateXOF };
    if (mode === "edit" && initial) {
      onSave({ ...initial, ...data });
    } else {
      onSave(data);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-[24px] sm:rounded-[24px] w-full max-w-sm p-6 pb-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-black text-gray-900">{mode === "edit" ? "Modifier le service" : "Nouveau service"}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3.5">
          <InputField label="Nom" value={name} onChange={setName} placeholder="Ex: Réparation électrique" />
          <TextField label="Description" value={description} onChange={setDescription} placeholder="Décrivez le service..." />
          <InputField label="Prix" value={priceEstimateXOF} onChange={(v) => setPriceEstimateXOF(Number(v))} type="number" suffix="F" />
        </div>
        <button onClick={handleSave}
          className="w-full h-12 rounded-[14px] bg-gray-900 text-white text-[12px] font-black uppercase tracking-wider mt-6 cursor-pointer active:scale-[0.98] hover:bg-gray-800">
          {mode === "edit" ? "Enregistrer" : "Ajouter le service"}
        </button>
      </div>
    </div>
  );
}

/* ───── Shared input helpers ───── */
function InputField({ label, value, onChange, type = "text", suffix, placeholder }: {
  label: string; value: string | number; onChange: (v: string) => void; type?: string; suffix?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">{label}</label>
      <div className="relative">
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full h-11 rounded-[12px] border border-gray-200 bg-white px-3 text-[13px] outline-none focus:ring-1 focus:ring-gray-300 transition-all" />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function TextField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[9px] font-black text-gray-500 uppercase tracking-wider mb-1.5 block">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3}
        className="w-full rounded-[12px] border border-gray-200 bg-white px-3 py-2.5 text-[13px] resize-none outline-none focus:ring-1 focus:ring-gray-300 transition-all" />
    </div>
  );
}
