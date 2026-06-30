import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, X, MessageSquare, Clock, FileText } from "lucide-react";
import { useQuoteStore } from "../../stores/quoteStore";
import { useRequestStore } from "../../stores/requestStore";
import { QUOTE_STATUS_LABELS } from "../../types";
import type { QuoteVersion, Mission } from "../../types";

export default function QuoteReviewPage() {
  const nav = useNavigate();
  const { requestId } = useParams<{ requestId: string }>();
  const quote = useQuoteStore((s) => requestId ? s.quotes[requestId] : undefined);
  const acceptQuote = useQuoteStore((s) => s.acceptQuote);
  const refuseQuote = useQuoteStore((s) => s.refuseQuote);
  const addClientComment = useQuoteStore((s) => s.addClientComment);
  const addMission = useRequestStore((s) => s.addMission);
  const requests = useRequestStore((s) => s.requests);

  const [comment, setComment] = useState(quote?.clientComment || "");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [selectedVersionIdx, setSelectedVersionIdx] = useState(quote ? quote.currentVersion - 1 : 0);

  const currentVersion: QuoteVersion | undefined = quote?.versions[selectedVersionIdx];

  const handleAccept = () => {
    if (!requestId || !quote || !currentVersion) return;
    acceptQuote(requestId);
    addClientComment(requestId, comment);

    const req = requests.find((r) => r.id === requestId);
    const mission: Mission = {
      id: "mission_" + Date.now(),
      requestId: requestId,
      clientId: req?.clientId || "client_marie",
      proId: quote.professionalId,
      status: "accepted",
      title: req?.title || "Mission",
      description: req?.description || "",
      category: req?.category || "",
      address: req?.address || "",
      budgetXOF: currentVersion.totalXOF,
      photos: [],
      proName: quote.professionalName,
      proAvatar: quote.professionalAvatar,
      proPhone: "",
      clientName: req?.clientId === "client_marie" ? "Marie K." : "Client",
      clientPhone: "+225 01 02 03 04",
      quoteId: quote.id,
      createdAt: new Date().toISOString(),
    };
    addMission(mission);
    nav(`/orders/payment/${mission.id}`);
  };

  const handleRefuse = () => {
    if (!requestId) return;
    refuseQuote(requestId);
    nav(-1);
  };

  if (!quote || !currentVersion) {
    return (
      <div className="min-h-screen bg-cm-bg flex items-center justify-center p-6">
        <div className="text-center">
          <FileText className="w-12 h-12 text-cm-text-muted mx-auto mb-3" />
          <p className="text-[14px] font-semibold text-cm-text mb-1">Devis introuvable</p>
          <p className="text-[12px] text-cm-text-muted mb-4">Ce devis n'existe pas ou a été supprimé</p>
          <button onClick={() => nav(-1)}
            className="h-10 px-6 bg-cm-accent rounded-[12px] text-[13px] font-medium text-white cursor-pointer">
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cm-bg pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-cm-bg/80 backdrop-blur-xl border-b border-cm-border/40">
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => nav(-1)}
              className="cm-scale-btn w-8 h-8 flex items-center justify-center rounded-[12px] bg-cm-elevated hover:bg-cm-border/50 cursor-pointer shrink-0">
              <ArrowLeft className="w-4 h-4 text-cm-text" />
            </button>
            <div className="flex-1">
              <h1 className="text-[16px] font-bold text-cm-text">Devis</h1>
              <p className="text-[11px] text-cm-text-muted">
                {quote.professionalName} — {QUOTE_STATUS_LABELS[quote.status]}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Pro info */}
        <div className="cm-card p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-cm-accent-soft flex items-center justify-center text-[16px] font-bold text-cm-accent">
            {quote.professionalName.charAt(0)}
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-cm-text">{quote.professionalName}</p>
            <p className="text-[12px] text-cm-text-soft">Professionnel</p>
          </div>
        </div>

        {/* Version selector */}
        {quote.versions.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {quote.versions.map((v, i) => (
              <button key={v.id} onClick={() => setSelectedVersionIdx(i)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap cursor-pointer cm-scale-btn ${
                  selectedVersionIdx === i
                    ? "bg-cm-accent text-white"
                    : "bg-cm-elevated border border-cm-border text-cm-text-soft"
                }`}>
                Version {v.version}
              </button>
            ))}
          </div>
        )}

        {/* Quote details */}
        <div className="cm-card p-4 space-y-3">
          <div className="flex items-center gap-2 text-cm-text-muted">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[12px]">
              {currentVersion.estimatedDurationMins} min estimées
            </span>
            <span className="text-[11px]">•</span>
            <span className="text-[12px]">
              {new Date(currentVersion.startDate).toLocaleDateString("fr-FR")} → {new Date(currentVersion.endDate).toLocaleDateString("fr-FR")}
            </span>
          </div>

          {/* Line items */}
          <div className="divide-y divide-cm-border">
            {currentVersion.lineItems.map((li) => (
              <div key={li.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-[13px] text-cm-text">{li.label}</p>
                  <p className="text-[10px] text-cm-text-muted">
                    {li.quantity} × {li.unitPriceXOF.toLocaleString("fr-FR")} F
                  </p>
                </div>
                <span className="text-[13px] font-semibold text-cm-text">
                  {li.totalXOF.toLocaleString("fr-FR")} F
                </span>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-2 border-t border-cm-border">
            <span className="text-[14px] font-bold text-cm-text">Total TTC</span>
            <span className="text-[22px] font-bold text-cm-accent">
              {currentVersion.totalXOF.toLocaleString("fr-FR")} F
            </span>
          </div>
        </div>

        {/* Materials */}
        {(currentVersion.materialsIncluded || currentVersion.materialsNotIncluded || currentVersion.materialsByClient) && (
          <div className="cm-card p-4 space-y-2">
            <h3 className="text-[13px] font-semibold text-cm-text">Matériaux</h3>
            {currentVersion.materialsIncluded && (
              <div>
                <p className="text-[11px] text-cm-accent font-medium">Inclus</p>
                <p className="text-[12px] text-cm-text-soft">{currentVersion.materialsIncluded}</p>
              </div>
            )}
            {currentVersion.materialsNotIncluded && (
              <div>
                <p className="text-[11px] text-cm-text-muted font-medium">Non inclus</p>
                <p className="text-[12px] text-cm-text-soft">{currentVersion.materialsNotIncluded}</p>
              </div>
            )}
            {currentVersion.materialsByClient && (
              <div>
                <p className="text-[11px] text-amber-600 font-medium">À fournir par le client</p>
                <p className="text-[12px] text-cm-text-soft">{currentVersion.materialsByClient}</p>
              </div>
            )}
          </div>
        )}

        {/* Warranty & Conditions */}
        {currentVersion.warranty && (
          <div className="cm-card p-4">
            <h3 className="text-[13px] font-semibold text-cm-text mb-1">Garantie</h3>
            <p className="text-[12px] text-cm-text-soft">{currentVersion.warranty}</p>
          </div>
        )}
        {currentVersion.conditions && (
          <div className="cm-card p-4">
            <h3 className="text-[13px] font-semibold text-cm-text mb-1">Conditions</h3>
            <p className="text-[12px] text-cm-text-soft">{currentVersion.conditions}</p>
          </div>
        )}

        {/* Validity */}
        {currentVersion.validUntil && (
          <div className="cm-card p-4">
            <h3 className="text-[13px] font-semibold text-cm-text mb-1">Valable jusqu'au</h3>
            <p className="text-[12px] text-cm-text-soft">
              {new Date(currentVersion.validUntil).toLocaleDateString("fr-FR", {
                year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>
        )}

        {/* Notes */}
        {currentVersion.notes && (
          <div className="cm-card p-4">
            <h3 className="text-[13px] font-semibold text-cm-text mb-1">Notes du professionnel</h3>
            <p className="text-[12px] text-cm-text-soft">{currentVersion.notes}</p>
          </div>
        )}

        {/* Client comment input */}
        {showCommentInput && (
          <div className="cm-card p-4">
            <h3 className="text-[13px] font-semibold text-cm-text mb-2">Votre message</h3>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)}
              className="w-full h-20 px-3 py-2 text-[12px] bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text resize-none"
              placeholder="Demander une modification, poser une question..." />
          </div>
        )}

        {/* Action buttons */}
        {quote.status === "sent" || quote.status === "modified" ? (
          <div className="space-y-2">
            <button onClick={handleAccept}
              className="w-full h-12 bg-cm-accent rounded-[14px] text-[14px] font-bold text-white flex items-center justify-center gap-2 cm-scale-btn hover:bg-cm-accent-hover cursor-pointer">
              <Check className="w-4 h-4" />
              Accepter le devis
            </button>
            <button onClick={() => setShowCommentInput(!showCommentInput)}
              className="w-full h-11 border border-cm-accent text-cm-accent rounded-[14px] text-[13px] font-medium flex items-center justify-center gap-2 cm-scale-btn cursor-pointer">
              <MessageSquare className="w-4 h-4" />
              {showCommentInput ? "Masquer" : "Demander une modification"}
            </button>
            <button onClick={handleRefuse}
              className="w-full h-11 border border-red-200 text-red-500 rounded-[14px] text-[13px] font-medium flex items-center justify-center gap-2 cm-scale-btn cursor-pointer">
              <X className="w-4 h-4" />
              Refuser le devis
            </button>
          </div>
        ) : quote.status === "accepted" ? (
          <div className="cm-card p-4 bg-cm-accent-soft border border-cm-accent/20 text-center">
            <Check className="w-8 h-8 text-cm-accent mx-auto mb-2" />
            <p className="text-[14px] font-semibold text-cm-accent">Devis accepté</p>
            <p className="text-[12px] text-cm-text-soft mt-1">Vous allez être redirigé vers le paiement</p>
          </div>
        ) : quote.status === "refused" ? (
          <div className="cm-card p-4 bg-red-50 border border-red-200 text-center">
            <X className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-[14px] font-semibold text-red-600">Devis refusé</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
