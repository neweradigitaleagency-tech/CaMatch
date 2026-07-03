import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, ChevronDown, MessageCircle, Phone, Send } from "lucide-react";
import { useState } from "react";

const FAQS = [
  { id: "f1", q: "Comment modifier mes services ?", r: "Rendez-vous dans la section Services depuis votre tableau de bord. Vous pouvez ajouter, modifier ou désactiver un service." },
  { id: "f2", q: "Quand reçois-je mes paiements ?", r: "Les paiements sont disponibles 24h après la validation de la mission par le client. Vous pouvez retirer vos fonds à tout moment." },
  { id: "f3", q: "Comment contacter un client ?", r: "Utilisez la messagerie intégrée ou appelez directement depuis le détail de la mission." },
  { id: "f4", q: "Que faire en cas de litige ?", r: "Contactez notre support. Nous ouvrirons une médiation dans les plus brefs délais." },
  { id: "f5", q: "Comment être mieux classé ?", r: "Complétez votre profil, répondez rapidement, et accumulez des avis positifs." },
];

export default function ProSupportPage() {
  const nav = useNavigate();
  const [openId, setOpenId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5 gap-3">
          <button type="button" onClick={() => nav(-1)} className="p-1 -ml-1 cursor-pointer active:scale-[0.97]">
            <ArrowLeft className="w-5 h-5 text-cm-text" />
          </button>
          <h1 className="text-[18px] font-bold text-cm-text">Aide & Support</h1>
        </div>
      </div>

      <div className="w-full max-w-[448px] mx-auto px-5 pt-4 pb-24 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] overflow-hidden"
        >
          <h2 className="text-[13px] font-bold text-cm-text px-5 pt-4 pb-1">Questions fréquentes</h2>
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className="border-t border-cm-border mx-5 last:border-b last:border-cm-border">
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between py-3 text-left cursor-pointer active:scale-[0.97]"
                >
                  <span className="text-[12px] text-cm-text font-medium pr-2">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-cm-text-muted shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <p className="text-[11px] text-cm-text-muted pb-3 leading-relaxed">{faq.r}</p>
                )}
              </div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-cm-elevated border border-cm-border rounded-[14px] p-5"
        >
          <h2 className="text-[13px] font-bold text-cm-text mb-3">Nous contacter</h2>
          <div className="space-y-3">
            <input
              placeholder="Votre nom"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full h-11 px-4 text-[13px] bg-cm-bg border border-cm-border rounded-[12px] outline-none text-cm-text placeholder-cm-text-muted"
            />
            <input
              placeholder="Votre email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full h-11 px-4 text-[13px] bg-cm-bg border border-cm-border rounded-[12px] outline-none text-cm-text placeholder-cm-text-muted"
            />
            <textarea
              placeholder="Votre message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 text-[13px] bg-cm-bg border border-cm-border rounded-[12px] outline-none text-cm-text placeholder-cm-text-muted resize-none"
            />
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cm-accent text-white text-[12px] font-semibold rounded-full cursor-pointer active:scale-[0.97]">
              <Send className="w-3.5 h-3.5" />
              Envoyer
            </button>
          </div>
        </motion.div>

        <div className="flex flex-col gap-2">
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white text-[13px] font-semibold rounded-[14px] cursor-pointer active:scale-[0.97]">
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-3 bg-cm-elevated border border-cm-border text-cm-text text-[13px] font-semibold rounded-[14px] cursor-pointer active:scale-[0.97]">
            <Phone className="w-4 h-4" />
            +225 07 59 66 509
          </button>
        </div>
      </div>
    </div>
  );
}
