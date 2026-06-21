import { useNavigate } from "react-router-dom";
import RequestsListScreen from "../components/RequestsListScreen";
import { useClientRequests, useClientMissions, useProMissions } from "../hooks/useDatabase";
import { useAuthStore } from "../stores/authStore";
import { useState } from "react";
import { StatusBadge } from "../components/ui";
import type { Mission } from "../types";
import { ChevronRight } from "lucide-react";

export default function OrdersPage() {
  const navigate = useNavigate();
  const isPro = useAuthStore((s) => s.isPro);
  const { data: requests = [] } = useClientRequests();
  const { data: missions = [] } = useClientMissions();
  const { data: proMissions = [] } = useProMissions();
  const [tab, setTab] = useState<"demandes" | "missions">("demandes");

  const commonHandlers = {
    onNewRequest: () => navigate("/orders/new"),
    onOpenRequest: (request: any) => {
      const mission = missions.find((m: any) => m.requestId === request.id);
      navigate(mission ? `/orders/tracker/${mission.id}` : `/orders/${request.id}`);
    },
    onOpenMission: (mission: any) => navigate(`/orders/tracker/${mission.id}`),
  };

  if (!isPro) {
    return (
      <RequestsListScreen
        requests={requests}
        missions={missions}
        {...commonHandlers}
      />
    );
  }

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Tabs */}
      <div className="flex mx-4 mt-3 mb-3 bg-white rounded-xl p-1 border border-pale-mint/10">
        <button
          onClick={() => setTab("demandes")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            tab === "demandes" ? "bg-cm-green text-white" : "text-secondary/60"
          }`}
        >
          Mes demandes
        </button>
        <button
          onClick={() => setTab("missions")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            tab === "missions" ? "bg-cm-green text-white" : "text-secondary/60"
          }`}
        >
          Mes missions
          {proMissions.length > 0 && (
            <span className="ml-1.5 text-2xs bg-cm-green/20 text-cm-green px-1.5 py-0.5 rounded-full">
              {proMissions.length}
            </span>
          )}
        </button>
      </div>

      {tab === "demandes" ? (
        <RequestsListScreen
          requests={requests}
          missions={missions}
          {...commonHandlers}
        />
      ) : (
        <div className="px-4 space-y-2">
          {proMissions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-secondary/50">Aucune mission pour le moment</p>
            </div>
          )}
          {proMissions.map((mission: Mission) => (
            <div
              key={mission.id}
              onClick={() => navigate(`/orders/tracker/${mission.id}`)}
              className="bg-white rounded-2xl border border-pale-mint/10 p-4 cursor-pointer active:bg-pale-mint/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-brand-forest">{mission.title}</p>
                <StatusBadge status={mission.status} />
              </div>
              <p className="text-caption text-secondary/60 mb-2 line-clamp-2">{mission.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-2xs font-semibold text-cm-green">{mission.budgetXOF.toLocaleString()} F</span>
                <ChevronRight className="w-3.5 h-3.5 text-secondary/40" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
