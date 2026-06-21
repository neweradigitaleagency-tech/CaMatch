import { useState } from "react";
import { motion } from "motion/react";
import {
  Bell,
  BellOff,
  ChevronLeft,
  Smartphone,
  MessageSquare,
  Mail,
  AlertCircle,
  ArrowLeft,
  Check,
  Volume2,
  VolumeX,
} from "lucide-react";
import { NotificationPreference } from "../types";

interface Props {
  preferences: NotificationPreference[];
  onUpdate: (prefs: NotificationPreference[]) => void;
  onBack: () => void;
}

const CHANNEL_CONFIG = {
  push: { label: "Notifications Push", icon: Smartphone, description: "Bannières et alertes sur votre téléphone" },
  sms: { label: "SMS", icon: MessageSquare, description: "Messages texte sur votre numéro" },
  whatsapp: { label: "WhatsApp", icon: MessageSquare, description: "Messages via WhatsApp Business" },
  email: { label: "Email", icon: Mail, description: "Résumés et factures par email" },
};

const EVENT_LABELS: Record<string, string> = {
  newLead: "Nouvelle mission",
  quoteAccepted: "Devis accepté",
  paymentReceived: "Paiement reçu",
  reviewReceived: "Avis reçu",
  payoutProcessed: "Retrait traité",
  verificationApproved: "Vérification approuvée",
  lowBalance: "Solde faible",
  weeklySummary: "Résumé hebdomadaire",
};

export default function ProNotificationSettingsScreen({ preferences, onUpdate, onBack }: Props) {
  const [localPrefs, setLocalPrefs] = useState(preferences.length > 0 ? preferences : getDefaultPrefs());

  const toggleChannel = (channel: string) => {
    const updated = localPrefs.map((p) =>
      p.channel === channel ? { ...p, enabled: !p.enabled } : p
    );
    setLocalPrefs(updated);
    onUpdate(updated);
  };

  const toggleEvent = (channel: string, event: string) => {
    const updated = localPrefs.map((p) =>
      p.channel === channel
        ? { ...p, events: { ...p.events, [event]: !(p.events as any)[event] } }
        : p
    );
    setLocalPrefs(updated);
    onUpdate(updated);
  };

  return (
    <div className="px-5 py-5 pb-32 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm cursor-pointer">
          <ArrowLeft className="w-5 h-5 text-brand-forest" />
        </button>
        <h2 className="font-sans text-lg font-extrabold">Notifications</h2>
      </div>

      <p className="text-caption text-secondary leading-relaxed">
        Choisissez comment et quand vous souhaitez être notifié. Les notifications urgentes (nouvelle mission, alerte solde) sont toujours envoyées.
      </p>

      {localPrefs.map((pref) => {
        const config = CHANNEL_CONFIG[pref.channel];
        const Icon = config.icon;

        return (
          <motion.div
            key={pref.channel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-premium border border-pale-mint/15 overflow-hidden"
          >
            {/* Channel Toggle Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${pref.enabled ? "bg-brand-lime/20" : "bg-gray-50"}`}>
                  {pref.enabled ? <Icon className="w-5 h-5 text-brand-forest" /> : <BellOff className="w-5 h-5 text-gray-400" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold">{config.label}</h4>
                  <p className="text-caption text-secondary">{config.description}</p>
                </div>
              </div>
              <button
                onClick={() => toggleChannel(pref.channel)}
                className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer ${pref.enabled ? "bg-brand-lime" : "bg-gray-200"}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${pref.enabled ? "translate-x-5.5 left-0.5" : "translate-x-0.5 left-0"}`} />
              </button>
            </div>

            {/* Events List */}
            {pref.enabled && (
              <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} className="border-t border-pale-mint/10 px-4 pb-4 space-y-1 pt-2">
                {Object.keys(pref.events).map((eventKey) => (
                  <div key={eventKey} className="flex items-center justify-between py-1.5">
                    <span className="text-body-sm font-medium text-secondary">
                      {EVENT_LABELS[eventKey] || eventKey}
                    </span>
                    <button
                      onClick={() => toggleEvent(pref.channel, eventKey)}
                      className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${
                        (pref.events as any)[eventKey] ? "bg-brand-lime" : "bg-gray-200"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                          (pref.events as any)[eventKey] ? "translate-x-4.5 left-0.5" : "translate-x-0.5 left-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        );
      })}

      <div className="bg-pale-mint p-4 rounded-2xl flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-brand-forest shrink-0 mt-0.5" />
        <p className="text-caption text-secondary leading-relaxed">
          Les notifications critiques (nouvelle mission avec décompte, alerte de solde faible) sont prioritaires et peuvent contourner vos préférences si nécessaire.
        </p>
      </div>
    </div>
  );
}

function getDefaultPrefs(): NotificationPreference[] {
  return [
    {
      channel: "push",
      enabled: true,
      events: { newLead: true, quoteAccepted: true, paymentReceived: true, reviewReceived: true, payoutProcessed: true, verificationApproved: true, lowBalance: true, weeklySummary: false },
    },
    {
      channel: "sms",
      enabled: true,
      events: { newLead: true, quoteAccepted: false, paymentReceived: true, reviewReceived: false, payoutProcessed: true, verificationApproved: false, lowBalance: true, weeklySummary: false },
    },
    {
      channel: "whatsapp",
      enabled: false,
      events: { newLead: false, quoteAccepted: false, paymentReceived: false, reviewReceived: false, payoutProcessed: false, verificationApproved: false, lowBalance: false, weeklySummary: true },
    },
    {
      channel: "email",
      enabled: true,
      events: { newLead: false, quoteAccepted: false, paymentReceived: true, reviewReceived: false, payoutProcessed: false, verificationApproved: true, lowBalance: false, weeklySummary: true },
    },
  ];
}
