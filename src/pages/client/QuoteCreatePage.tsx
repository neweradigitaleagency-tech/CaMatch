import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Send } from "lucide-react";
import type { QuoteLineItem } from "../../types";
import { useQuoteStore } from "../../stores/quoteStore";
import { useAuthStore } from "../../stores/authStore";
import { MOCK_PROS } from "../../services/mockData";

const defaultLineItem = (type: QuoteLineItem["type"]): QuoteLineItem => ({
  id: `li_${Date.now()}`,
  label: type === "labor" ? "Main-d'œuvre" : type === "material" ? "Matériaux" : type === "travel" ? "Déplacement" : "Autre",
  quantity: 1,
  unitPriceXOF: 0,
  totalXOF: 0,
  type,
});

export default function QuoteCreatePage() {
  const nav = useNavigate();
  const { requestId } = useParams<{ requestId: string }>();
  const createQuote = useQuoteStore((s) => s.createQuote);

  const [lineItems, setLineItems] = useState<QuoteLineItem[]>([defaultLineItem("labor"), defaultLineItem("material"), defaultLineItem("travel")]);
  const [estimatedDurationMins, setEstimatedDurationMins] = useState(60);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [materialsIncluded, setMaterialsIncluded] = useState("");
  const [materialsNotIncluded, setMaterialsNotIncluded] = useState("");
  const [materialsByClient, setMaterialsByClient] = useState("");
  const [warranty, setWarranty] = useState("");
  const [conditions, setConditions] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");

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
    setLineItems((prev) => prev.filter((li) => li.id !== id));
  };

  const totalXOF = lineItems.reduce((sum, li) => sum + li.totalXOF, 0);

  const handleSubmit = () => {
    if (!requestId) return;
    const userId = useAuthStore.getState().userId;
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
      materialsIncluded,
      materialsNotIncluded,
      materialsByClient,
      warranty,
      conditions,
      validUntil,
      notes,
      attachments: [],
    });
    nav("/orders");
  };

  return (
    <div className="min-h-screen bg-cm-bg pb-24">
      <div className="sticky top-0 z-10 bg-cm-bg/80 backdrop-blur-xl border-b border-cm-border/40">
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => nav(-1)}
              className="cm-scale-btn w-8 h-8 flex items-center justify-center rounded-[12px] bg-cm-elevated hover:bg-cm-border/50 cursor-pointer shrink-0">
              <ArrowLeft className="w-4 h-4 text-cm-text" />
            </button>
            <h1 className="text-[16px] font-bold text-cm-text">Créer un devis</h1>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5">
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
            <input type="number" value={estimatedDurationMins} onChange={(e) => setEstimatedDurationMins(Number(e.target.value))}
              className="w-24 h-10 px-3 text-[13px] bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text" />
            <span className="text-[12px] text-cm-text-muted">minutes</span>
          </div>
        </div>

        {/* Ligne de devis */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-semibold text-cm-text">Détail des coûts</p>
            <div className="flex gap-1">
              <button onClick={() => addLineItem("labor")}
                className="text-[11px] px-2.5 py-1 rounded-full bg-cm-accent-soft text-cm-accent font-medium cursor-pointer">+ Main-d'œuvre</button>
              <button onClick={() => addLineItem("material")}
                className="text-[11px] px-2.5 py-1 rounded-full bg-cm-accent-soft text-cm-accent font-medium cursor-pointer">+ Matériaux</button>
              <button onClick={() => addLineItem("travel")}
                className="text-[11px] px-2.5 py-1 rounded-full bg-cm-accent-soft text-cm-accent font-medium cursor-pointer">+ Déplacement</button>
            </div>
          </div>
          <div className="space-y-2">
            {lineItems.map((li, i) => (
              <div key={li.id} className="cm-card p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-medium text-cm-text-muted uppercase">
                    {li.type === "labor" ? "Main-d'œuvre" : li.type === "material" ? "Matériaux" : li.type === "travel" ? "Déplacement" : "Autre"}
                  </span>
                  {lineItems.length > 1 && (
                    <button onClick={() => removeLineItem(li.id)} className="text-cm-text-muted cursor-pointer">
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
          <div className="flex justify-end mt-3 pt-3 border-t border-cm-border">
            <div className="text-right">
              <span className="text-[11px] text-cm-text-muted">Total TTC</span>
              <p className="text-[20px] font-bold text-cm-text">{totalXOF.toLocaleString("fr-FR")} F</p>
            </div>
          </div>
        </div>

        {/* Matériaux */}
        <div>
          <p className="text-[13px] font-semibold text-cm-text mb-2">Matériaux</p>
          <div className="space-y-2">
            <div>
              <label className="text-[11px] text-cm-text-muted mb-1 block">Inclus dans le devis</label>
              <textarea value={materialsIncluded} onChange={(e) => setMaterialsIncluded(e.target.value)}
                className="w-full h-16 px-3 py-2 text-[12px] bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text resize-none" />
            </div>
            <div>
              <label className="text-[11px] text-cm-text-muted mb-1 block">Non inclus</label>
              <textarea value={materialsNotIncluded} onChange={(e) => setMaterialsNotIncluded(e.target.value)}
                className="w-full h-16 px-3 py-2 text-[12px] bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text resize-none" />
            </div>
            <div>
              <label className="text-[11px] text-cm-text-muted mb-1 block">À fournir par le client</label>
              <textarea value={materialsByClient} onChange={(e) => setMaterialsByClient(e.target.value)}
                className="w-full h-16 px-3 py-2 text-[12px] bg-cm-elevated border border-cm-border rounded-[12px] outline-none text-cm-text resize-none" />
            </div>
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

        {/* Submit */}
        <button onClick={handleSubmit}
          className="w-full h-12 bg-cm-accent rounded-[14px] text-[14px] font-bold text-white flex items-center justify-center gap-2 cm-scale-btn hover:bg-cm-accent-hover cursor-pointer">
          <Send className="w-4 h-4" />
          Envoyer le devis
        </button>
      </div>
    </div>
  );
}
