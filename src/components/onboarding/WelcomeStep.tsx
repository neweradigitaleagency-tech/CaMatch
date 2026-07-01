import { Award, Shield, Zap, Users } from "lucide-react";
import { motion } from "motion/react";

interface WelcomeStepProps {
  onStart: () => void;
}

export default function WelcomeStep({ onStart }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center pt-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-cm-accent to-gray-900 flex items-center justify-center mb-6 shadow-lg"
      >
        <Award className="w-10 h-10 text-white" />
      </motion.div>

      <h1 className="text-[26px] font-extrabold text-cm-text text-center mb-2">
        Devenir Professionnel
      </h1>
      <p className="text-[14px] text-cm-text-soft text-center mb-8 max-w-xs">
        Rejoignez ÇaMatch et développez votre activité. Des milliers de clients vous attendent.
      </p>

      <div className="w-full space-y-3 mb-8">
        {[
          { icon: Zap, title: "Gagnez plus", desc: "Fixez vos tarifs et travaillez quand vous voulez" },
          { icon: Users, title: "Nouveaux clients", desc: "Accédez à des milliers de clients près de chez vous" },
          { icon: Shield, title: "Paiement sécurisé", desc: "Soyez payé à chaque mission via notre système" },
          { icon: Award, title: "Visibilité", desc: "Mettez en avant votre profil et vos réalisations" },
        ].map((item) => (
          <div key={item.title} className="flex items-center gap-3 p-3.5 bg-cm-elevated border border-cm-border rounded-[14px]">
            <div className="w-10 h-10 rounded-[12px] bg-cm-accent-soft flex items-center justify-center shrink-0">
              <item.icon className="w-5 h-5 text-cm-accent" />
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-cm-text">{item.title}</h3>
              <p className="text-[11px] text-cm-text-muted">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button onClick={onStart}
        className="w-full h-12 bg-cm-accent rounded-[16px] text-[15px] font-bold text-white cursor-pointer hover:opacity-90 active:scale-[0.97] transition-all shadow-lg">
        Commencer
      </button>

      <p className="text-[11px] text-cm-text-muted text-center mt-4">
        Inscription gratuite · Pas d'abonnement obligatoire
      </p>
    </div>
  );
}
