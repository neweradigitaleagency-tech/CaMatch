import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import { motion } from "motion/react";
import { ArrowLeft, Check, X, Minus, Sparkles, Crown, Star } from "lucide-react";

type Tab = "client" | "pro";

interface FeatureRow {
  name: string;
  values: (string | boolean | number)[];
}

const CLIENT_PLANS = ["Free", "Plus", "Premium"];
const PRO_PLANS = ["Free", "Starter", "Business", "Premium"];

const CLIENT_FEATURES: FeatureRow[] = [
  { name: "Recherche de pros", values: [true, true, true] },
  { name: "Matching IA", values: [false, true, true] },
  { name: "Mise en relation prioritaire", values: [false, false, true] },
  { name: "Demandes simultanées", values: [3, 10, "Illimité"] },
  { name: "Badge premium client", values: [false, false, true] },
  { name: "Support prioritaire 24/7", values: [false, true, true] },
  { name: "Frais de service", values: ["10%", "5%", "0%"] },
  { name: "Photos avant/après", values: [true, true, true] },
  { name: "Géolocalisation", values: [true, true, true] },
];

const PRO_FEATURES: FeatureRow[] = [
  { name: "Profil visible", values: [true, true, true, true] },
  { name: "Badge vérifié", values: [false, true, true, true] },
  { name: "Mise en avant recherche", values: [false, false, true, true] },
  { name: "Top des résultats", values: [false, false, false, true] },
  { name: "Analytics avancés", values: [false, false, true, true] },
  { name: "Leads exclusifs", values: [false, true, true, true] },
  { name: "Commission par mission", values: ["15%", "10%", "5%", "0%"] },
  { name: "Boost crédits offerts", values: [0, 0, 3, 10] },
  { name: "Support prioritaire", values: [false, false, true, true] },
  { name: "Assistant dédié", values: [false, false, false, true] },
];

const CLIENT_PRICES = [0, 4900, 14900];
const PRO_PRICES = [0, 9900, 24900, 49900];

export default function SubscriptionComparePage() {
  const nav = useNavigate();
  const goBack = useBackNavigation("/pro");
  const [tab, setTab] = useState<Tab>("client");

  const plans = tab === "client" ? CLIENT_PLANS : PRO_PLANS;
  const features = tab === "client" ? CLIENT_FEATURES : PRO_FEATURES;
  const prices = tab === "client" ? CLIENT_PRICES : PRO_PRICES;

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={goBack} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Comparer les formules</h1>
        </div>
      </div>

      <div className="w-full max-w-[500px] mx-auto px-4 pt-4 pb-24">
        <div className="flex rounded-xl bg-cm-accent-soft/50 p-1 mb-5">
          <button
            onClick={() => setTab("client")}
            className={`flex-1 h-10 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === "client" ? "bg-white shadow-sm text-cm-accent" : "text-cm-text-soft hover:text-cm-text"
            }`}
          >
            Client
          </button>
          <button
            onClick={() => setTab("pro")}
            className={`flex-1 h-10 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === "pro" ? "bg-white shadow-sm text-cm-accent" : "text-cm-text-soft hover:text-cm-text"
            }`}
          >
            Professionnel
          </button>
        </div>

        <div className="overflow-x-auto md:overflow-x-hidden">
          <table className="w-full min-w-[400px] md:min-w-0 border-collapse">
            <thead>
              <tr>
                <th className="text-left pb-3 pr-4" />
                {plans.map((name, i) => { const price = prices[i]!; return (
                  <th key={name} className="text-center pb-3 px-2 first:pl-0 last:pr-0">
                    <div className={`rounded-[14px] p-3 ${
                      i === plans.length - 1 ? "bg-amber-50 border border-amber-200" : ""
                    }`}>
                      {i === plans.length - 1 ? (
                        <Crown className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                      ) : i === plans.length - 2 && tab === "client" ? (
                        <Sparkles className="w-4 h-4 text-cm-accent mx-auto mb-1" />
                      ) : (
                        <Star className="w-4 h-4 text-cm-text-muted mx-auto mb-1" />
                      )}
                      <p className="text-[13px] font-bold text-cm-text">{name}</p>
                      <p className="text-[15px] font-extrabold text-cm-text mt-1">
                        {price === 0 ? "Gratuit" : `${price.toLocaleString("fr-FR")} F`}
                      </p>
                      {price > 0 && (
                        <p className="text-[9px] text-cm-text-soft">/mois</p>
                      )}
                    </div>
                  </th>
                ); })}
              </tr>
            </thead>
            <tbody>
              {features.map((row, _ri) => (
                <tr key={row.name} className="border-t border-cm-border">
                  <td className="py-3 pr-4 text-[12px] font-medium text-cm-text">{row.name}</td>
                  {row.values.map((val, i) => (
                    <td key={i} className="text-center py-3 px-2">
                      {typeof val === "boolean" ? (
                        val ? (
                          <div className="w-6 h-6 rounded-full bg-cm-accent/10 flex items-center justify-center mx-auto">
                            <Check className="w-3.5 h-3.5 text-cm-accent" />
                          </div>
                        ) : (
                          <X className="w-4 h-4 text-cm-text-muted mx-auto" />
                        )
                      ) : val === 0 ? (
                        <Minus className="w-4 h-4 text-cm-text-muted mx-auto" />
                      ) : typeof val === "number" ? (
                        <span className="text-[12px] font-semibold text-cm-text">{val}</span>
                      ) : (
                        <span className="text-[12px] font-semibold text-cm-text">{val}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-center"
        >
          <button
            onClick={() => nav("/subscription/plans")}
            className="h-12 px-8 bg-cm-accent text-cm-text-onAccent text-[13px] font-bold rounded-xl hover:brightness-105 transition-all active:scale-[0.97] cursor-pointer shadow-sm"
          >
            Choisir une formule
          </button>
        </motion.div>
      </div>
    </div>
  );
}
