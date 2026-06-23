import { motion } from "motion/react";
import { Plus, MapPin, DollarSign, AlertTriangle, ClipboardList, Zap, Droplets, Wind, Sparkles, Navigation, CheckCircle, Clock } from "lucide-react";
import type { ClientRequest, Mission, MissionStatus } from "../types";
import { MISSION_STATUS_ORDER, MISSION_STATUS_LABELS } from "../types";
import { StatusBadge } from "./ui";
import { EmptyState } from "./ui";
import GlassCard from "./ui/GlassCard";

interface RequestsListScreenProps {
  requests: ClientRequest[];
  missions: Mission[];
  onNewRequest: () => void;
  onOpenRequest: (request: ClientRequest) => void;
  onOpenMission: (mission: Mission) => void;
}

const DOMAIN_ICONS: Record<string, typeof Zap> = {
  electricity: Zap,
  plumbing: Droplets,
  ac: Wind,
  cleaning: Sparkles,
  carpenter: AlertTriangle,
};

function getPhaseIcon(status: MissionStatus, category: string, type: "request" | "mission") {
  if (type === "request") return DOMAIN_ICONS[category] || AlertTriangle;
  if (status === "en_route") return Navigation;
  if (status === "in_progress") return DOMAIN_ICONS[category] || Zap;
  if (["accepted"].includes(status)) return CheckCircle;
  if (["completed", "paid", "reviewed"].includes(status)) return CheckCircle;
  return DOMAIN_ICONS[category] || AlertTriangle;
}

function getPhaseIconColor(status: MissionStatus, type: "request" | "mission") {
  if (type === "request") return "text-cm-accent";
  if (status === "en_route") return "text-cm-accent";
  if (status === "in_progress") return "text-cm-accent";
  if (["accepted"].includes(status)) return "text-cm-text";
  if (["completed", "paid", "reviewed"].includes(status)) return "text-cm-text-soft";
  return "text-cm-accent";
}

function getPhaseIconBg(status: MissionStatus, type: "request" | "mission") {
  if (type === "request") return "bg-cm-accent-soft";
  if (status === "en_route") return "bg-cm-accent-soft";
  if (status === "in_progress") return "bg-cm-accent-soft";
  if (["accepted"].includes(status)) return "bg-cm-border-soft";
  if (["completed", "paid", "reviewed"].includes(status)) return "bg-cm-border-soft";
  return "bg-cm-accent-soft";
}

function isRecentlyValidated(item: { type: "request" | "mission"; status: string; data: any }) {
  if (item.type !== "mission") return false;
  if (item.status === "accepted" || item.status === "en_route") return true;
  return false;
}

export default function RequestsListScreen({
  requests, missions, onNewRequest, onOpenRequest, onOpenMission,
}: RequestsListScreenProps) {
  const allItems = [
    ...requests.map((r) => ({ type: "request" as const, data: r, status: r.status, createdAt: r.createdAt })),
    ...missions.map((m) => ({ type: "mission" as const, data: m, status: m.status, createdAt: m.createdAt })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const activeItems = allItems.filter((i) => !["completed", "paid", "reviewed"].includes(i.status));
  const historyItems = allItems.filter((i) => ["completed", "paid", "reviewed"].includes(i.status));

  return (
    <div className="flex flex-col w-full min-h-screen bg-cm-bg pb-32">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[20px] font-display font-bold text-cm-text">Mes demandes</h2>
            <p className="text-[12px] text-cm-text-muted mt-0.5">{allItems.length} demande{allItems.length > 1 ? "s" : ""}</p>
          </div>
          <button onClick={onNewRequest}
            className="w-12 h-12 rounded-[14px] bg-cm-text text-white flex items-center justify-center cursor-pointer active:scale-90 transition-transform shadow-cm-sm"
            aria-label="Nouvelle demande">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {allItems.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Aucune demande"
          description="Créez votre première demande et trouvez le professionnel qu'il vous faut."
          action={{ label: "Créer une demande", onClick: onNewRequest }}
        />
      ) : (
        <div className="px-4 space-y-3">
          {activeItems.length > 0 && (
            <>
              <p className="text-[11px] font-medium text-cm-text-muted uppercase tracking-wider">En cours</p>
              {activeItems.map((item) => <div key={item.data.id}><ListItem item={item} /></div>)}
            </>
          )}
          {historyItems.length > 0 && (
            <>
              <p className="text-[11px] font-medium text-cm-text-muted uppercase tracking-wider pt-2">Historique</p>
              {historyItems.map((item) => <div key={item.data.id}><ListItem item={item} /></div>)}
            </>
          )}
        </div>
      )}
    </div>
  );

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
          {isRecentlyValidated(item) && (
            <div className="absolute top-3 right-3 flex items-center gap-1">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                className="w-2 h-2 rounded-full bg-cm-accent"
              />
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [0, 1, 1, 0], scale: 1 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -inset-1 rounded-full bg-cm-accent/30"
              />
            </div>
          )}
          <div className="flex items-start gap-3">
            <motion.div
              animate={status === "en_route" ? { x: [0, 4, 0] } : status === "in_progress" ? { scale: [1, 1.05, 1] } : {}}
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
}
