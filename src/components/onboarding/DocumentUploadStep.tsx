import { Upload, Camera, FileText, X } from "lucide-react";

interface Document {
  type: string;
  url: string;
  name: string;
  status: "pending" | "uploaded" | "error";
}

interface DocumentUploadStepProps {
  documents: Document[];
  onDocumentsChange: (docs: Document[]) => void;
}

const DOCUMENT_TYPES = [
  { id: "cni_front", label: "CNI ou Passeport (Recto)", icon: FileText },
  { id: "cni_back", label: "CNI ou Passeport (Verso)", icon: FileText },
  { id: "selfie", label: "Selfie avec votre pièce", icon: Camera },
  { id: "certificate", label: "Certificat / Diplôme (optionnel)", icon: FileText },
];

export default function DocumentUploadStep({ documents, onDocumentsChange }: DocumentUploadStepProps) {
  const handleUpload = (type: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      const newDoc: Document = { type, url, name: file.name, status: "uploaded" };
      const filtered = documents.filter((d) => d.type !== type);
      onDocumentsChange([...filtered, newDoc]);
    };
    input.click();
  };

  const removeDoc = (type: string) => {
    onDocumentsChange(documents.filter((d) => d.type !== type));
  };

  return (
    <div>
      <h2 className="text-[18px] font-extrabold text-cm-text mb-1">Documents requis</h2>
      <p className="text-[13px] text-cm-text-soft mb-6">
        Fournissez les documents nécessaires à la vérification de votre identité.
      </p>

      <div className="space-y-3">
        {DOCUMENT_TYPES.map(({ id, label, icon: Icon }) => {
          const doc = documents.find((d) => d.type === id);
          return (
            <div key={id} className="bg-cm-elevated border border-cm-border rounded-[14px] p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${
                  doc ? "bg-cm-accent-soft" : "bg-cm-border-soft"
                }`}>
                  <Icon className={`w-5 h-5 ${doc ? "text-cm-accent" : "text-cm-text-muted"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-cm-text">{label}</p>
                  {doc && (
                    <p className="text-[11px] text-cm-text-muted truncate">{doc.name}</p>
                  )}
                </div>
                {doc ? (
                  <button onClick={() => removeDoc(id)}
                    className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center cursor-pointer">
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                ) : (
                  <button onClick={() => handleUpload(id)}
                    className="w-8 h-8 rounded-full bg-cm-accent-soft flex items-center justify-center cursor-pointer">
                    <Upload className="w-4 h-4 text-cm-accent" />
                  </button>
                )}
              </div>
              {doc && doc.status === "uploaded" && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-cm-accent">
                  <span className="w-1.5 h-1.5 rounded-full bg-cm-accent" />
                  Fichier téléversé
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-cm-text-muted mt-4">
        Les fichiers doivent être au format JPG, PNG ou PDF. Poids max : 10 Mo.
      </p>
    </div>
  );
}
