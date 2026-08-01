import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, MapPin, Calendar, Clock, Phone, CheckCircle, XCircle, MessageSquare, X, Package, Plus, Minus, ShoppingCart, Loader2, Check } from "lucide-react";
import { MOCK_PRO_JOBS } from "../../services/mockData";
import { MOCK_PRODUCTS, MOCK_DELIVERY_ZONES } from "../../data/supplier-mocks";
import { createMaterialOrder } from "../../services/supplier/orders.service";
import CrossLinkSuggestions from "../../components/ui/CrossLinkSuggestions";
import { formatXOF } from "../../utils/format";
import type { ProJobStatus } from "../../types";

const STEP_ORDER: ProJobStatus[] = ["pending", "accepted", "en_route", "arrived", "photos_taken", "in_progress", "completed", "client_validation", "closed"];

const STEP_LABELS: Record<ProJobStatus, string> = {
  pending: "En attente",
  accepted: "Acceptée",
  quote_required: "Devis",
  en_route: "En route",
  arrived: "Arrivé",
  photos_taken: "Photos prises",
  in_progress: "En cours",
  completed: "Terminée",
  client_validation: "Validation",
  closed: "Clôturée",
  cancelled: "Annulée",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-orange-500/15 text-orange-600",
  accepted: "bg-blue-500/15 text-blue-600",
  quote_required: "bg-violet-500/15 text-violet-600",
  en_route: "bg-purple-500/15 text-purple-600",
  arrived: "bg-indigo-500/15 text-indigo-600",
  in_progress: "bg-amber-500/15 text-amber-600",
  completed: "bg-green-500/15 text-green-600",
  client_validation: "bg-teal-500/15 text-teal-600",
  closed: "bg-cm-text/15 text-cm-text",
  cancelled: "bg-red-500/15 text-red-600",
};

export default function ProMissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const goBack = useBackNavigation("/pro/dashboard");
  const job = MOCK_PRO_JOBS.find((j) => j.id === id);
  const [localStatus, setLocalStatus] = useState<ProJobStatus | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showMaterialSelector, setShowMaterialSelector] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const handleCreateOrder = async () => {
    if (!job || Object.keys(selectedItems).length === 0) return;
    setOrderLoading(true);
    const firstSupplier = availableSuppliers[0];
    if (!firstSupplier) { setOrderLoading(false); return; }

    const items = Object.entries(selectedItems).map(([pid, qty]) => {
      const product = MOCK_PRODUCTS.find((p) => p.id === pid)!;
      return { productId: pid, productName: product.name, quantity: qty, unitPrice: product.cmPrice };
    });

    const result = await createMaterialOrder({
      jobId: job.id,
      supplierId: firstSupplier.supplierId,
      clientId: job.clientId,
      professionalId: "current-pro-id",
      deliveryCity: clientCity,
      deliveryAddress: job.clientLocation,
      deliveryCost: firstSupplier.deliveryCost,
      items,
    });

    setOrderLoading(false);
    if (result) {
      setOrderSuccess(true);
      setTimeout(() => {
        setShowMaterialSelector(false);
        setSelectedItems({});
        setOrderSuccess(false);
      }, 1500);
    }
  };

  // Find suppliers delivering to this client's city
  const clientCity = (job?.clientLocation ?? "").split(",")[0]?.trim() ?? "";
  const availableSuppliers = useMemo(() => {
    const zones = MOCK_DELIVERY_ZONES.filter((z) => clientCity.toLowerCase().includes(z.city.toLowerCase()));
    const supplierIds = [...new Set(zones.map((z) => z.supplierId))];
    return supplierIds.map((sid) => {
      const supplierZones = zones.filter((z) => z.supplierId === sid);
      const products = MOCK_PRODUCTS.filter((p) => p.supplierId === sid && p.isActive && p.isVisible);
      return { supplierId: sid, zones: supplierZones, products, deliveryCost: Math.min(...supplierZones.map((z) => z.price)) };
    }).filter((s) => s.products.length > 0);
  }, [clientCity]);

  const addItem = (productId: string) => {
    setSelectedItems((prev) => ({ ...prev, [productId]: (prev[productId] ?? 0) + 1 }));
  };
  const removeItem = (productId: string) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      const current = next[productId] ?? 0;
      if (current <= 1) delete next[productId];
      else next[productId] = current - 1;
      return next;
    });
  };
  const materialSubtotal = useMemo(() => {
    let total = 0;
    for (const [pid, qty] of Object.entries(selectedItems)) {
      const product = MOCK_PRODUCTS.find((p) => p.id === pid);
      if (product) total += (product.cmPrice) * qty;
    }
    return total;
  }, [selectedItems]);
  const deliveryCost = availableSuppliers.length > 0 ? Math.min(...availableSuppliers.map((s) => s.deliveryCost)) : 0;
  const materialTotal = materialSubtotal + deliveryCost;

  if (!job) {
    return (
      <div className="min-h-dynamic bg-cm-bg flex items-center justify-center">
        <p className="text-sm text-cm-text-muted">Mission introuvable</p>
      </div>
    );
  }

  const effectiveStatus = localStatus ?? (job.status as ProJobStatus);
  const currentStepIndex = STEP_ORDER.indexOf(effectiveStatus);
  const isCancelled = effectiveStatus === "cancelled";

  const handleAccept = (type: "fixed" | "quote") => {
    setLocalStatus(type === "fixed" ? "accepted" : "quote_required");
    setShowAcceptModal(false);
  };

  const handleReject = () => {
    setLocalStatus("cancelled");
    setShowRejectConfirm(false);
  };

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={goBack} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Détail mission</h1>
        </div>
      </div>

      <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[16px] font-bold text-cm-text">{job.serviceName}</h2>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[effectiveStatus] || "bg-cm-surface text-cm-text-soft"}`}>
              {STEP_LABELS[effectiveStatus] || effectiveStatus}
            </span>
          </div>
          <p className="text-[12px] text-cm-text-muted mb-3">{job.description}</p>
          <div className="space-y-2 text-[12px]">
            <div className="flex items-center gap-2 text-cm-text-muted">
              <MapPin className="w-3.5 h-3.5 text-cm-accent shrink-0" />
              <span>{job.clientLocation}</span>
            </div>
            <div className="flex items-center gap-2 text-cm-text-muted">
              <Calendar className="w-3.5 h-3.5 text-cm-accent shrink-0" />
              <span>{job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString("fr-FR") : "Non planifiée"}</span>
            </div>
            <div className="flex items-center gap-2 text-cm-text-muted">
              <Clock className="w-3.5 h-3.5 text-cm-accent shrink-0" />
              <span>{job.scheduledTime || "—"}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-cm-border">
            <div>
              <p className="text-[12px] font-bold text-cm-text">Total</p>
              <p className="text-[18px] font-bold text-cm-accent font-mono">{job.totalFeeXOF.toLocaleString("fr-FR")} F</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-medium text-cm-text">{job.clientName}</p>
            </div>
          </div>
        </motion.div>

        {!isCancelled && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-cm-elevated border border-cm-border rounded-[14px] p-5"
          >
            <h3 className="text-[13px] font-bold text-cm-text mb-4">Progression</h3>
            <div className="flex items-center justify-between">
              {STEP_ORDER.map((step, i) => {
                const done = i <= currentStepIndex;
                const isLast = i === STEP_ORDER.length - 1;
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${
                          done ? "bg-cm-accent text-cm-text-onAccent" : "bg-cm-border text-cm-text-muted"
                        }`}
                      >
                        {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                      </div>
                      <span className={`text-[9px] mt-1 text-center ${done ? "text-cm-accent font-semibold" : "text-cm-text-muted"}`}>
                        {STEP_LABELS[step]}
                      </span>
                    </div>
                    {!isLast && (
                      <div className={`flex-1 h-0.5 mx-1 ${done && currentStepIndex > i ? "bg-cm-accent" : "bg-cm-border"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <div className="flex flex-wrap gap-2">
          {effectiveStatus === "pending" && (
            <>
              <button onClick={() => setShowAcceptModal(true)} className="flex-1 px-4 py-2.5 bg-green-500 text-white text-[12px] font-semibold rounded-full cursor-pointer active:scale-[0.97]">
                Accepter
              </button>
              <button onClick={() => setShowRejectConfirm(true)} className="flex-1 px-4 py-2.5 bg-red-500/15 text-red-600 text-[12px] font-semibold rounded-full cursor-pointer active:scale-[0.97]">
                Refuser
              </button>
            </>
          )}
          {(effectiveStatus === "accepted" || effectiveStatus === "en_route" || effectiveStatus === "arrived") && (
            <button onClick={() => setShowMaterialSelector(true)}
              className="flex-1 px-4 py-2.5 bg-cm-elevated border border-cm-accent/30 text-cm-accent text-[12px] font-semibold rounded-full cursor-pointer active:scale-[0.97] flex items-center justify-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Matériaux
            </button>
          )}
          {effectiveStatus !== "pending" && effectiveStatus !== "completed" && effectiveStatus !== "client_validation" && effectiveStatus !== "closed" && effectiveStatus !== "cancelled" && (
            <button className="flex-1 px-4 py-2.5 bg-cm-accent text-cm-text-onAccent text-[12px] font-semibold rounded-full cursor-pointer active:scale-[0.97]">
              {effectiveStatus === "in_progress" ? "Terminer" : "Contacter"}
            </button>
          )}
          <button className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-cm-elevated border border-cm-border text-cm-text text-[12px] font-medium rounded-full cursor-pointer active:scale-[0.97]">
            <MessageSquare className="w-3.5 h-3.5" />
            Message
          </button>
          <button className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-cm-elevated border border-cm-border text-cm-text text-[12px] font-medium rounded-full cursor-pointer active:scale-[0.97]">
            <Phone className="w-3.5 h-3.5" />
            Appeler
          </button>
        </div>
      </div>

      <CrossLinkSuggestions clientCity={clientCity} missionId={job.id} />

      <AnimatePresence>
        {showMaterialSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
            onClick={() => { setShowMaterialSelector(false); setSelectedItems({}) }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
               className="w-full max-w-lg bg-white rounded-t-[20px] sm:rounded-[20px] pb-6 flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between p-5 pb-3 border-b border-cm-border/40">
                <div>
                  <h3 className="text-[16px] font-bold">Ajouter des matériaux</h3>
                  <p className="text-[11px] text-cm-text-muted mt-0.5">Livraison à {clientCity || "votre zone"}</p>
                </div>
                <button onClick={() => { setShowMaterialSelector(false); setSelectedItems({}) }} className="p-1 cursor-pointer">
                  <X className="w-5 h-5 text-cm-text-muted" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 pt-3 space-y-4">
                {availableSuppliers.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-10 h-10 text-cm-border-soft mx-auto mb-2" />
                    <p className="text-[13px] text-cm-text-muted">Aucun fournisseur trouvé dans votre zone</p>
                    <p className="text-[11px] text-cm-text-muted mt-1">Essayez avec une autre adresse</p>
                  </div>
                ) : (
                  availableSuppliers.map((supplier) => (
                    <div key={supplier.supplierId}>
                      <h4 className="text-[12px] font-semibold text-cm-text-soft mb-2">
                        Fournisseur #{supplier.supplierId.replace("supplier-", "")}
                        <span className="text-cm-text-muted font-normal"> · {formatXOF(supplier.deliveryCost)} livraison</span>
                      </h4>
                      <div className="space-y-1.5">
                        {supplier.products.map((product) => {
                          const qty = selectedItems[product.id] ?? 0;
                          const isOnSale = product.salePrice && product.salePrice > 0 && product.salePrice < product.supplierPrice;
                          return (
                            <div key={product.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-cm-surface">
                              {product.images?.[0] && (
                                <img src={product.images[0]} alt={product.name}
                                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-medium text-cm-text truncate">{product.name}</p>
                                <p className="text-[11px] text-cm-text-muted">{product.brand}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {isOnSale ? (
                                    <>
                                      <span className="text-[12px] font-bold text-red-600">{formatXOF(product.salePrice!)}</span>
                                      <span className="text-[10px] text-cm-text-muted line-through">{formatXOF(product.supplierPrice)}</span>
                                    </>
                                  ) : (
                                    <span className="text-[12px] font-semibold text-cm-text-soft">{formatXOF(product.cmPrice)}</span>
                                   )}
                                   {!product.unlimitedStock && (
                                     <span className="text-[10px] text-cm-text-muted">Stock: {product.availableStock}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button onClick={() => removeItem(product.id)}
                                  className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                                    qty > 0 ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-cm-surface text-cm-border-soft cursor-not-allowed"
                                  }`}>
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-6 text-center text-[13px] font-bold">{qty}</span>
                                <button onClick={() => addItem(product.id)}
                                  disabled={!product.unlimitedStock && (product.availableStock ?? 0) <= qty}
                                  className="w-7 h-7 rounded-full bg-cm-green/10 text-cm-green flex items-center justify-center hover:bg-cm-green/20 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {materialSubtotal > 0 && (
                <div className="px-5 pt-3 border-t border-cm-border/40 space-y-2">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-cm-text-muted">Sous-total</span>
                    <span className="font-medium">{formatXOF(materialSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-gray-500">Livraison</span>
                    <span className="font-medium">{formatXOF(deliveryCost)}</span>
                  </div>
                  <div className="flex justify-between text-[14px] font-bold">
                    <span>Total</span>
                    <span className="text-cm-accent">{formatXOF(materialTotal)}</span>
                  </div>
                  <button
                    onClick={handleCreateOrder}
                    disabled={orderLoading || orderSuccess}
                    className="w-full h-11 bg-cm-accent text-white text-[13px] font-bold rounded-xl hover:opacity-90 cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {orderLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : orderSuccess ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <ShoppingCart className="w-4 h-4" />
                    )}
                    {orderLoading ? "Création..." : orderSuccess ? "Commande envoyée !" : `Commander (${Object.keys(selectedItems).length} produits)`}
                  </button>
                  <p className="text-[10px] text-cm-text-soft/50 text-center">Un devis matériaux sera envoyé au client pour validation</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {showAcceptModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
            onClick={() => setShowAcceptModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-t-[20px] sm:rounded-[20px] p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-bold">Accepter la mission</h3>
                <button onClick={() => setShowAcceptModal(false)} className="p-1 cursor-pointer">
                  <X className="w-5 h-5 text-cm-text-muted" />
                </button>
              </div>
              <p className="text-[12px] text-cm-text-muted mb-4">Comment souhaitez-vous facturer cette mission ?</p>
              <div className="space-y-2">
                <button
                  onClick={() => handleAccept("fixed")}
                  className="w-full p-4 rounded-xl border border-cm-border bg-cm-bg text-left hover:border-cm-accent transition-colors cursor-pointer"
                >
                  <p className="text-[14px] font-bold text-cm-text">Prix fixé</p>
                  <p className="text-[11px] text-cm-text-muted mt-0.5">{job.totalFeeXOF.toLocaleString("fr-FR")} F — tel que proposé</p>
                </button>
                <button
                  onClick={() => handleAccept("quote")}
                  className="w-full p-4 rounded-xl border border-cm-border bg-cm-bg text-left hover:border-cm-accent transition-colors cursor-pointer"
                >
                  <p className="text-[14px] font-bold text-cm-text">Sur devis</p>
                  <p className="text-[11px] text-cm-text-muted mt-0.5">Je fournirai un devis personnalisé au client</p>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showRejectConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
            onClick={() => setShowRejectConfirm(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-t-[20px] sm:rounded-[20px] p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-bold">Refuser la mission</h3>
                <button onClick={() => setShowRejectConfirm(false)} className="p-1 cursor-pointer">
                  <X className="w-5 h-5 text-cm-text-muted" />
                </button>
              </div>
              <p className="text-[12px] text-cm-text-muted mb-4">Êtes-vous sûr de vouloir refuser cette mission ?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRejectConfirm(false)}
                  className="flex-1 h-11 rounded-xl border border-cm-border text-[12px] font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 h-11 rounded-xl bg-red-500 text-white text-[12px] font-semibold cursor-pointer active:scale-[0.97]"
                >
                  Refuser
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
