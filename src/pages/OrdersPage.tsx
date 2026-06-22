import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import RequestsListScreen from "../components/RequestsListScreen";
import ProDashboardScreen from "../components/ProDashboardScreen";
import { useClientRequests, useClientMissions } from "../hooks/useDatabase";
import { useAuthStore } from "../stores/authStore";
import { useRequestStore } from "../stores/requestStore";
import { useProStore } from "../stores/proStore";
import { MOCK_REQUESTS, MOCK_MISSIONS, MOCK_PRO_JOBS, MOCK_PROS } from "../services/mockData";
import type { Mission, ProAlert, ProDashboardStats } from "../types";

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
    <ProDashboardScreen
      pro={currentPro}
      stats={stats}
      todayJobs={todayJobs}
      alerts={alerts}
      available={isAvailable}
      onToggleAvailability={toggleAvailability}
      onViewJob={(job) => navigate(`/orders/tracker/${job.id}`)}
      onAcceptAlert={(alert) => {
        const newMission: Mission = {
          id: "mission_" + Date.now(),
          requestId: "req_" + Date.now(),
          clientId: "client_marie",
          proId: userId || "pro_mock",
          status: "accepted",
          title: alert.description.slice(0, 60),
          description: alert.description,
          category: alert.category,
          address: alert.location,
          budgetXOF: alert.estimatedPriceMinXOF,
          photos: [],
          proName: currentPro?.name || "Vous",
          proAvatar: currentPro?.avatarUrl || "",
          proPhone: currentPro?.phoneNumber || "",
          clientName: alert.clientName,
          clientPhone: alert.clientPhone,
          createdAt: new Date().toISOString(),
        };
        setMissions([newMission, ...storeMissions]);
        removeAlert(alert.id);
      }}
      onDeclineAlert={(alert) => removeAlert(alert.id)}
    />
  );
}
