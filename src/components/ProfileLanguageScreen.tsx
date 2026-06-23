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
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-elevated border-b border-cm-border">
        <button onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-[12px] border border-cm-border bg-cm-elevated cursor-pointer active:scale-90 transition-all">
          <ArrowLeft className="w-4 h-4 text-cm-text" />
        </button>
        <h1 className="text-[15px] font-bold text-cm-text">Langue</h1>
        <div className="w-9 h-9" />
      </header>

      <div className="mx-4 pt-4">
        <div className="bg-cm-elevated border border-cm-border rounded-[20px] overflow-hidden shadow-cm-sm">
          {LANGUAGES.map((lang, i) => (
            <button
              key={lang.id}
              onClick={() => setSelected(lang.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors text-left ${
                i < LANGUAGES.length - 1 ? "border-b border-cm-border" : ""
              } ${selected === lang.id ? "bg-cm-accent-soft" : "hover:bg-cm-border-soft"}`}
            >
              <Globe className={`w-4 h-4 ${selected === lang.id ? "text-cm-accent" : "text-cm-text-muted"}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-bold ${selected === lang.id ? "text-cm-accent" : "text-cm-text"}`}>{lang.name}</p>
                <p className="text-[11px] text-cm-text-muted">{lang.native}</p>
              </div>
              {selected === lang.id && <Check className="w-4 h-4 text-cm-accent shrink-0" />}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-cm-text-muted mt-3 px-1 leading-relaxed">
          La langue sélectionnée sera utilisée pour l'interface de l'application et les communications.
        </p>
      </div>
    </div>
  );
}
