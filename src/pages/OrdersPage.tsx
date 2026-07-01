import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, FileText, MapPin, DollarSign, ArrowUpRight, XCircle, Zap, Star, Hourglass } from "lucide-react";
import { useClientRequests, useClientMissions } from "../hooks/useDatabase";
import { useAuthStore } from "../stores/authStore";
import { useRequestStore } from "../stores/requestStore";
import { useProStore } from "../stores/proStore";
import { MOCK_REQUESTS, MOCK_MISSIONS, MOCK_PRO_JOBS, MOCK_PROS } from "../services/mockData";
import StatusBadge from "../components/ui/StatusBadge";
import type { Mission, ProAlert, ProDashboardStats, ClientRequest, MissionStatus } from "../types";

export default function OrdersPage() {
  const navigate = useNavigate();
  const isPro = useAuthStore((s) => s.isPro);
  const userId = useAuthStore((s) => s.userId);

  const storeRequests = useRequestStore((s) => s.requests);
  const setRequests = useRequestStore((s) => s.setRequests);
  const storeMissions = useRequestStore((s) => s.missions);
  const setMissions = useRequestStore((s) => s.setMissions);
  const rawAlerts = useProStore((s) => s.alerts);
  const removeAlert = useProStore((s) => s.removeAlert);
  const isAvailable = useProStore((s) => s.isAvailable);
  const toggleAvailability = useProStore((s) => s.toggleAvailability);

  useEffect(() => {
    if (storeRequests.length === 0 && MOCK_REQUESTS.length > 0) setRequests(MOCK_REQUESTS);
    if (storeMissions.length === 0 && MOCK_MISSIONS.length > 0) setMissions(MOCK_MISSIONS);
  }, []);

  const currentPro = MOCK_PROS.find((p) => p.id === userId) || MOCK_PROS[0];
  const alerts: ProAlert[] = rawAlerts.filter((a) => a.category === currentPro?.category).map((a) => ({
    ...a, clientAvatarUrl: undefined, urgency: a.urgency as ProAlert["urgency"],
  }));

  const { data: requestsFromDb = [] } = useClientRequests();
  const { data: missionsFromDb = [] } = useClientMissions();

  const requests = storeRequests.length > 0 ? storeRequests : requestsFromDb;
  const missions = storeMissions.length > 0 ? storeMissions : missionsFromDb;

  const todayJobs = MOCK_PRO_JOBS.filter((j) => {
    const today = new Date().toISOString().slice(0, 10);
    return j.scheduledDate === today || j.status !== "completed";
  });

  const stats: ProDashboardStats = {
    todayEarningsXOF: 45000,
    weekEarningsXOF: 185000,
    monthEarningsXOF: 720000,
    totalJobsCompleted: 42,
    todayJobsCount: todayJobs.length,
    rating: 48,
    reviewCount: 76,
  };

  if (!isPro) {
    const activeStatuses: MissionStatus[] = ["pending", "accepted", "paid", "in_progress", "en_route", "client_validation", "disputed"];
    const activeMissions = missions.filter((m: Mission) => activeStatuses.includes(m.status));
    const pastMissions = missions.filter((m: Mission) => ["completed", "cancelled", "closed", "refunded"].includes(m.status));
    const missionRequestIds = new Set(missions.map((m: Mission) => m.requestId));
    const pendingRequests = requests.filter((r: ClientRequest) => !missionRequestIds.has(r.id));

    const counts = {
      pending: pendingRequests.length,
      active: activeMissions.length,
      reviews: pastMissions.filter((m: Mission) => m.status === "completed" || m.status === "closed").length,
      cancelled: pastMissions.filter((m: Mission) => m.status === "cancelled").length,
    };

    const renderCard = (item: Mission | ClientRequest, onClick: () => void, past = false) => {
      const title = (item as any).title || "";
      const category = (item as any).category || "";
      const address = ((item as any).address || "").split(",")[0];
      const budget = (item as any).budgetXOF || 0;
      const status = (item as any).status as MissionStatus;
      return (
        <button type="button" onClick={onClick}
          className={`w-full text-left bg-cm-elevated border border-cm-border rounded-[14px] p-4 cursor-pointer hover:border-cm-accent/30 transition-colors active:scale-[0.98] ${past ? "opacity-60" : ""}`}>
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="font-bold text-[14px] text-cm-text truncate">{title}</h4>
                <StatusBadge status={status} className="shrink-0" />
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-cm-text-muted">
                <span>{category}</span>
                <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{address}</span>
                <span className="flex items-center gap-0.5 font-bold text-cm-text font-mono"><DollarSign className="w-2.5 h-2.5" />{budget.toLocaleString()} F</span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-cm-text-muted shrink-0 mt-1" />
          </div>
        </button>
      );
    };

    return (
      <div className="min-h-screen bg-cm-bg">
        <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
          <div className="flex items-center gap-3 h-14 px-5">
            <button onClick={() => navigate(-1)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-cm-elevated border border-cm-border cursor-pointer active:scale-95 shrink-0">
              <ArrowLeft className="w-4 h-4 text-cm-text" />
            </button>
            <h1 className="text-[18px] font-bold text-cm-text">Mes commandes</h1>
          </div>
        </div>
        <div className="px-5 pt-4 pb-24 space-y-4">
          {/* Stats badges */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {[
              { key: "pending", label: "En attente", count: counts.pending, icon: Hourglass },
              { key: "active", label: "Actives", count: counts.active, icon: Zap },
              { key: "reviews", label: "A évaluer", count: counts.reviews, icon: Star },
              { key: "cancelled", label: "Annulées", count: counts.cancelled, icon: XCircle },
            ].map((s) => (
              <div key={s.key}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cm-elevated border border-cm-border text-[12px] font-medium text-cm-text-soft shrink-0">
                <s.icon className="w-3.5 h-3.5" />
                <span className="font-bold text-cm-text">{s.count}</span>
                {s.label}
              </div>
            ))}
          </div>

          {/* Items */}
          <div className="space-y-3">
            {activeMissions.length === 0 && pastMissions.length === 0 && pendingRequests.length === 0 ? (
              <div className="pt-12 text-center">
                <p className="text-[13px] text-cm-text-muted">Aucune commande pour le moment</p>
              </div>
            ) : (
              <>
                {activeMissions.length > 0 && (
                  <div>
                    {activeMissions.map((m) => renderCard(m, () => navigate(`/orders/tracker/${m.id}`)))}
                  </div>
                )}
                {pendingRequests.length > 0 && (
                  <div>
                    {pendingRequests.map((r) => renderCard(r, () => navigate(`/orders/${r.id}`)))}
                  </div>
                )}
                {pastMissions.length > 0 && (
                  <div>
                    {pastMissions.map((m) => renderCard(m, () => navigate(`/orders/tracker/${m.id}`), true))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cm-bg">
      <div className="sticky top-0 z-10 bg-cm-elevated/80 backdrop-blur-lg border-b border-cm-border">
        <div className="flex items-center h-14 px-5">
          <h1 className="text-[18px] font-bold text-cm-text">Tableau de bord</h1>
        </div>
      </div>
      <div className="px-5 pt-4 pb-24 space-y-4">
        <div className="flex items-center justify-between bg-cm-elevated border border-cm-border rounded-[14px] p-4">
          <div>
            <p className="text-[12px] text-cm-text-muted">Disponible</p>
            <p className="text-[14px] font-bold text-cm-text">{isAvailable ? "Oui" : "Non"}</p>
          </div>
          <button type="button" onClick={toggleAvailability} className={`w-12 h-7 rounded-full transition-colors ${isAvailable ? "bg-green-500" : "bg-cm-border"}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isAvailable ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-cm-elevated border border-cm-border rounded-[14px] p-4">
            <p className="text-[11px] text-cm-text-muted">Aujourd'hui</p>
            <p className="text-[20px] font-bold text-cm-text">{stats.todayJobsCount}</p>
            <p className="text-[10px] text-cm-text-soft">missions</p>
          </div>
          <div className="bg-cm-elevated border border-cm-border rounded-[14px] p-4">
            <p className="text-[11px] text-cm-text-muted">Gains du jour</p>
            <p className="text-[20px] font-bold text-cm-text font-mono">{stats.todayEarningsXOF.toLocaleString("fr-FR")} F</p>
          </div>
        </div>

        {alerts.length > 0 && (
          <div>
            <h2 className="text-[13px] font-bold text-cm-text mb-2">Alertes mission</h2>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="bg-cm-elevated border border-cm-border rounded-[14px] p-4">
                  <p className="text-[13px] font-bold text-cm-text">{alert.clientName}</p>
                  <p className="text-[11px] text-cm-text-soft">{alert.description}</p>
                  <p className="text-[11px] text-cm-text-muted">{alert.location}</p>
                  <div className="flex gap-2 mt-2">
                    <button type="button" onClick={() => navigate(`/orders/quote/create/${alert.requestId}`)}
                      className="flex-1 h-9 text-[11px] font-bold text-cm-accent bg-cm-accent-soft rounded-[10px] flex items-center justify-center gap-1 cursor-pointer">
                      <FileText className="w-3.5 h-3.5" /> Devis
                    </button>
                    <button type="button" onClick={() => { const newMission: Mission = { id: "mission_" + Date.now(), requestId: alert.requestId, clientId: "client_marie", proId: userId || "pro_mock", status: "accepted", title: alert.description.slice(0, 60), description: alert.description, category: alert.category, address: alert.location, budgetXOF: alert.estimatedPriceMinXOF, photos: [], proName: currentPro?.name || "Vous", proAvatar: currentPro?.avatarUrl || "", proPhone: currentPro?.phoneNumber || "", clientName: alert.clientName, clientPhone: alert.clientPhone, createdAt: new Date().toISOString() }; useRequestStore.getState().addMission(newMission); removeAlert(alert.id); }} className="h-9 text-[11px] font-bold text-white bg-green-600 rounded-[10px] px-3 cursor-pointer">Accepter</button>
                    <button type="button" onClick={() => removeAlert(alert.id)} className="h-9 text-[11px] font-bold text-cm-text bg-cm-border-soft rounded-[10px] px-3 cursor-pointer">Refuser</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {todayJobs.length > 0 && (
          <div>
            <h2 className="text-[13px] font-bold text-cm-text mb-2">Missions en cours</h2>
            <div className="space-y-2">
              {todayJobs.map((job: any) => (
                <button type="button" key={job.id} onClick={() => navigate(`/orders/tracker/${job.id}`)} className="w-full text-left bg-cm-elevated border border-cm-border rounded-[14px] p-4">
                  <p className="text-[13px] font-bold text-cm-text">{job.clientName}</p>
                  <p className="text-[11px] text-cm-text-soft">{job.serviceName}</p>
                  <p className="text-[11px] text-cm-text-muted">{job.scheduledDate || "Non planifié"}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
