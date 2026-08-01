import { ArrowLeft, Eye, Pencil, Save, X } from "lucide-react";
import type { ProfileHeaderProps } from "./types";

export default function ProfileHeader({
  mode, proName, editing, onBack, onEdit, onSave, onCancel,
}: ProfileHeaderProps) {
  if (mode === "client") {
    return (
      <header className="flex items-center justify-between px-4 h-14 sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-cm-border/40">
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full text-cm-text-soft hover:bg-cm-surface transition-colors cursor-pointer active:scale-90 shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-[13px] font-black text-cm-text tracking-tight truncate mx-2">{proName || "Profil"}</h1>
        <div className="w-9 h-9" />
      </header>
    );
  }

  if (mode === "preview") {
    return (
      <header className="flex items-center justify-between px-4 h-14 sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-cm-border/40">
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full text-cm-text-soft hover:bg-cm-surface transition-colors cursor-pointer active:scale-90 shrink-0">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-[13px] font-black text-cm-text tracking-tight truncate mx-2">Aperçu client</h1>
        <button onClick={onEdit}
          className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-cm-text text-white text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95 hover:bg-cm-text/90 transition-all shrink-0">
          <Pencil className="w-3 h-3" /> Modifier
        </button>
      </header>
    );
  }

  if (editing) {
    return (
      <header className="flex items-center justify-between px-4 h-14 sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-cm-border/40">
        <button onClick={onCancel}
          className="flex items-center gap-1.5 h-9 px-3 rounded-full text-cm-text-muted text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95 hover:bg-cm-surface transition-all shrink-0">
          <X className="w-3 h-3" /> Annuler
        </button>
        <h1 className="text-[13px] font-black text-cm-text tracking-tight truncate mx-2">Modifier le profil</h1>
        <button onClick={onSave}
          className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-cm-text text-white text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95 hover:bg-cm-text/90 transition-all shrink-0">
          <Save className="w-3 h-3" /> Enregistrer
        </button>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between px-4 h-14 sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-cm-border/40">
      <button onClick={onBack}
        className="w-9 h-9 flex items-center justify-center rounded-full text-cm-text-soft hover:bg-cm-surface transition-colors cursor-pointer active:scale-90 shrink-0">
        <ArrowLeft className="w-4 h-4" />
      </button>
      <h1 className="text-[13px] font-black text-cm-text tracking-tight truncate mx-2">Mon profil</h1>
      <button onClick={onEdit}
        className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-cm-text text-white text-[10px] font-black uppercase tracking-wider cursor-pointer active:scale-95 hover:bg-cm-text/90 transition-all shrink-0">
        <Pencil className="w-3 h-3" /> Modifier
      </button>
    </header>
  );
}
