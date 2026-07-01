import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Eye, Download, MessageSquare } from "lucide-react";
import type { ProApplicationStatus } from "../../types";

const MOCK_APP = {
  id: "app1",
  name: "Yao Cissé",
  phone: "+225 07 5966 509",
  email: "yao.cisse@email.com",
  categories: ["Plombier", "Électricien"],
  location: "Cocody, Abidjan",
  radiusKm: 15,
  experienceYears: 5,
  title: "Plombier professionnel",
  bio: "Je suis plombier avec 5 ans d'expérience dans l'installation et la réparation.",
  hourlyRateXOF: 15000,
  travelFeeXOF: 5000,
  documents: [
    { name: "CNI (Recto)", type: "identity" },
    { name: "CNI (Verso)", type: "identity" },
    { name: "Diplôme plomberie", type: "diploma" },
  ],
  submittedAt: "2026-06-28T10:00:00Z",
};

export default function AdminApplicationDetail() {
  const nav = useNavigate();
  const [status, setStatus] = useState<ProApplicationStatus>("SUBMITTED");
  const [notes, setNotes] = useState("");
  const [showConfirm, setShowConfirm] = useState<ProApplicationStatus | null>(null);

  const handleAction = (action: ProApplicationStatus) => {
    setShowConfirm(action);
  };

  const confirmAction = () => {
    if (showConfirm) setStatus(showConfirm);
    setShowConfirm(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => nav("/admin/applications")}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <h1 className="text-[16px] font-bold text-gray-900">{MOCK_APP.name}</h1>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Status badge */}
        <div className="bg-white border border-gray-200 rounded-[14px] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-cm-accent" />
            <span className="text-[12px] font-semibold text-cm-text">Détails de la candidature</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            {[
              { label: "Téléphone", value: MOCK_APP.phone },
              { label: "Email", value: MOCK_APP.email },
              { label: "Localisation", value: MOCK_APP.location },
              { label: "Rayon", value: `${MOCK_APP.radiusKm} km` },
            ].map((d) => (
              <div key={d.label}>
                <p className="text-cm-text-muted">{d.label}</p>
                <p className="text-cm-text font-medium">{d.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white border border-gray-200 rounded-[14px] p-4">
          <p className="text-[12px] text-cm-text-muted mb-2">Métiers</p>
          <div className="flex flex-wrap gap-1.5">
            {MOCK_APP.categories.map((cat) => (
              <span key={cat} className="px-2.5 py-1 bg-cm-accent-soft text-cm-accent rounded-full text-[11px] font-medium">
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Pro info */}
        <div className="bg-white border border-gray-200 rounded-[14px] p-4">
          <p className="text-[12px] font-semibold text-cm-text mb-2">Informations professionnelles</p>
          <div className="space-y-1.5 text-[12px]">
            {[
              { label: "Titre", value: MOCK_APP.title },
              { label: "Bio", value: MOCK_APP.bio },
              { label: "Expérience", value: `${MOCK_APP.experienceYears} ans` },
              { label: "Taux horaire", value: `${MOCK_APP.hourlyRateXOF.toLocaleString("fr-FR")} F` },
              { label: "Frais déplacement", value: `${MOCK_APP.travelFeeXOF.toLocaleString("fr-FR")} F` },
            ].map((d) => (
              <div key={d.label} className="flex items-start justify-between">
                <span className="text-cm-text-muted">{d.label}</span>
                <span className="text-cm-text font-medium text-right max-w-[60%]">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white border border-gray-200 rounded-[14px] p-4">
          <p className="text-[12px] font-semibold text-cm-text mb-2">Documents</p>
          <div className="space-y-2">
            {MOCK_APP.documents.map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-[10px]">
                <span className="text-[12px] text-cm-text">{doc.name}</span>
                <button className="flex items-center gap-1 text-[11px] text-cm-accent font-medium cursor-pointer">
                  <Download className="w-3.5 h-3.5" /> Voir
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notes & Actions */}
        <div className="bg-white border border-gray-200 rounded-[14px] p-4">
          <label className="text-[12px] font-semibold text-cm-text mb-2 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> Notes de révision
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ajouter une note..."
            rows={3}
            className="w-full text-[13px] bg-gray-50 border border-gray-200 rounded-[10px] p-3 outline-none text-gray-900 placeholder-gray-400 resize-none"
          />
        </div>

        {/* Action buttons */}
        {status !== "APPROVED" && status !== "REJECTED" && (
          <div className="flex gap-3 pb-4">
            <button onClick={() => handleAction("APPROVED")}
              className="flex-1 h-12 bg-green-600 rounded-[16px] text-[14px] font-bold text-white flex items-center justify-center gap-2 cursor-pointer hover:bg-green-700 active:scale-[0.97] transition-all">
              <CheckCircle className="w-4 h-4" /> Approuver
            </button>
            <button onClick={() => handleAction("REJECTED")}
              className="flex-1 h-12 bg-red-500 rounded-[16px] text-[14px] font-bold text-white flex items-center justify-center gap-2 cursor-pointer hover:bg-red-600 active:scale-[0.97] transition-all">
              <XCircle className="w-4 h-4" /> Rejeter
            </button>
          </div>
        )}

        {status === "APPROVED" && (
          <div className="flex items-center justify-center gap-2 p-4 bg-green-50 border border-green-200 rounded-[14px]">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-[13px] font-semibold text-green-600">Approuvée</span>
          </div>
        )}
        {status === "REJECTED" && (
          <div className="flex items-center justify-center gap-2 p-4 bg-red-50 border border-red-200 rounded-[14px]">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-[13px] font-semibold text-red-500">Rejetée</span>
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 pb-8">
          <div className="bg-white rounded-[20px] px-6 py-5 mx-4 w-full max-w-sm shadow-xl">
            <h3 className="text-[16px] font-bold text-cm-text text-center mb-2">
              {showConfirm === "APPROVED" ? "Approuver cette candidature ?" : "Rejeter cette candidature ?"}
            </h3>
            <p className="text-[13px] text-cm-text-soft text-center mb-5">
              Cette action enverra une notification au professionnel.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(null)}
                className="flex-1 h-11 rounded-[14px] text-[13px] font-semibold text-cm-text border border-cm-border cursor-pointer">
                Annuler
              </button>
              <button onClick={confirmAction}
                className={`flex-1 h-11 rounded-[14px] text-[13px] font-bold text-white cursor-pointer ${
                  showConfirm === "APPROVED" ? "bg-green-600" : "bg-red-500"
                }`}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
