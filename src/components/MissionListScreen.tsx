import { useState } from "react";
import { motion } from "motion/react";
import { Plus, XCircle, Zap, Star, Hourglass, MapPin, DollarSign, Navigation, AlertTriangle, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "./ui/GlassCard";
import EmptyState from "./ui/EmptyState";
import StatusBadge from "./ui/StatusBadge";
import { MISSION_STATUS_ORDER, MissionStatus } from "../types";
import type { ClientRequest, Mission } from "../types";

const TABS = [
  { key: "pending", label: "En attente", icon: Hourglass },
  { key: "active", label: "Actives", icon: Zap },
  { key: "reviews", label: "A évaluer", icon: Star },
  { key: "cancelled", label: "Annulées", icon: XCircle },
];

const emptyMessages: Record<string, { title: string; desc: string }> = {
  pending: { title: "Aucune demande en attente", desc: "Créez une nouvelle demande pour commencer" },
  active: { title: "Aucune mission active", desc: "Vos missions en cours apparaîtront ici" },
  reviews: { title: "Tout est évalué", desc: "Vous n'avez pas de mission en attente d'évaluation" },
  cancelled: { title: "Aucune annulation", desc: "Vous n'avez annulé aucune mission" },
};

interface Props {
  tabCounts: Record<string, number>;
  onNewRequest: () => void;
  onOpenRequest: (req: ClientRequest) => void;
  onOpenMission: (mission: Mission) => void;
}

export default function MissionListScreen({ tabCounts, onNewRequest, onOpenRequest, onOpenMission }: Props) {
  const nav = useNavigate();
  const [tab, setTab] = useState("pending");

  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-cm-elevated border-b border-cm-border">
        <div className="flex items-center gap-3">
          <h1 className="text-[15px] font-bold text-cm-text">Mes missions</h1>
        </div>
        <button type="button" onClick={onNewRequest}
          className="w-12 h-12 rounded-[14px] bg-cm-text text-white flex items-center justify-center cursor-pointer active:scale-90 transition-transform shadow-cm-sm"
          aria-label="Nouvelle demande">
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {/* Tabs */}
      <div className="px-4 pt-3 overflow-x-auto scrollbar-none">
        <div className="flex gap-2">
          {TABS.map(t => (
            <button type="button" key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] text-[12px] font-medium transition-all cursor-pointer active:scale-95 shrink-0 ${
                tab === t.key
                  ? "bg-cm-text text-cm-bg"
                  : "bg-cm-elevated border border-cm-border text-cm-text-soft hover:bg-cm-accent-soft"
              }`}>
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
              {(tabCounts[t.key] ?? 0) > 0 && (
                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  tab === t.key ? "bg-white/20 text-cm-bg" : "bg-cm-accent-soft text-cm-accent"
                }`}>
                  {tabCounts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="px-4 pt-4 space-y-3">
        {tabCounts[tab] === 0 ? (
          <div className="pt-8">
            <EmptyState
              icon={tab === "cancelled" ? XCircle : tab === "active" ? Zap : tab === "reviews" ? Star : Hourglass}
              title={emptyMessages[tab]?.title ?? ""}
              description={emptyMessages[tab]?.desc ?? ""}
              action={tab === "pending" ? { label: "Créer une demande", onClick: onNewRequest } : undefined}
            />
          </div>
        ) : (
          (renderItems(tab) as React.ReactNode)
        )}
      </div>
    </div>
  );
}

function getPhaseIcon(status: MissionStatus, category: string, type: string) {
  return Check;
}

function getPhaseIconColor(status: MissionStatus, type: string) {
  return "text-cm-accent";
}

function getPhaseIconBg(status: MissionStatus, type: string) {
  return "bg-cm-accent-soft";
}

function renderItems(tab: string) {
  return null;
}

function ListItem({ item }: { item: { type: "request" | "mission"; data: ClientRequest | Mission; status: string; createdAt: string } }) {
  const rd = item.data as any;
  const status = item.status as MissionStatus;
  const PhaseIcon = getPhaseIcon(status, rd.category, item.type);
  const iconColor = getPhaseIconColor(status, item.type);
  const iconBg = getPhaseIconBg(status, item.type);

  const phaseIdx = MISSION_STATUS_ORDER.indexOf(status);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      onClick={() => {
        if (item.type === "request") onOpenRequest(item.data as ClientRequest);
        else onOpenMission(item.data as Mission);
      }}>
      <GlassCard interactive className="p-4 relative overflow-hidden">
        <div className="flex items-start gap-3">
          <motion.div
            animate={status === "en_route" ? { x: [0, 4, 0] } : status === "in_progress" ? { scale: [1, 1.05, 1] } : status === "disputed" ? { rotate: [0, -5, 5, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className={`w-14 h-14 rounded-[14px] ${iconBg} flex items-center justify-center shrink-0 relative`}>
            <PhaseIcon className={`w-5 h-5 ${iconColor}`} />
            {status === "en_route" && (
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-cm-accent rounded-full flex items-center justify-center">
                <Navigation className="w-2.5 h-2.5 text-white" />
              </motion.div>
            )}
            {status === "disputed" && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="font-bold text-[14px] text-cm-text truncate">{rd.title || ""}</h4>
              <StatusBadge status={item.status as any} className="shrink-0" />
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-cm-text-muted">
              <span>{rd.category || ""}</span>
              <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{(rd.address || "").split(",")[0]}</span>
              <span className="flex items-center gap-0.5 font-bold text-cm-text font-mono"><DollarSign className="w-2.5 h-2.5" />{(rd.budgetXOF || 0).toLocaleString()} F</span>
            </div>
            {item.type === "mission" && phaseIdx >= 0 && (
              <div className="flex items-center gap-1 mt-2">
                {MISSION_STATUS_ORDER.slice(1, 6).map((s, i) => {
                  const done = i <= phaseIdx - 1;
                  const current = i === phaseIdx - 1;
                  return (
                    <div key={s} className="flex items-center flex-1">
                      <motion.div
                        animate={current ? { scale: [1, 1.3, 1] } : {}}
                        transition={{ duration: 1.5, repeat: current ? Infinity : 0, repeatDelay: 1 }}
                        className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300 ${
                          done ? "bg-cm-text" : current ? "bg-cm-accent" : "bg-cm-border-soft"
                        }`} />
                      {i < 4 && (
                        <div className={`flex-1 h-px mx-0.5 ${done ? "bg-cm-text" : current ? "bg-cm-accent/40" : "bg-cm-border-soft"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

function onOpenRequest(data: ClientRequest) {
  // handled by parent
}

function onOpenMission(data: Mission) {
  // handled by parent
}
