import { useRef } from "react";
import { Camera } from "lucide-react";
import type { SectionBaseProps } from "./types";
import { BannerGradient, StatusPill } from "../ui/ProCard";

export default function HeroSection({ mode, editing, pro, onUpdate }: SectionBaseProps) {
  const coverRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const isOwnerEdit = mode === "owner" && editing;

  const handleFile = (ref: React.RefObject<HTMLInputElement | null>, field: string) => {
    const file = ref.current?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUpdate?.(field, reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <section className="relative h-[200px] overflow-hidden shrink-0">
      {/* Cover */}
      {pro.coverUrl ? (
        <img src={pro.coverUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <BannerGradient category={pro.category} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      {isOwnerEdit && (
        <>
          <button onClick={() => coverRef.current?.click()}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 cursor-pointer active:scale-90 hover:bg-white/30 z-10">
            <Camera className="w-4 h-4 text-white" />
          </button>
          <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={() => handleFile(coverRef, "coverUrl")} />
        </>
      )}

      <StatusPill pro={pro} />

      {/* Avatar + Name */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-5">
        <div className="flex items-end gap-3">
          <div className="relative shrink-0">
            <div className="w-[64px] h-[64px] rounded-full overflow-hidden border-[3px] border-white shadow-lg bg-cm-border-soft">
              <img src={pro.avatarUrl} alt={pro.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            {isOwnerEdit && (
              <>
                <button onClick={() => avatarRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-cm-text flex items-center justify-center border-2 border-white cursor-pointer active:scale-90 hover:bg-cm-text/90">
                  <Camera className="w-3 h-3 text-white" />
                </button>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={() => handleFile(avatarRef, "avatarUrl")} />
              </>
            )}
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <h2 className="text-[22px] font-black text-white tracking-tight leading-tight">{pro.name}</h2>
            <p className="text-[12px] font-bold text-white/80 mt-0.5">{pro.title || pro.subCategory}</p>
            {pro.isVerified && (
              <div className="flex items-center gap-1.5 mt-1">
                <svg className="w-3 h-3 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">Vérifié</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
