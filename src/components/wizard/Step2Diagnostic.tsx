import { useRef } from "react";
import { Camera, Video, X, Info, ChevronRight } from "lucide-react";
import { useRequestWizardStore } from "../../stores/requestWizardStore";
import { getQuestionsForCategory, type DiagnosticQuestion } from "../../data/diagnosticQuestions";
import { SERVICE_CATEGORIES } from "../../data/serviceCategories";

const CATEGORY_RESPONSES: Record<string, { subCategory: string; title: string; desc: string }[]> = {
  "maison-reparations": [
    { subCategory: "Électricien", title: "Le courant a sauté", desc: "Le disjoncteur général a sauté, toute la maison est sans électricité..." },
    { subCategory: "Plombier", title: "Fuite d'eau", desc: "Un robinet ou un tuyau fuit sous l'évier..." },
    { subCategory: "Plombier", title: "Canalisation bouchée", desc: "L'eau ne s'écoule plus dans l'évier, la douche ou les toilettes..." },
    { subCategory: "Climatisation", title: "Clim ne refroidit plus", desc: "Le climatiseur souffle de l'air tiède..." },
    { subCategory: "Serrurier", title: "Serrure bloquée", desc: "La clé ne tourne plus dans la serrure..." },
    { subCategory: "Menuisier", title: "Porte qui ferme mal", desc: "Une porte intérieure ne ferme plus correctement..." },
  ],
  "transport-livraison": [
    { subCategory: "Coursier", title: "Livraison urgente", desc: "Besoin d'un coursier pour livrer un colis rapidement..." },
    { subCategory: "Chauffeur privé", title: "Course en ville", desc: "Besoin d'un chauffeur pour un déplacement..." },
    { subCategory: "Déménagement", title: "Petit déménagement", desc: "Je déménage un studio..." },
  ],
  evenements: [
    { subCategory: "DJ", title: "DJ pour soirée", desc: "Je cherche un DJ pour animer une soirée..." },
    { subCategory: "Photographe", title: "Photographe mariage", desc: "Je cherche un photographe pour mon mariage..." },
    { subCategory: "Traiteur", title: "Traiteur pour réception", desc: "Besoin d'un traiteur..." },
  ],
  "education-formation": [
    { subCategory: "Répétiteur", title: "Aide aux devoirs", desc: "Je cherche un répétiteur pour mon enfant..." },
    { subCategory: "Langues", title: "Cours d'anglais", desc: "Je veux apprendre l'anglais..." },
    { subCategory: "Programmation", title: "Apprendre à coder", desc: "Je veux apprendre Python..." },
  ],
  "social-media-informatique": [
    { subCategory: "Développement Web", title: "Site vitrine", desc: "Je veux créer un site vitrine..." },
    { subCategory: "Design Graphique", title: "Flyer / Affiche", desc: "Besoin d'un design pour un flyer..." },
    { subCategory: "Community Management", title: "Gestion réseaux sociaux", desc: "Besoin de quelqu'un pour gérer Instagram..." },
  ],
  "assistance-services": [
    { subCategory: "Femme de ménage", title: "Ménage régulier", desc: "Je cherche une femme de ménage..." },
    { subCategory: "Baby-sitter", title: "Garde d'enfants", desc: "Je cherche une nounou..." },
    { subCategory: "Assistant personnel", title: "Assistant administratif", desc: "Je cherche un assistant..." },
  ],
};

export default function Step2Diagnostic() {
  const { draft, setDescription, setDiagnosticAnswer, addPhotos, removePhoto, setVideos } = useRequestWizardStore();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const questions = getQuestionsForCategory(draft.category);
  const categoryName = SERVICE_CATEGORIES.find((c) => c.id === draft.category)?.name;
  const responses = draft.category ? CATEGORY_RESPONSES[draft.category]?.filter(
    (r) => !draft.subCategory || r.subCategory === draft.subCategory,
  ) ?? [] : [];

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => addPhotos([reader.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const handleVideoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setVideos([reader.result as string]);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[18px] font-bold text-cm-text">Décrivez votre besoin</h2>
        <p className="text-[13px] text-cm-text-muted mt-1">
          {draft.subCategory
            ? `Parlez-nous de votre besoin en ${draft.subCategory.toLowerCase()}`
            : categoryName
              ? `Décrivez votre besoin en ${categoryName.toLowerCase()}`
              : "Soyez précis pour que les professionnels comprennent votre besoin"}
        </p>
      </div>

      {responses.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-5 px-5">
          {responses.map((r) => (
            <button
              key={r.title}
              onClick={() => setDescription(r.desc)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-cm-elevated border border-cm-border rounded-xl whitespace-nowrap cursor-pointer active:scale-95 hover:bg-cm-bg transition-all shrink-0"
            >
              <Info className="w-4 h-4 text-cm-text shrink-0" />
              <div className="text-left">
                <p className="text-[11px] font-bold text-cm-text">{r.title}</p>
                <p className="text-[9px] text-cm-text-muted">{r.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {questions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-[11px] font-bold text-cm-text-muted uppercase tracking-wider">
            Questions préliminaires
          </h3>
          {questions.map((q: DiagnosticQuestion) => (
            <div key={q.id} className="bg-cm-elevated rounded-2xl p-4 border border-cm-border space-y-2">
              <label className="text-[12px] font-bold text-cm-text">
                {q.question}
                {q.required && <span className="text-cm-error ml-0.5">*</span>}
              </label>
              {q.type === "boolean" ? (
                <div className="flex gap-2">
                  {["Oui", "Non"].map((opt) => {
                    const val = opt === "Oui" ? "yes" : "no";
                    const current = draft.diagnostic.find((a) => a.questionId === q.id)?.answer;
                    return (
                      <button
                        key={opt}
                        onClick={() => setDiagnosticAnswer({ questionId: q.id, question: q.question, answer: val })}
                        className={`flex-1 py-2.5 rounded-xl text-[12px] font-semibold transition-all active:scale-95 cursor-pointer ${
                          current === val
                            ? "bg-cm-text text-white"
                            : "bg-cm-bg text-cm-text border border-cm-border hover:border-cm-text/30"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : q.type === "select" && q.options ? (
                <div className="flex flex-wrap gap-1.5">
                  {q.options.map((opt) => {
                    const current = draft.diagnostic.find((a) => a.questionId === q.id)?.answer;
                    return (
                      <button
                        key={opt}
                        onClick={() => setDiagnosticAnswer({ questionId: q.id, question: q.question, answer: opt })}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all active:scale-95 cursor-pointer ${
                          current === opt
                            ? "bg-cm-text text-white"
                            : "bg-cm-bg text-cm-text border border-cm-border hover:border-cm-text/30"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  value={draft.diagnostic.find((a) => a.questionId === q.id)?.answer || ""}
                  onChange={(e) => setDiagnosticAnswer({ questionId: q.id, question: q.question, answer: e.target.value })}
                  placeholder={q.placeholder}
                  className="w-full h-10 px-3.5 text-[13px] font-medium bg-cm-bg border border-cm-border rounded-xl text-cm-text outline-none focus:border-cm-text placeholder:text-cm-text-muted"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <textarea
        value={draft.description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={draft.subCategory
          ? `Décrivez votre besoin précis en ${draft.subCategory.toLowerCase()}...`
          : "Décrivez votre besoin en détail..."}
        className="w-full h-36 text-[14px] bg-cm-elevated border border-cm-border rounded-2xl p-4 outline-none resize-none text-cm-text placeholder:text-cm-text-muted font-medium focus:border-cm-text"
      />

      <div>
        <div className="flex items-center gap-3 mb-3">
          <p className="text-[11px] font-bold text-cm-text-muted uppercase tracking-wider">Photos</p>
          <span className="text-[10px] text-cm-text-muted">Optionnel</span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {draft.photos.map((p, i) => (
            <div key={i} className="relative w-[68px] h-[68px] rounded-xl overflow-hidden border border-cm-border shrink-0">
              <img src={p} alt="" className="w-full h-full object-cover" />
              <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {draft.videos.length > 0 && (
            <div className="relative w-[68px] h-[68px] rounded-xl overflow-hidden border border-cm-text shrink-0 bg-cm-elevated flex items-center justify-center">
              <Video className="w-6 h-6 text-cm-text" />
              <button onClick={() => setVideos([])} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white cursor-pointer">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <button onClick={() => photoInputRef.current?.click()} className="w-[68px] h-[68px] rounded-xl border-2 border-dashed border-cm-border flex flex-col items-center justify-center gap-0.5 text-cm-text-muted bg-cm-elevated cursor-pointer hover:border-cm-text/30 transition-all shrink-0">
            <Camera className="w-5 h-5" />
            <span className="text-[8px] font-medium">Photo</span>
          </button>
          <button onClick={() => videoInputRef.current?.click()} className="w-[68px] h-[68px] rounded-xl border-2 border-dashed border-cm-border flex flex-col items-center justify-center gap-0.5 text-cm-text-muted bg-cm-elevated cursor-pointer hover:border-cm-text/30 transition-all shrink-0">
            <Video className="w-5 h-5" />
            <span className="text-[8px] font-medium">Vidéo</span>
          </button>
        </div>
        <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} />
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoAdd} />
      </div>
    </div>
  );
}
