import { useRef, useState } from "react";
import { Plus, X, Camera } from "lucide-react";
import ProfileSection from "./ProfileSection";
import type { SectionWithPortfolioProps } from "./types";

export default function PortfolioSection({
  mode, editing, portfolio, onAddPortfolio, onDeletePortfolio,
}: SectionWithPortfolioProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const isOwnerEdit = mode === "owner" && editing;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setShowAdd(true);
  };

  const confirmAdd = () => {
    if (previewUrl) {
      onAddPortfolio?.(previewUrl, "");
      setPreviewUrl("");
      setShowAdd(false);
    }
  };

  return (
    <ProfileSection title="Portfolio" subtitle={isOwnerEdit ? `${portfolio.length} photo${portfolio.length > 1 ? "s" : ""}` : undefined}>
      <div className="grid grid-cols-3 gap-1.5">
        {portfolio.map((item) => (
          <div key={item.id} className="relative aspect-square rounded-[12px] overflow-hidden bg-gray-100 group">
            <img src={item.imageUrl} alt={item.caption || "Photo"} className="w-full h-full object-cover" />
            {isOwnerEdit && (
              <button onClick={() => onDeletePortfolio?.(item.id)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer active:scale-90">
                <X className="w-3 h-3" />
              </button>
            )}
            {item.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                <p className="text-[8px] font-bold text-white">{item.caption}</p>
              </div>
            )}
          </div>
        ))}
        {isOwnerEdit && (
          <button onClick={() => fileRef.current?.click()}
            className="aspect-square rounded-[12px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-300 hover:text-gray-500 hover:border-gray-300 transition-all cursor-pointer active:scale-[0.97]">
            <Camera className="w-5 h-5" />
            <span className="text-[7px] font-black uppercase tracking-wider">Ajouter</span>
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => { setShowAdd(false); setPreviewUrl(""); }}>
          <div className="bg-white rounded-[20px] overflow-hidden max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <img src={previewUrl} alt="Aperçu" className="w-full aspect-square object-cover" />
            <div className="p-4 flex gap-2">
              <button onClick={() => { setShowAdd(false); setPreviewUrl(""); }}
                className="flex-1 h-11 rounded-[12px] border border-gray-200 text-gray-500 text-[11px] font-black cursor-pointer active:scale-[0.98]">
                Annuler
              </button>
              <button onClick={confirmAdd}
                className="flex-1 h-11 rounded-[12px] bg-gray-900 text-white text-[11px] font-black cursor-pointer active:scale-[0.98] hover:bg-gray-800">
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </ProfileSection>
  );
}
