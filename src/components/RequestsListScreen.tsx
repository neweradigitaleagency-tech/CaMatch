import { motion } from "motion/react";
import { Plus, MapPin, DollarSign, AlertTriangle, ClipboardList, Zap, Droplets, Wind, Sparkles } from "lucide-react";
import type { ClientRequest, Mission } from "../types";
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
    <div className="flex flex-col w-full min-h-screen pb-32" style={{ background: "linear-gradient(180deg, #D8F3DC 0%, #F5F0E8 100%)" }}>
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[20px] font-extrabold text-ca-text-primary">Mes demandes</h2>
            <p className="text-[12px] text-ca-text-muted mt-0.5">{allItems.length} demande{allItems.length > 1 ? "s" : ""}</p>
          </div>
          <button onClick={onNewRequest}
            className="w-12 h-12 rounded-[14px] bg-[rgba(45,106,79,0.85)] backdrop-blur-[8px] border border-[rgba(82,183,136,0.40)] flex items-center justify-center cursor-pointer active:scale-90 transition-transform shadow-[0_4px_16px_rgba(45,106,79,0.15)]"
            aria-label="Nouvelle demande">
            <Plus className="w-5 h-5 text-white" />
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
              <p className="text-[11px] font-medium text-ca-text-muted uppercase tracking-wider">En cours</p>
              {activeItems.map((item) => <div key={item.data.id}><ListItem item={item} /></div>)}
            </>
          )}
          {historyItems.length > 0 && (
            <>
              <p className="text-[11px] font-medium text-ca-text-muted uppercase tracking-wider pt-2">Historique</p>
              {historyItems.map((item) => <div key={item.data.id}><ListItem item={item} /></div>)}
            </>
          )}
        </div>
      )}
    </div>
  );

  function ListItem({ item }: { item: { type: "request" | "mission"; data: ClientRequest | Mission; status: string; createdAt: string } }) {
    const rd = item.data as any;
    const IconMap: Record<string, typeof Zap> = { electricity: Zap, plumbing: Droplets, ac: Wind, cleaning: Sparkles };
    const ItemIcon = IconMap[rd.category] || AlertTriangle;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        onClick={() => {
          if (item.type === "request") onOpenRequest(item.data as ClientRequest);
          else onOpenMission(item.data as Mission);
        }}>
        <GlassCard interactive className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-[14px] bg-[rgba(255,255,255,0.50)] flex items-center justify-center shrink-0 border border-[rgba(255,255,255,0.30)]">
              <ItemIcon className="w-5 h-5 text-ca-text-muted" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="font-bold text-[14px] text-ca-text-primary truncate">{rd.title || ""}</h4>
                <StatusBadge status={item.status as any} className="shrink-0" />
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-ca-text-muted">
                <span>{rd.category || ""}</span>
                <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{(rd.address || "").split(",")[0]}</span>
                <span className="flex items-center gap-0.5 font-bold text-ca-text-primary"><DollarSign className="w-2.5 h-2.5" />{(rd.budgetXOF || 0).toLocaleString()} F</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    );
  }
}
