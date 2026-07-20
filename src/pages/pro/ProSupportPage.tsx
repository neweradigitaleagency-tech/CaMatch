import { useNavigate } from "react-router-dom";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import { motion } from "motion/react";
import { ArrowLeft, ChevronDown, MessageCircle, Phone, Send, AlertTriangle, HelpCircle, Clock, MapPin, Coins, UserIcon } from "lucide-react";
import { useState } from "react";
import { useProStore } from "../../stores/proStore";
import { MOCK_PRO_JOBS, MOCK_PRO_ALERTS } from "../../services/mockData";

const FAQS = [
  { id: "f1", q: "Comment modifier mes services ?", r: "Rendez-vous dans la section Services depuis votre tableau de bord. Vous pouvez ajouter, modifier ou désactiver un service." },
  { id: "f2", q: "Quand reçois-je mes paiements ?", r: "Les paiements sont disponibles 24h après la validation de la mission par le client. Vous pouvez retirer vos fonds à tout moment." },
  { id: "f3", q: "Comment contacter un client ?", r: "Utilisez la messagerie intégrée ou appelez directement depuis le détail de la mission." },
  { id: "f4", q: "Que faire en cas de litige ?", r: "Contactez notre support. Nous ouvrirons une médiation dans les plus brefs délais." },
  { id: "f5", q: "Comment être mieux classé ?", r: "Complétez votre profil, répondez rapidement, et accumulez des avis positifs." },
];

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente", accepted: "Acceptée", en_route: "En route",
  arrived: "Arrivé", photos_taken: "Photos prises", in_progress: "En cours",
  completed: "Terminée", client_validation: "Validation client", closed: "Clôturée", cancelled: "Annulée",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "text-blue-600 bg-blue-50", accepted: "text-green-600 bg-green-50",
  en_route: "text-blue-600 bg-blue-50", arrived: "text-purple-600 bg-purple-50",
  photos_taken: "text-orange-600 bg-orange-50", in_progress: "text-amber-600 bg-amber-50",
  completed: "text-green-600 bg-green-50", client_validation: "text-amber-600 bg-amber-50",
  closed: "text-gray-500 bg-gray-100", cancelled: "text-red-500 bg-red-50",
};

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

export default function ProSupportPage() {
  const nav = useNavigate();
  const goBack = useBackNavigation("/pro/dashboard");
  const [openId, setOpenId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [showMissionHelp, setShowMissionHelp] = useState<string | null>(null);

  const storeJobs = useProStore((s) => s.jobs);
  const recentJobs = storeJobs.length > 0 ? storeJobs.slice(0, 3) : MOCK_PRO_JOBS.slice(0, 3);

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={goBack} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Aide & Support</h1>
        </div>
      </div>

      <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24 space-y-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="text-center py-2">
          <h2 className="text-[17px] font-bold text-cm-text">Besoin d'aide ?</h2>
          <p className="text-[12px] text-cm-text-muted mt-1">Sélectionnez une mission pour un support contextualisé</p>
        </motion.div>

        {recentJobs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-cm-elevated border border-cm-border rounded-[14px] overflow-hidden">
            <div className="px-5 pt-3 pb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cm-text-muted" />
              <span className="text-[11px] font-bold text-cm-text-muted uppercase tracking-wider">Dernières missions</span>
            </div>
            {recentJobs.map((job) => {
              const colorClass = STATUS_COLORS[job.status] || "text-gray-500 bg-gray-100";
              return (
                <div key={job.id} className="border-t border-cm-border mx-5 last:border-b last:border-cm-border">
                  <div className="py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                          <UserIcon className="w-3.5 h-3.5 text-gray-600" />
                        </div>
                        <span className="text-[13px] font-bold text-cm-text">{job.clientName}</span>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${colorClass}`}>
                        {STATUS_LABELS[job.status] || job.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-cm-text-muted ml-9 mb-1">{job.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-cm-text-muted ml-9 mb-2">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.clientLocation}</span>
                      <span className="flex items-center gap-1"><Coins className="w-3 h-3" />{job.totalFeeXOF.toLocaleString("fr-FR")} F</span>
                      <span>{getRelativeTime(job.createdAt)}</span>
                    </div>
                    <div className="flex gap-2 ml-9">
                      <button onClick={() => setShowMissionHelp(showMissionHelp === job.id ? null : job.id)}
                        className="flex-1 h-9 rounded-[10px] bg-gray-900 text-white text-[10px] font-bold cursor-pointer active:scale-[0.97] transition-transform flex items-center justify-center gap-1">
                        <HelpCircle className="w-3 h-3" /> Obtenir de l'aide
                      </button>
                      {job.status === "cancelled" && (
                        <button onClick={() => setShowMissionHelp(showMissionHelp === job.id ? null : job.id)}
                          className="h-9 px-3 rounded-[10px] border border-red-200 text-red-500 text-[10px] font-bold cursor-pointer active:scale-[0.97] transition-transform flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Signaler
                        </button>
                      )}
                    </div>
                    {showMissionHelp === job.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        className="ml-9 mt-2 p-3 bg-gray-50 rounded-[10px] text-[11px] text-cm-text-muted leading-relaxed">
                        <p className="font-medium text-cm-text mb-1">Comment pouvons-nous vous aider ?</p>
                        <p>Mission <strong>{job.serviceName}</strong> chez <strong>{job.clientName}</strong></p>
                        <p className="mt-1">Notre équipe connaît déjà les détails de cette mission. Décrivez votre problème ci-dessous ou contactez-nous directement.</p>
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] overflow-hidden">
          <h2 className="text-[13px] font-bold text-cm-text px-5 pt-4 pb-1">Questions fréquentes</h2>
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className="border-t border-cm-border mx-5 last:border-b last:border-cm-border">
                <button onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between py-3 text-left cursor-pointer active:scale-[0.97]">
                  <span className="text-[12px] text-cm-text font-medium pr-2">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-cm-text-muted shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && <p className="text-[11px] text-cm-text-muted pb-3 leading-relaxed">{faq.r}</p>}
              </div>
            );
          })}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-5">
          <h2 className="text-[13px] font-bold text-cm-text mb-3">Nous contacter</h2>
          <div className="space-y-3">
            <input placeholder="Votre nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-11 px-4 text-[13px] bg-cm-bg border border-cm-border rounded-[12px] outline-none text-cm-text placeholder-cm-text-muted" />
            <input placeholder="Votre email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full h-11 px-4 text-[13px] bg-cm-bg border border-cm-border rounded-[12px] outline-none text-cm-text placeholder-cm-text-muted" />
            <textarea placeholder="Votre message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3} className="w-full px-4 py-3 text-[13px] bg-cm-bg border border-cm-border rounded-[12px] outline-none text-cm-text placeholder-cm-text-muted resize-none" />
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cm-accent text-cm-text-onAccent text-[12px] font-semibold rounded-full cursor-pointer active:scale-[0.97]">
              <Send className="w-3.5 h-3.5" /> Envoyer
            </button>
          </div>
        </motion.div>

        <div className="flex flex-col gap-2">
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white text-[13px] font-semibold rounded-[14px] cursor-pointer active:scale-[0.97]">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-cm-elevated border border-cm-border text-cm-text text-[13px] font-semibold rounded-[14px] cursor-pointer active:scale-[0.97]">
            <Phone className="w-4 h-4" /> +225 07 59 66 509
          </button>
        </div>
      </div>
    </div>
  );
}
