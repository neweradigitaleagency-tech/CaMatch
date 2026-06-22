import { ArrowLeft, Check, Globe } from "lucide-react";
import { useState } from "react";

interface ProfileLanguageScreenProps { onBack: () => void; }

const LANGUAGES = [
  { id: "fr", name: "Français", native: "Français" },
  { id: "en", name: "Anglais", native: "English" },
  { id: "bambara", name: "Bambara", native: "Bamanankan" },
  { id: "dioula", name: "Dioula", native: "Dioula" },
  { id: "baoule", name: "Baoulé", native: "Baoulé" },
];

export default function ProfileLanguageScreen({ onBack }: ProfileLanguageScreenProps) {
  const [selected, setSelected] = useState("fr");

  return (
    <div className="flex flex-col w-full min-h-screen pb-32" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, #F5F0E8 100%)" }}>
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, rgba(216,243,220,0.90) 100%)" }}>
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-[12px] bg-[rgba(255,255,255,0.60)] backdrop-blur-[8px] border border-[rgba(255,255,255,0.35)] cursor-pointer active:scale-90 transition-all">
          <ArrowLeft className="w-4 h-4 text-ca-text-primary" />
        </button>
        <h1 className="text-[15px] font-bold text-ca-text-primary">Langue</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="mx-4 pt-4">
        <div className="bg-[rgba(255,255,255,0.60)] backdrop-blur-[16px] rounded-[20px] border border-[rgba(255,255,255,0.50)] overflow-hidden">
          {LANGUAGES.map((lang, i) => (
            <button
              key={lang.id}
              onClick={() => setSelected(lang.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors text-left ${
                i < LANGUAGES.length - 1 ? "border-b border-[rgba(232,224,208,0.30)]" : ""
              } ${selected === lang.id ? "bg-[rgba(45,106,79,0.08)]" : "hover:bg-[rgba(255,255,255,0.30)]"}`}
            >
              <Globe className={`w-4 h-4 ${selected === lang.id ? "text-ca-green-primary" : "text-ca-text-muted"}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-bold ${selected === lang.id ? "text-ca-green-primary" : "text-ca-text-primary"}`}>{lang.name}</p>
                <p className="text-[11px] text-ca-text-muted">{lang.native}</p>
              </div>
              {selected === lang.id && <Check className="w-4 h-4 text-ca-green-primary shrink-0" />}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-ca-text-muted mt-3 px-1 leading-relaxed">
          La langue sélectionnée sera utilisée pour l'interface de l'application et les communications.
        </p>
      </div>
    </div>
  );
}
