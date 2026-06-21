import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Crown, Star, Sparkles } from "lucide-react";

const PLANS = [
  {
    name: "Gratuit",
    price: 0,
    period: "/mois",
    features: ["3 missions max/mois", "Commission 15%", "Support standard", "Profil basique"],
    color: "bg-gray-100",
    textColor: "text-gray-600",
    icon: Star,
  },
  {
    name: "Pro",
    price: 5000,
    period: "/mois",
    features: ["Missions illimitées", "Commission 10%", "Support prioritaire", "Badge vérifié", "Statistiques avancées"],
    color: "bg-cm-green/10",
    textColor: "text-cm-green",
    icon: Sparkles,
    popular: true,
  },
  {
    name: "Elite",
    price: 15000,
    period: "/mois",
    features: ["Tout du plan Pro", "Commission 7%", "Support VIP 24/7", "Mise en avant dans les recherches", "Paiement instantané", "Badge Élite"],
    color: "bg-amber-50",
    textColor: "text-amber-600",
    icon: Crown,
  },
];

export default function ProSubscriptionPage() {
  const nav = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream pb-32">
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <button onClick={() => nav("/profile")} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white border border-pale-mint/10 cursor-pointer">
          <ArrowLeft className="w-4 h-4 text-secondary" />
        </button>
        <h1 className="text-lg font-extrabold">Abonnement</h1>
      </div>

      <div className="px-4 mt-2 space-y-3">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl border ${plan.popular ? "border-cm-green" : "border-pale-mint/10"} p-4`}
            >
              {plan.popular && (
                <div className="absolute -top-2.5 right-4 bg-cm-green text-white text-2xs font-bold px-3 py-0.5 rounded-full">
                  Populaire
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${plan.color} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${plan.textColor}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-forest">{plan.name}</p>
                  <p className="text-lg font-extrabold text-brand-forest">{plan.price.toLocaleString()} F<span className="text-xs font-medium text-secondary/60">{plan.period}</span></p>
                </div>
              </div>
              <ul className="space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-2xs text-secondary/70">
                    <Check className="w-3 h-3 text-cm-green shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => {}}
                className={`w-full mt-3 h-10 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  plan.price === 0
                    ? "bg-pale-mint/30 text-secondary/60 border border-pale-mint/10"
                    : "bg-cm-green text-white"
                }`}
              >
                {plan.price === 0 ? "Plan actuel" : "S'abonner"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
