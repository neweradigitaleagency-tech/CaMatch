import { motion } from "motion/react";
import { Plus, MapPin, DollarSign, AlertTriangle, ClipboardList } from "lucide-react";
import { ClientRequest, Mission, MISSION_STATUS_LABELS, MISSION_STATUS_ORDER, MissionStatus } from "../types";

interface RequestsListScreenProps {
  requests: ClientRequest[];
  missions: Mission[];
  onNewRequest: () => void;
  onOpenRequest: (request: ClientRequest) => void;
  onOpenMission: (mission: Mission) => void;
}

const STATUS_COLORS: Record<MissionStatus, { bg: string; text: string; dot: string }> = {
  created: { bg: "bg-blue-50", text: "text-blue-600", dot: "bg-blue-500" },
  accepted: { bg: "bg-purple-50", text: "text-purple-600", dot: "bg-purple-500" },
  en_route: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" },
  in_progress: { bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-500" },
  completed: { bg: "bg-green-50", text: "text-green-600", dot: "bg-green-500" },
  paid: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
  reviewed: { bg: "bg-teal-50", text: "text-teal-600", dot: "bg-teal-500" },
};

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
    <div className="flex flex-col w-full min-h-screen bg-brand-cream pb-32">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-sans text-xl font-extrabold">Mes demandes</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">{allItems.length} demande{allItems.length > 1 ? "s" : ""}</p>
          </div>
          <button onClick={onNewRequest}
            className="w-10 h-10 rounded-xl bg-brand-forest text-white flex items-center justify-center shadow-sm hover:bg-brand-lime hover:text-brand-forest transition-colors cursor-pointer active:scale-90">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {allItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-pale-mint flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-secondary/60" />
          </div>
          <h3 className="font-sans text-base font-bold mb-1">Aucune demande</h3>
          <p className="text-xs text-on-surface-variant leading-relaxed mb-6">Créez votre première demande et trouvez le professionnel qu'il vous faut.</p>
          <button onClick={onNewRequest} className="bg-brand-forest text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-brand-lime hover:text-brand-forest transition-colors cursor-pointer active:scale-95">
            Créer une demande
          </button>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {activeItems.length > 0 && (
            <>
              <p className="text-[10px] font-bold text-secondary/60 uppercase tracking-wider">En cours</p>
              {activeItems.map((item) => <div key={item.data.id}><ListItem item={item} /></div>)}
            </>
          )}
          {historyItems.length > 0 && (
            <>
              <p className="text-[10px] font-bold text-secondary/60 uppercase tracking-wider pt-2">Historique</p>
              {historyItems.map((item) => <div key={item.data.id}><ListItem item={item} /></div>)}
            </>
          )}
        </div>
      )}
    </div>
  );

  function ListItem({ item }: { item: { type: "request" | "mission"; data: ClientRequest | Mission; status: string; createdAt: string } }) {
    const s = item.status as MissionStatus;
    const c = STATUS_COLORS[s] || STATUS_COLORS.created;
    const rd = item.data as any;
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        onClick={() => {
          if (item.type === "request") onOpenRequest(item.data as ClientRequest);
          else onOpenMission(item.data as Mission);
        }}
        className="bg-white rounded-2xl p-4 border border-pale-mint/20 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]">
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-xl bg-pale-mint flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-secondary/50" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="font-bold text-sm text-brand-forest truncate">{rd.title || ""}</h4>
              <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{MISSION_STATUS_LABELS[s]}</span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-secondary">
              <span>{rd.category || ""}</span>
              <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{(rd.address || "").split(",")[0]}</span>
              <span className="flex items-center gap-0.5 font-bold text-brand-forest"><DollarSign className="w-2.5 h-2.5" />{(rd.budgetXOF || 0).toLocaleString()} F</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
}
