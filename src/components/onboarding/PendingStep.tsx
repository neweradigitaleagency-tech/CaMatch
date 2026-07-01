import { motion } from "motion/react";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import type { ProApplicationStatus } from "../../types";

interface PendingStepProps {
  status: ProApplicationStatus;
  reviewNotes?: string | null;
}

export default function PendingStep({ status, reviewNotes }: PendingStepProps) {
  if (status === "APPROVED") {
    return (
      <div className="flex flex-col items-center pt-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6"
        >
          <CheckCircle className="w-10 h-10 text-green-600" />
        </motion.div>
        <h2 className="text-[22px] font-extrabold text-cm-text text-center">Félicitations !</h2>
        <p className="text-[14px] text-cm-text-soft text-center mt-2 max-w-xs">
          Votre profil professionnel a été approuvé. Vous pouvez maintenant recevoir des missions.
        </p>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="flex flex-col items-center pt-8">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-[22px] font-extrabold text-cm-text text-center">Candidature non retenue</h2>
        {reviewNotes && (
          <p className="text-[13px] text-cm-text-soft text-center mt-2 max-w-xs">
            {reviewNotes}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center pt-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        className="w-20 h-20 rounded-full bg-cm-accent-soft flex items-center justify-center mb-6"
      >
        <Clock className="w-10 h-10 text-cm-accent" />
      </motion.div>
      <h2 className="text-[22px] font-extrabold text-cm-text text-center">En cours de vérification</h2>
      <p className="text-[14px] text-cm-text-soft text-center mt-2 max-w-xs">
        Votre candidature est en cours d'examen par notre équipe. Vous recevrez une notification sous 24-48h.
      </p>

      <div className="w-full mt-6 space-y-3">
        {[
          { label: "Vérification des documents", done: true },
          { label: "Validation de l'identité", done: true },
          { label: "Examen du profil", done: false },
          { label: "Approbation finale", done: false },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-cm-elevated border border-cm-border rounded-[12px]">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              step.done ? "bg-cm-accent" : "bg-cm-border-soft"
            }`}>
              {step.done ? (
                <CheckCircle className="w-3.5 h-3.5 text-white" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-cm-text-muted" />
              )}
            </div>
            <span className={`text-[13px] font-medium ${step.done ? "text-cm-text" : "text-cm-text-muted"}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
