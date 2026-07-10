import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { Check, Crown, Star, Sparkles, ArrowRight, Shield, Zap, Headphones } from "lucide-react";

const FEATURE_MAP: Record<string, { icon: typeof Star; label: string }[]> = {
  client: [
    { icon: Zap, label: "Matching IA prioritaire" },
    { icon: Star, label: "Professionnels vérifiés en priorité" },
    { icon: Headphones, label: "Support prioritaire 24/7" },
    { icon: Shield, label: "Frais de service réduits" },
  ],
  pro: [
    { icon: Zap, label: "Visibilité augmentée dans les recherches" },
    { icon: Star, label: "Badge Premium sur votre profil" },
    { icon: Headphones, label: "Leads exclusifs et prioritaires" },
    { icon: Shield, label: "Analytics et statistiques avancées" },
  ],
};

export default function SubscriptionSuccessPage() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const type = ((params.get("type") as "client" | "pro") ?? "client");
  const planName = params.get("plan") || "Premium";
  const features = (FEATURE_MAP[type] ?? FEATURE_MAP.client)!;
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(t);
  }, []);

  const homeRoute = type === "pro" ? "/pro/dashboard" : "/";

  return (
    <div className="min-h-dynamic bg-cm-bg flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-6 max-w-sm mx-auto w-full">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-500/30"
        >
          <Check className="w-10 h-10 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[22px] font-extrabold text-cm-text text-center"
        >
          Abonnement {planName} activé !
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-[13px] text-cm-text-soft text-center mt-2 mb-8"
        >
          Vos nouvelles fonctionnalités sont prêtes.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: show ? 1 : 0, y: show ? 0 : 16 }}
          transition={{ delay: 0.5 }}
          className="bg-cm-elevated border border-cm-border rounded-[20px] p-5 space-y-4 mb-8"
        >
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-cm-accent-soft flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-cm-accent" />
                </div>
                <span className="text-[13px] font-medium text-cm-text">{feat.label}</span>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="space-y-3"
        >
          <button
            onClick={() => nav(type === "pro" ? "/pro/subscription" : "/settings/subscription")}
            className="w-full h-12 bg-cm-accent text-cm-text-onAccent font-bold text-sm rounded-xl hover:brightness-105 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            Gérer mon abonnement <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => nav(homeRoute)}
            className="w-full h-10 text-xs text-cm-text-soft hover:text-cm-text transition-colors cursor-pointer"
          >
            {type === "pro" ? "Retour au tableau de bord" : "Accueil"}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
