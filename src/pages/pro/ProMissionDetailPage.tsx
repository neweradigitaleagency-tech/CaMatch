import { useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, MapPin, Calendar, Clock, Phone, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { MOCK_PRO_JOBS } from "../../services/mockData";
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
  closed: "bg-gray-900/15 text-gray-900",
  cancelled: "bg-red-500/15 text-red-600",
};

export default function ProMissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const job = MOCK_PRO_JOBS.find((j) => j.id === id);

  if (!job) {
    return (
      <div className="min-h-dynamic bg-cm-bg flex items-center justify-center">
        <p className="text-sm text-cm-text-muted">Mission introuvable</p>
      </div>
    );
  }

  const currentStepIndex = STEP_ORDER.indexOf(job.status as ProJobStatus);
  const isCancelled = job.status === "cancelled";

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={() => nav(-1)} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
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
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[job.status] || "bg-gray-500/15 text-gray-600"}`}>
              {STEP_LABELS[job.status] || job.status}
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
              <p className="text-[18px] font-bold text-cm-accent font-mono">{job.totalFeeXOF.toLocaleString("fr-FR")} FCFA</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-medium text-cm-text">{job.clientName}</p>
              <p className="text-[11px] text-cm-text-muted">{job.clientPhone}</p>
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
                          done ? "bg-cm-accent text-white" : "bg-cm-border text-cm-text-muted"
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
          {job.status === "pending" && (
            <>
              <button className="flex-1 px-4 py-2.5 bg-green-500 text-white text-[12px] font-semibold rounded-full cursor-pointer active:scale-[0.97]">
                Accepter
              </button>
              <button className="flex-1 px-4 py-2.5 bg-red-500/15 text-red-600 text-[12px] font-semibold rounded-full cursor-pointer active:scale-[0.97]">
                Refuser
              </button>
            </>
          )}
          {job.status !== "completed" && job.status !== "client_validation" && job.status !== "closed" && job.status !== "cancelled" && (
            <button className="flex-1 px-4 py-2.5 bg-cm-accent text-white text-[12px] font-semibold rounded-full cursor-pointer active:scale-[0.97]">
              {job.status === "in_progress" ? "Terminer" : "Contacter"}
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
    </div>
  );
}
