import { useState } from "react";
import { ArrowLeft, MapPin, DollarSign, Clock, AlertTriangle, Trash2 } from "lucide-react";
import { ClientRequest, URGENCY_LABELS, MISSION_STATUS_LABELS } from "../types";
import ImageViewer from "./ImageViewer";

interface RequestDetailScreenProps {
  request: ClientRequest;
  onBack: () => void;
  onDelete?: (id: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  created: "bg-blue-50 text-blue-600",
  accepted: "bg-purple-50 text-purple-600",
  en_route: "bg-amber-50 text-amber-600",
  in_progress: "bg-orange-50 text-orange-600",
  completed: "bg-green-50 text-green-600",
  paid: "bg-emerald-50 text-emerald-600",
  reviewed: "bg-teal-50 text-teal-600",
};

export default function RequestDetailScreen({ request, onBack, onDelete }: RequestDetailScreenProps) {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIdx, setGalleryIdx] = useState(0);

  return (
    <div className="flex flex-col w-full min-h-screen bg-brand-cream pb-32">
      <header className="flex items-center justify-between px-4 py-3 bg-brand-cream/90 backdrop-blur-md sticky top-0 z-10">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-brand-forest hover:bg-pale-mint transition-colors shadow-sm cursor-pointer active:scale-95">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-sans text-sm font-bold truncate max-w-[200px]">{request.title}</h1>
        {onDelete && (
          <button onClick={() => onDelete(request.id)} className="w-12 h-12 flex items-center justify-center rounded-full bg-red-50 text-red-500 cursor-pointer active:scale-95">
            <Trash2 className="w-5 h-5" />
          </button>
        )}
      </header>

      <div className="px-4 pt-4 space-y-3">
        <div className="bg-white rounded-2xl p-5 border border-pale-mint/20 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className={`text-caption font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[request.status] || "bg-pale-mint text-secondary"}`}>
              {MISSION_STATUS_LABELS[request.status] || request.status}
            </span>
            <span className="text-caption text-secondary">
              {new Date(request.createdAt).toLocaleDateString("fr-FR")}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-secondary mb-4">{request.description}</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-secondary/60" />
              <span>{request.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-secondary/60" />
              <span className="font-bold">{request.budgetXOF.toLocaleString()} F</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-secondary/60" />
              <span>{URGENCY_LABELS[request.urgency]}</span>
            </div>
          </div>
          {request.photos && request.photos.length > 0 && (
            <div className="mt-4 flex gap-2 overflow-x-auto">
              {request.photos.map((p, i) => (
                <button key={i} onClick={() => { setGalleryIdx(i); setGalleryOpen(true); }}
                  className="shrink-0 w-20 h-20 rounded-xl overflow-hidden cursor-pointer active:scale-95">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {request.status === "created" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-800 mb-1">En attente d'un professionnel</p>
              <p className="text-caption text-amber-700 leading-relaxed">
                Votre demande a été publiée. Un professionnel va bientôt vous répondre. Vous serez notifié dès qu'un pro sera intéressé.
              </p>
            </div>
          </div>
        )}
      </div>

      <ImageViewer
        images={request.photos.map(p => ({ url: p, title: request.title }))}
        initialIndex={galleryIdx}
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
      />
    </div>
  );
}
