import { motion } from "motion/react"
import { usePublishListingStore, UNIT_OPTIONS, UNIT_LABELS } from "../../../stores/publishListingStore"

export default function PublishStepPrice() {
  const { draft, setField } = usePublishListingStore()
  const isProSupply = draft.vertical === "pro_supply"
  const isRealEstate = draft.vertical === "real_estate"

  const priceNum = parseFloat(draft.price.replace(/\s/g, ""))
  const originalNum = parseFloat(draft.originalPrice.replace(/\s/g, ""))

  const handleNumeric = (field: "price" | "originalPrice" | "stock", value: string) => {
    const clean = value.replace(/[^0-9]/g, "")
    setField(field, clean)
  }

  const displayPrice = draft.price === "" ? "" : Number(draft.price).toLocaleString("fr-FR")

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-cm-text">Prix et quantité</h2>
        <p className="text-sm text-cm-text-muted mt-1">La commission Ça Match de 10 % s'applique à la vente</p>
      </div>

      <div>
        <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">
          {isRealEstate ? "Prix du bien" : "Prix de vente"}
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              inputMode="numeric"
              value={displayPrice}
              onChange={(e) => handleNumeric("price", e.target.value)}
              className="w-full h-14 px-4 rounded-xl bg-cm-elevated border border-cm-border-soft text-lg font-bold text-cm-text outline-none focus:border-cm-text transition-colors placeholder:text-cm-border-soft placeholder:font-normal placeholder:text-sm"
              placeholder="Ex: 4500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-cm-text-muted">FCFA</span>
          </div>
        </div>
        {priceNum > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[11px] text-cm-text-muted mt-1.5"
          >
            Vous recevrez ≈ {Math.round(priceNum * 0.9).toLocaleString("fr-FR")} FCFA après commission
          </motion.p>
        )}
      </div>

      {!isRealEstate && (
        <div>
          <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">
            Prix d'origine (optionnel — pour afficher une remise)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={draft.originalPrice === "" ? "" : Number(draft.originalPrice).toLocaleString("fr-FR")}
              onChange={(e) => handleNumeric("originalPrice", e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-cm-elevated border border-cm-border-soft text-sm font-semibold text-cm-text outline-none focus:border-cm-text transition-colors placeholder:text-cm-border-soft placeholder:font-normal"
              placeholder="Ex: 6000"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-cm-text-muted">FCFA</span>
          </div>
          {priceNum > 0 && originalNum > priceNum && (
            <p className="text-[11px] text-cm-green font-semibold mt-1.5">
              Remise de {Math.round(((originalNum - priceNum) / originalNum) * 100)} % affichée
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {isProSupply ? (
          <div>
            <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">
              Unité de vente
            </label>
            <select
              value={draft.unit}
              onChange={(e) => setField("unit", e.target.value)}
              className="w-full h-12 px-3 rounded-xl bg-cm-elevated border border-cm-border-soft text-sm text-cm-text outline-none focus:border-cm-text transition-colors appearance-none"
            >
              <option value="">Choisir</option>
              {UNIT_OPTIONS.map((u) => (
                <option key={u} value={u}>{UNIT_LABELS[u]}</option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">
              Stock disponible
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={draft.stock}
              onChange={(e) => handleNumeric("stock", e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-cm-elevated border border-cm-border-soft text-sm text-cm-text outline-none focus:border-cm-text transition-colors placeholder:text-cm-border-soft"
              placeholder="1"
            />
          </div>
        )}

        {isProSupply ? (
          <div>
            <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">
              Stock en stock
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={draft.stock}
              onChange={(e) => handleNumeric("stock", e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-cm-elevated border border-cm-border-soft text-sm text-cm-text outline-none focus:border-cm-text transition-colors placeholder:text-cm-border-soft"
              placeholder="Ex: 40"
            />
          </div>
        ) : (
          !isRealEstate && (
            <div>
              <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">
                {draft.stock === "" || parseInt(draft.stock) <= 1 ? "Quantité" : "Quantité(s)"}
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={draft.stock}
                onChange={(e) => handleNumeric("stock", e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-cm-elevated border border-cm-border-soft text-sm text-cm-text outline-none focus:border-cm-text transition-colors placeholder:text-cm-border-soft"
                placeholder="Ex: 2"
              />
            </div>
          )
        )}
      </div>

      {isRealEstate && (
        <div>
          <label className="text-xs font-semibold text-cm-text-muted uppercase tracking-wider mb-1.5 block">
            Stock disponible
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={draft.stock}
            onChange={(e) => handleNumeric("stock", e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-cm-elevated border border-cm-border-soft text-sm text-cm-text outline-none focus:border-cm-text transition-colors placeholder:text-cm-border-soft"
            placeholder="Ex: 1"
          />
        </div>
      )}

      <div className="flex items-center justify-between p-4 rounded-xl bg-cm-surface border border-cm-border">
        <div>
          <p className="text-sm font-semibold text-cm-text">Proposé à la location</p>
          <p className="text-[11px] text-cm-text-muted mt-0.5">
            Autorise la location courte ou longue durée
          </p>
        </div>
        <button
          onClick={() => setField("rental", !draft.rental)}
          className={`w-12 h-7 rounded-full transition-colors cursor-pointer shrink-0 ${
            draft.rental ? "bg-cm-forest" : "bg-cm-border-soft"
          }`}
          aria-pressed={draft.rental}
        >
          <span
            className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
              draft.rental ? "translate-x-[26px]" : "translate-x-[4px]"
            }`}
          />
        </button>
      </div>
    </div>
  )
}
