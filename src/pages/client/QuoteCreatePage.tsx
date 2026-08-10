import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft, Plus, Trash2, Send, Search, Package, X, Minus,
  ShoppingCart, MapPin, CalendarDays, Wrench,
} from "lucide-react";
import type { QuoteLineItem } from "../../types";
import type { Product, MaterialProduct } from "../../types/marketplace";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { useQuoteStore } from "../../stores/quoteStore";
import { useAuthStore } from "../../stores/authStore";
import { useSubscriptionStore } from "../../stores/subscriptionStore";
import { useProStore } from "../../stores/proStore";
import { MOCK_PROS } from "../../services/mockData";
import { MARKETPLACE_PRODUCTS } from "../../data/marketplaceProducts";
import { getProCommissionPercent } from "../../data/proCommission";
import CommissionBreakdown from "../../components/pro/CommissionBreakdown";
import { formatXOF, TRAVEL_TIERS, getTravelTier } from "../../components/pro/dashboard";
import type { TravelTierId } from "../../components/pro/dashboard";

const TYPE_LABELS: Record<QuoteLineItem["type"], string> = {
  labor: "Main-d'œuvre",
  material: "Matériaux",
  travel: "Déplacement",
  other: "Autre",
};

const TYPE_CHIP: Record<QuoteLineItem["type"], string> = {
  labor: "bg-blue-500/10 text-blue-600",
  material: "bg-cm-accent/10 text-cm-accent",
  travel: "bg-amber-500/10 text-amber-600",
  other: "bg-cm-border-soft text-cm-text-muted",
};

const UNIT_LABELS: Record<string, string> = {
  piece: "pièce", bag: "sac", meter: "m", kg: "kg", liter: "L", box: "boîte", set: "lot",
};

const defaultLineItem = (type: QuoteLineItem["type"]): QuoteLineItem => ({
  id: `li_${Date.now()}`,
  label: TYPE_LABELS[type],
  quantity: 1,
  unitPriceXOF: 0,
  totalXOF: 0,
  type,
});

function productPrice(p: MaterialProduct): number {
  return p.cmPrice ?? p.price;
}

const isMaterialProduct = (p: Product): p is MaterialProduct => p.vertical === "pro_supply";

export default function QuoteCreatePage() {
  const { goBack, complete } = useAppNavigation();
  const { requestId } = useParams<{ requestId: string }>();
  const createQuote = useQuoteStore((s) => s.createQuote);
  const jobs = useProStore((s) => s.jobs);

  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([defaultLineItem("labor")]);
  const [travelTier, setTravelTier] = useState<TravelTierId | null>(null);
  const [estimatedDurationMins, setEstimatedDurationMins] = useState(60);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [warranty, setWarranty] = useState("");
  const [conditions, setConditions] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");

  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");
  const [pickerQty, setPickerQty] = useState<Record<string, number>>({});

  const userId = useAuthStore((s) => s.userId);
  const currentSubscription = useSubscriptionStore((s) => s.currentSubscription);
  const fetchCurrent = useSubscriptionStore((s) => s.fetchCurrent);

  useEffect(() => {
    if (userId) fetchCurrent(userId);
  }, [userId, fetchCurrent]);

  const commissionPercent = getProCommissionPercent(currentSubscription?.plan_id);

  const missionJob = useMemo(
    () => jobs.find((j) => j.id === requestId || j.id === `job-${requestId}`),
    [jobs, requestId]
  );

  const quincaillerieProducts = useMemo(
    () => MARKETPLACE_PRODUCTS.filter(isMaterialProduct).filter((p) => p.isAvailable && p.status === "active"),
    []
  );

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return quincaillerieProducts;
    return quincaillerieProducts.filter((p) =>
      [p.name, p.brand, p.category, p.subcategory, p.supplierName]
        .filter((f): f is string => Boolean(f))
        .some((f) => f.toLowerCase().includes(q))
    );
  }, [search, quincaillerieProducts]);

  const existingProductIds = useMemo(
    () => new Set(lineItems.filter((li) => li.productId).map((li) => li.productId!)),
    [lineItems]
  );

  const subtotalXOF = useMemo(() => lineItems.reduce((sum, li) => sum + li.totalXOF, 0), [lineItems]);

  const updateLineItem = (id: string, field: keyof QuoteLineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((li) => {
        if (li.id !== id) return li;
        const updated = { ...li, [field]: value };
        if (field === "quantity" || field === "unitPriceXOF") {
          updated.totalXOF = updated.quantity * updated.unitPriceXOF;
        }
        return updated;
      })
    );
  };

  const addLineItem = (type: QuoteLineItem["type"]) => {
    setLineItems((prev) => [...prev, { ...defaultLineItem(type), id: `li_${Date.now()}_${prev.length}` }]);
  };

  const removeLineItem = (id: string) => {
    const removed = lineItems.find((li) => li.id === id);
    if (removed?.type === "travel") setTravelTier(null);
    setLineItems((prev) => prev.filter((li) => li.id !== id));
  };

  const selectTravelTier = (tierId: TravelTierId) => {
    if (travelTier === tierId) {
      setTravelTier(null);
      setLineItems((prev) => prev.filter((li) => li.type !== "travel"));
      return;
    }
    setTravelTier(tierId);
    const tier = getTravelTier(tierId);
    if (!tier) return;
    setLineItems((prev) => {
      const withoutTravel = prev.filter((li) => li.type !== "travel");
      return [...withoutTravel, {
        id: `li_travel_${Date.now()}`,
        label: `Déplacement — ${tier.label}`,
        quantity: 1,
        unitPriceXOF: tier.amountXOF,
        totalXOF: tier.amountXOF,
        type: "travel",
      }];
    });
  };

  const changePickerQty = (productId: string, delta: number) => {
    setPickerQty((prev) => {
      const next = { ...prev };
      const current = next[productId] ?? 0;
      const product = quincaillerieProducts.find((p) => p.id === productId);
      const max = product?.stock ?? 9999;
      const value = Math.max(0, Math.min(current + delta, max));
      if (value <= 0) delete next[productId];
      else next[productId] = value;
      return next;
    });
  };

  const addMaterialsToQuote = () => {
    const entries = Object.entries(pickerQty).filter(([, qty]) => qty > 0);
    if (entries.length === 0) return;
    const newItems: QuoteLineItem[] = entries.map(([pid, qty]) => {
      const product = quincaillerieProducts.find((p) => p.id === pid);
      const unitPrice = product ? productPrice(product) : 0;
      return {
        id: `li_mat_${Date.now()}_${pid}`,
        label: product?.name ?? "Matériau",
        quantity: qty,
        unitPriceXOF: unitPrice,
        totalXOF: unitPrice * qty,
        type: "material",
        productId: pid,
        supplierId: product?.supplierId,
        source: "marketplace",
      };
    });
    setLineItems((prev) => [...prev, ...newItems]);
    setPickerQty({});
    setSearch("");
    setShowPicker(false);
  };

  const pickerSubtotal = Object.entries(pickerQty).reduce((sum, [pid, qty]) => {
    const product = quincaillerieProducts.find((p) => p.id === pid);
    return sum + (product ? productPrice(product) * qty : 0);
  }, 0);

  const handleSubmit = () => {
    if (!requestId) return;
    const currentPro = MOCK_PROS.find((p) => p.id === userId) || MOCK_PROS[0];
    createQuote({
      requestId,
      professionalId: userId || "pro_mock",
      professionalName: currentPro?.name || "Vous",
      professionalAvatar: "",
      lineItems,
      estimatedDurationMins,
      startDate,
      endDate,
      materialsIncluded: "",
      materialsNotIncluded: "",
      materialsByClient: "",
      warranty,
      conditions,
      validUntil,
      notes,
      attachments: [],
      commissionPercent,
    });
    complete();
  };

  return (
    <div className="min-h-dynamic bg-cm-bg pb-24">
      <div className="sticky top-0 z-10 bg-cm-bg/80 backdrop-blur-xl border-b border-cm-border/40">
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => goBack()}
              className="cm-scale-btn p-1 cursor-pointer active:scale-[0.97] transition-transform touch-min shrink-0">
              <ArrowLeft className="w-4 h-4 text-cm-text" />
            </button>
            <h1 className="text-[16px] font-bold text-cm-text">Créer un devis</h1>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Mission info */}
        {missionJob && (
          <div className="cm-card p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[13px] font-bold text-cm-text">{missionJob.serviceName}</p>
              <span className="text-[11px] font-semibold text-cm-text-soft">{missionJob.clientName}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-cm-text-muted">
              <MapPin className="w-3 h-3 text-cm-accent" />
              <span className="truncate">{missionJob.clientLocation}</span>
            </div>
            {(missionJob.scheduledDate || missionJob.scheduledTime) && (
              <div className="flex items-center gap-2 text-[11px] text-cm-text-muted mt-1">
                <CalendarDays className="w-3 h-3 text-cm-accent" />
                <span>{missionJob.scheduledDate ? new Date(missionJob.scheduledDate).toLocaleDateString("fr-FR") : ""}{missionJob.scheduledTime ? ` · ${missionJob.scheduledTime}` : ""}</span>
              </div>
            )}
          </div>
        )}

        {/* Dates */}
        <div>
          <p className="text-[13px] font-semibold text-cm-text mb-2">Dates prévues</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-cm-text-muted mb-1 block">Début</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-10 px-3 text-[13px] bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text" />
            </div>
            <div>
              <label className="text-[11px] text-cm-text-muted mb-1 block">Fin estimée</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-10 px-3 text-[13px] bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text" />
            </div>
          </div>
        </div>

        {/* Durée */}
        <div>
          <p className="text-[13px] font-semibold text-cm-text mb-2">Durée estimée</p>
          <div className="flex items-center gap-2">
            <input type="number" min={0} value={estimatedDurationMins} onChange={(e) => setEstimatedDurationMins(Number(e.target.value))}
              className="w-24 h-10 px-3 text-[13px] bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text" />
            <span className="text-[12px] text-cm-text-muted">minutes</span>
          </div>
        </div>

        {/* Déplacement */}
        <div>
          <p className="text-[13px] font-semibold text-cm-text mb-2">Déplacement</p>
          <div className="grid grid-cols-3 gap-2">
            {TRAVEL_TIERS.map((tier) => {
              const active = travelTier === tier.id;
              return (
                <button key={tier.id} onClick={() => selectTravelTier(tier.id)}
                  className={`rounded-[12px] p-2.5 text-center border-2 transition-all cursor-pointer active:scale-[0.98] ${
                    active ? "border-cm-accent bg-cm-accent-soft" : "border-cm-border bg-cm-elevated"
                  }`}>
                  <p className={`text-[11px] font-bold ${active ? "text-cm-accent" : "text-cm-text"}`}>{tier.label}</p>
                  <p className="text-[12px] font-bold text-cm-text font-mono mt-0.5">{tier.amountXOF.toLocaleString("fr-FR")} F</p>
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-cm-text-muted mt-2">
            Supplément de 500 F si vous récupérez la marchandise en quincaillerie
          </p>
        </div>

        {/* Ligne de devis */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-semibold text-cm-text">Détail des coûts</p>
            <div className="flex gap-1">
              <button onClick={() => addLineItem("labor")}
                className="text-[11px] px-2.5 py-1 rounded-full bg-cm-accent-soft text-cm-accent font-medium cursor-pointer">+ Main-d'œuvre</button>
              <button onClick={() => addLineItem("other")}
                className="text-[11px] px-2.5 py-1 rounded-full bg-cm-accent-soft text-cm-accent font-medium cursor-pointer">+ Autre</button>
            </div>
          </div>

          <button onClick={() => setShowPicker(true)}
            className="w-full h-11 mb-3 rounded-[14px] border-2 border-dashed border-cm-accent/40 text-cm-accent text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] transition-transform hover:bg-cm-accent/5">
            <Package className="w-4 h-4" /> Ajouter un matériau (quincaillerie)
          </button>

          <div className="space-y-2">
            {lineItems.map((li) => (
              <div key={li.id} className="cm-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase ${TYPE_CHIP[li.type]}`}>
                    {TYPE_LABELS[li.type]}
                  </span>
                  {li.productId && li.source === "marketplace" && (
                    <span className="text-[9px] text-cm-text-muted flex items-center gap-1">
                      <ShoppingCart className="w-2.5 h-2.5" /> Quincaillerie
                    </span>
                  )}
                  {lineItems.length > 1 && (
                    <button onClick={() => removeLineItem(li.id)} className="text-cm-text-muted cursor-pointer ml-auto">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-3">
                    <input type="text" value={li.label} onChange={(e) => updateLineItem(li.id, "label", e.target.value)}
                      className="w-full h-9 px-2.5 text-[12px] bg-cm-border-soft border border-cm-border rounded-[8px] outline-none text-cm-text"
                      placeholder="Libellé" />
                  </div>
                  <div>
                    <label className="text-[10px] text-cm-text-muted">Qté</label>
                    <input type="number" min={1} value={li.quantity} onChange={(e) => updateLineItem(li.id, "quantity", Number(e.target.value))}
                      className="w-full h-9 px-2.5 text-[12px] bg-cm-border-soft border border-cm-border rounded-[8px] outline-none text-cm-text" />
                  </div>
                  <div>
                    <label className="text-[10px] text-cm-text-muted">Prix unitaire (F)</label>
                    <input type="number" min={0} value={li.unitPriceXOF} onChange={(e) => updateLineItem(li.id, "unitPriceXOF", Number(e.target.value))}
                      className="w-full h-9 px-2.5 text-[12px] bg-cm-border-soft border border-cm-border rounded-[8px] outline-none text-cm-text" />
                  </div>
                  <div>
                    <label className="text-[10px] text-cm-text-muted">Total</label>
                    <div className="h-9 flex items-center text-[13px] font-semibold text-cm-text">
                      {li.totalXOF.toLocaleString("fr-FR")} F
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Garantie & Conditions */}
        <div>
          <p className="text-[13px] font-semibold text-cm-text mb-2">Garantie</p>
          <textarea value={warranty} onChange={(e) => setWarranty(e.target.value)}
            className="w-full h-16 px-3 py-2 text-[12px] bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text resize-none"
            placeholder="Garanties proposées..." />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-cm-text mb-2">Conditions particulières</p>
          <textarea value={conditions} onChange={(e) => setConditions(e.target.value)}
            className="w-full h-16 px-3 py-2 text-[12px] bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text resize-none"
            placeholder="Conditions..." />
        </div>

        {/* Validité */}
        <div>
          <p className="text-[13px] font-semibold text-cm-text mb-2">Valable jusqu'au</p>
          <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)}
            className="w-full h-10 px-3 text-[13px] bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text" />
        </div>

        {/* Notes */}
        <div>
          <p className="text-[13px] font-semibold text-cm-text mb-2">Notes</p>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            className="w-full h-24 px-3 py-2 text-[12px] bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text resize-none"
            placeholder="Informations complémentaires..." />
        </div>

        {/* Récapitulatif */}
        <div className="cm-card p-4 space-y-3">
          <p className="text-[13px] font-bold text-cm-text">Récapitulatif</p>
          <CommissionBreakdown subtotalXOF={subtotalXOF} percent={commissionPercent} />
          <div className="flex items-center justify-between pt-2 border-t border-cm-border">
            <span className="text-[12px] text-cm-text-soft">Total TTC (payé par le client)</span>
            <span className="text-[18px] font-bold text-cm-text font-mono">{formatXOF(subtotalXOF)}</span>
          </div>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit}
          className="w-full h-12 bg-cm-accent rounded-[14px] text-[14px] font-bold text-cm-text-onAccent flex items-center justify-center gap-2 cm-scale-btn hover:bg-cm-accent-hover cursor-pointer">
          <Send className="w-4 h-4" />
          Envoyer le devis
        </button>
      </div>

      {/* Picker quincaillerie */}
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center"
            onClick={() => { setShowPicker(false); setPickerQty({}); }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[448px] bg-cm-elevated rounded-t-[var(--radius-cm-xl)] sm:rounded-[var(--radius-cm-xl)] pb-6 flex flex-col max-h-[85vh]"
            >
              <div className="px-5 pt-4 pb-3 border-b border-cm-border/40">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-[16px] font-bold text-cm-text">Matériaux — Quincailleries</h3>
                    <p className="text-[11px] text-cm-text-muted mt-0.5">Choisissez des produits et ajoutez-les au devis</p>
                  </div>
                  <button onClick={() => { setShowPicker(false); setPickerQty({}); }} className="p-1 cursor-pointer">
                    <X className="w-5 h-5 text-cm-text-muted" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-cm-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher un matériau (ciment, fil, peinture...)"
                    className="w-full h-11 pl-9 pr-3 text-[13px] bg-cm-surface border border-cm-border rounded-[12px] outline-none text-cm-text placeholder:text-cm-text-muted"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 pt-3 space-y-1.5">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-10">
                    <Package className="w-10 h-10 text-cm-border-soft mx-auto mb-2" />
                    <p className="text-[13px] text-cm-text-muted">Aucun matériau trouvé</p>
                    <p className="text-[11px] text-cm-text-muted mt-1">Essayez un autre mot-clé</p>
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const qty = pickerQty[product.id] ?? 0;
                    const alreadyAdded = existingProductIds.has(product.id);
                    return (
                      <div key={product.id} className="flex items-center gap-3 p-2.5 rounded-[14px] bg-cm-surface">
                        {product.images?.[0] && (
                          <img src={product.images[0]} alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-cm-text truncate">{product.name}</p>
                          <p className="text-[10px] text-cm-text-muted truncate">
                            {product.brand}
                            {product.unit ? ` · ${UNIT_LABELS[product.unit] ?? product.unit}` : ""}
                            {typeof product.stock === "number" ? ` · Stock: ${product.stock}` : ""}
                          </p>
                          <p className="text-[12px] font-bold text-cm-text-soft mt-0.5">{formatXOF(productPrice(product))}</p>
                        </div>
                        {alreadyAdded && qty === 0 ? (
                          <span className="text-[10px] font-semibold text-cm-accent shrink-0 px-2">Ajouté ✓</span>
                        ) : (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button onClick={() => changePickerQty(product.id, -1)}
                              className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                                qty > 0 ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-cm-border-soft text-cm-border-soft cursor-not-allowed"
                              }`}>
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-[13px] font-bold text-cm-text">{qty}</span>
                            <button onClick={() => changePickerQty(product.id, 1)}
                              disabled={typeof product.stock === "number" && qty >= product.stock}
                              className="w-7 h-7 rounded-full bg-cm-green/10 text-cm-green flex items-center justify-center hover:bg-cm-green/20 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {pickerSubtotal > 0 && (
                <div className="px-5 pt-3 border-t border-cm-border/40">
                  <div className="flex justify-between text-[12px] mb-2">
                    <span className="text-cm-text-muted">Sous-total matériaux</span>
                    <span className="font-semibold text-cm-text">{formatXOF(pickerSubtotal)}</span>
                  </div>
                  <button onClick={addMaterialsToQuote}
                    className="w-full h-11 bg-cm-accent text-white text-[13px] font-bold rounded-xl hover:opacity-90 cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    <Wrench className="w-4 h-4" />
                    Ajouter au devis
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
