import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Check, X, MessageSquare, Clock, FileText, Truck, Store, UserCheck, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { useQuoteStore } from "../../stores/quoteStore";
import { useRequestStore } from "../../stores/requestStore";
import { useMaterialFulfillmentStore } from "../../stores/materialFulfillmentStore";
import { QUOTE_STATUS_LABELS } from "../../types";
import type { QuoteVersion, Mission, QuoteLineItem } from "../../types";
import {
  MATERIAL_FULFILLMENT_OPTIONS,
  getFulfillmentFee,
  getMaterialAlternatives,
  getMaterialLines,
  materialProductPrice,
  resolveMaterialProduct,
} from "../../utils/quoteMaterials";
import type { MaterialFulfillmentMode } from "../../utils/quoteMaterials";
import { formatXOF } from "../../utils/format";

const MODE_ICONS: Record<MaterialFulfillmentMode, React.ComponentType<{ className?: string }>> = {
  delivery: Truck,
  self_pickup: Store,
  pro_pickup: UserCheck,
};

export default function QuoteReviewPage() {
  const { goBack, navigate } = useAppNavigation();
  const { requestId } = useParams<{ requestId: string }>();
  const quote = useQuoteStore((s) => requestId ? s.quotes[requestId] : undefined);
  const acceptQuote = useQuoteStore((s) => s.acceptQuote);
  const refuseQuote = useQuoteStore((s) => s.refuseQuote);
  const addClientComment = useQuoteStore((s) => s.addClientComment);
  const addMission = useRequestStore((s) => s.addMission);
  const requests = useRequestStore((s) => s.requests);
  const materialSelection = useMaterialFulfillmentStore((s) => (requestId ? s.selections[requestId] : undefined));
  const setAlternative = useMaterialFulfillmentStore((s) => s.setAlternative);
  const setMode = useMaterialFulfillmentStore((s) => s.setMode);

  const [comment, setComment] = useState(quote?.clientComment || "");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [selectedVersionIdx, setSelectedVersionIdx] = useState(quote ? quote.currentVersion - 1 : 0);
  const [showFulfillment, setShowFulfillment] = useState(false);
  const [expandedMaterialId, setExpandedMaterialId] = useState<string | null>(null);

  const currentVersion: QuoteVersion | undefined = quote?.versions[selectedVersionIdx];

  const materialLines = getMaterialLines(currentVersion?.lineItems ?? []);

  const chosenMaterials = useMemo(
    () =>
      materialLines.map((li) => {
        const originalId = li.productId!;
        const chosenId = materialSelection?.alternatives[originalId] ?? originalId;
        const product = resolveMaterialProduct(chosenId);
        return {
          line: li,
          product,
          unitPrice: product ? materialProductPrice(product) : li.unitPriceXOF,
        };
      }),
    [materialLines, materialSelection]
  );

  const originalMaterialsTotal = materialLines.reduce((sum, li) => sum + li.totalXOF, 0);
  const finalMaterialsTotal = chosenMaterials.reduce((sum, c) => sum + c.unitPrice * c.line.quantity, 0);
  const adjustedQuoteTotal = currentVersion ? currentVersion.totalXOF - originalMaterialsTotal + finalMaterialsTotal : 0;
  const materialMode = materialSelection?.mode ?? "delivery";
  const materialModeLabel = MATERIAL_FULFILLMENT_OPTIONS.find((o) => o.id === materialMode)?.label ?? "";
  const fulfillmentFee = getFulfillmentFee(materialMode, finalMaterialsTotal);
  const grandTotal = adjustedQuoteTotal + fulfillmentFee;
  const totalChanged = currentVersion ? grandTotal !== currentVersion.totalXOF : false;

  const confirmAndGoToPayment = (totalXOF: number) => {
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
      budgetXOF: totalXOF,
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
    navigate(`/orders/payment/${mission.id}`);
  };

  const handleAccept = () => {
    if (!requestId || !quote || !currentVersion) return;
    if (getMaterialLines(currentVersion.lineItems).length > 0) {
      setShowFulfillment(true);
    } else {
      confirmAndGoToPayment(currentVersion.totalXOF);
    }
  };

  const handleRefuse = () => {
    if (!requestId) return;
    refuseQuote(requestId);
    goBack();
  };

  const swapMaterial = (line: QuoteLineItem, alternativeId: string) => {
    if (!requestId || !line.productId) return;
    setAlternative(requestId, line.productId, alternativeId);
  };

  if (!quote || !currentVersion) {
    return (
      <div className="min-h-dynamic bg-cm-bg flex items-center justify-center p-6">
        <div className="text-center">
          <FileText className="w-12 h-12 text-cm-text-muted mx-auto mb-3" />
          <p className="text-[14px] font-semibold text-cm-text mb-1">Devis introuvable</p>
          <p className="text-[12px] text-cm-text-muted mb-4">Ce devis n'existe pas ou a été supprimé</p>
          <button onClick={() => goBack()}
            className="h-10 px-6 bg-cm-accent rounded-[12px] text-[13px] font-medium text-white cursor-pointer">
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dynamic bg-cm-bg pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-cm-bg/80 backdrop-blur-xl border-b border-cm-border/40">
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => goBack()}
              className="cm-scale-btn p-1 cursor-pointer active:scale-[0.97] transition-transform touch-min shrink-0">
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
                    ? "bg-cm-accent text-cm-text-onAccent"
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
            {currentVersion.lineItems.map((li) => {
              const material = li.source === "marketplace" && li.productId
                ? resolveMaterialProduct(materialSelection?.alternatives[li.productId] ?? li.productId)
                : undefined;
              return (
                <div key={li.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-[13px] text-cm-text">{material?.name ?? li.label}</p>
                    <p className="text-[10px] text-cm-text-muted">
                      {material ? `${material.brand} · ${material.supplierName}` : ""}
                      {material ? " · " : ""}
                      {li.quantity} × {formatXOF(material ? materialProductPrice(material) : li.unitPriceXOF)}
                    </p>
                  </div>
                  <span className="text-[13px] font-semibold text-cm-text">
                    {formatXOF(material ? materialProductPrice(material) * li.quantity : li.totalXOF)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Total */}
          <div className="pt-2 border-t border-cm-border">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-bold text-cm-text">Total TTC</span>
              <span className="text-[22px] font-bold text-cm-accent">
                {formatXOF(currentVersion.totalXOF)}
              </span>
            </div>
            {quote.commissionPercent !== undefined && quote.commissionPercent > 0 && (
              <p className="text-[10px] text-cm-text-muted text-right mt-1">
                dont frais de service Ça Match ({quote.commissionPercent}%) :{" "}
                {formatXOF(Math.round((currentVersion.totalXOF * quote.commissionPercent) / 100))}
              </p>
            )}
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

      {/* Fulfillment sheet */}
      <AnimatePresence>
        {showFulfillment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
            onClick={() => setShowFulfillment(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-t-[20px] sm:rounded-[20px] flex flex-col max-h-[88vh] pb-[env(safe-area-inset-bottom,0px)]"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-cm-border/40">
                <div>
                  <h3 className="text-[16px] font-bold text-cm-text">Valider les matériaux</h3>
                  <p className="text-[11px] text-cm-text-muted mt-0.5">Comparez et choisissez comment les recevoir</p>
                </div>
                <button onClick={() => setShowFulfillment(false)} className="p-1 cursor-pointer">
                  <X className="w-5 h-5 text-cm-text-muted" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                {/* Materials + alternatives */}
                <div>
                  <h4 className="text-[12px] font-semibold text-cm-text mb-2">Matériaux du devis</h4>
                  <div className="space-y-2">
                    {chosenMaterials.map(({ line, product, unitPrice }) => {
                      const altProducts = product ? getMaterialAlternatives(product) : [];
                      const expanded = expandedMaterialId === line.id;
                      return (
                        <div key={line.id} className="bg-cm-surface border border-cm-border rounded-xl p-3">
                          <div className="flex items-center gap-2.5">
                            {product?.images?.[0] && (
                              <img src={product.images[0]} alt={product.name}
                                className="w-11 h-11 rounded-lg object-cover shrink-0"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-cm-text truncate">{product?.name ?? line.label}</p>
                              <p className="text-[10px] text-cm-text-muted">
                                {product ? `${product.brand} · ${product.supplierName ?? product.location}` : line.label}
                              </p>
                              <p className="text-[11px] text-cm-text-soft mt-0.5">
                                {line.quantity} × {formatXOF(unitPrice)}
                              </p>
                            </div>
                            <span className="text-[13px] font-semibold text-cm-text">
                              {formatXOF(unitPrice * line.quantity)}
                            </span>
                          </div>

                          {altProducts.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-cm-border/60">
                              <button
                                onClick={() => setExpandedMaterialId(expanded ? null : line.id)}
                                className="flex items-center gap-1 text-[11px] font-medium text-cm-accent cursor-pointer">
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
                                Alternatives moins chères ou équivalentes ({altProducts.length})
                              </button>
                              <AnimatePresence>
                                {expanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-2 space-y-1.5">
                                      {altProducts.map((alt) => {
                                        const altPrice = materialProductPrice(alt);
                                        const delta = altPrice - unitPrice;
                                        const selected = alt.id === product?.id;
                                        return (
                                          <button key={alt.id}
                                            onClick={() => swapMaterial(line, alt.id)}
                                            className={`w-full flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer active:scale-[0.99] transition-all ${
                                              selected
                                                ? "border-cm-accent bg-cm-accent-soft"
                                                : "border-cm-border bg-white"
                                            }`}>
                                            {alt.images?.[0] && (
                                              <img src={alt.images[0]} alt={alt.name}
                                                className="w-8 h-8 rounded-md object-cover shrink-0"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                                            )}
                                            <div className="flex-1 min-w-0 text-left">
                                              <p className="text-[12px] font-medium text-cm-text truncate">{alt.name}</p>
                                              <p className="text-[10px] text-cm-text-muted">
                                                {alt.supplierName ?? alt.location} · {alt.brand}
                                              </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                              <p className="text-[12px] font-semibold text-cm-text">{formatXOF(altPrice)}</p>
                                              <p className={`text-[10px] font-medium ${delta <= 0 ? "text-cm-green" : "text-cm-text-muted"}`}>
                                                {delta === 0 ? "Équivalent" : delta < 0 ? `${formatXOF(-delta)} moins cher` : `+${formatXOF(delta)}`}
                                              </p>
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Fulfillment choice */}
                <div>
                  <h4 className="text-[12px] font-semibold text-cm-text mb-2">Comment recevoir les matériaux ?</h4>
                  <div className="space-y-2">
                    {MATERIAL_FULFILLMENT_OPTIONS.map((opt) => {
                      const Icon = MODE_ICONS[opt.id];
                      const active = materialMode === opt.id;
                      const optionFee = getFulfillmentFee(opt.id, finalMaterialsTotal);
                      return (
                        <button key={opt.id}
                          onClick={() => setMode(requestId!, opt.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left cursor-pointer active:scale-[0.99] transition-all ${
                            active ? "border-cm-accent bg-cm-accent-soft" : "border-cm-border bg-white"
                          }`}>
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            active ? "bg-cm-accent text-white" : "bg-cm-surface text-cm-text-soft"
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-cm-text">{opt.label}</p>
                            <p className="text-[11px] text-cm-text-muted">{opt.hint}</p>
                          </div>
                          <span className={`text-[11px] font-semibold shrink-0 ${
                            optionFee === 0 ? "text-cm-green" : "text-cm-text"
                          }`}>
                            {optionFee === 0 ? "Gratuit" : formatXOF(optionFee)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer summary */}
              <div className="px-5 pt-3 pb-4 border-t border-cm-border/40 space-y-2">
                <div className="flex justify-between text-[12px]">
                  <span className="text-cm-text-muted">Sous-total matériaux</span>
                  <span className="font-medium text-cm-text">{formatXOF(finalMaterialsTotal)}</span>
                </div>
                <div className="flex justify-between text-[12px]">
                  <span className="text-cm-text-muted">{materialModeLabel}</span>
                  <span className="font-medium text-cm-text">{fulfillmentFee === 0 ? "Inclus" : formatXOF(fulfillmentFee)}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-cm-border/60">
                  <span className="text-[14px] font-bold text-cm-text">Total à payer</span>
                  <span className="text-[20px] font-bold text-cm-accent">{formatXOF(grandTotal)}</span>
                </div>
                <p className="text-[10px] text-cm-text-muted">
                  Le total inclut la main-d'œuvre et le déplacement du devis
                  {totalChanged ? " — ajusté selon vos choix de matériaux" : ""}.
                </p>
                <button onClick={() => confirmAndGoToPayment(grandTotal)}
                  className="w-full h-12 bg-cm-accent rounded-[14px] text-[14px] font-bold text-white flex items-center justify-center gap-2 cm-scale-btn hover:bg-cm-accent-hover cursor-pointer">
                  <Truck className="w-4 h-4" />
                  Continuer vers le paiement
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
