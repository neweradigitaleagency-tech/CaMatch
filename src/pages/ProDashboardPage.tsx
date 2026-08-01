import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBackNavigation } from "../hooks/useBackNavigation";
import { ArrowLeft, Star, Users, CalendarDays, TrendingUp, Settings, LogOut, Store } from "lucide-react";

interface Mission {
  id: string;
  customer: string;
  service: string;
  date: string;
  status: "upcoming" | "completed" | "cancelled";
  amount: number;
}

const MOCK_MISSIONS: Mission[] = [
  { id: "m1", customer: "M. Koné", service: "Réparation robinet", date: "2026-07-02", status: "upcoming", amount: 15000 },
  { id: "m2", customer: "Mme Diallo", service: "Installation chauffe-eau", date: "2026-06-30", status: "completed", amount: 35000 },
  { id: "m3", customer: "M. Bamba", service: "Dépannage électrique", date: "2026-06-25", status: "completed", amount: 20000 },
  { id: "m4", customer: "Mme Touré", service: "Réparation fuite", date: "2026-06-20", status: "completed", amount: 18000 },
];

export default function ProDashboardPage() {
  const nav = useNavigate();
  const goBack = useBackNavigation("/");
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");

  const stats = [
    { label: "Avis", value: "4.8", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Clients", value: "12", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Missions", value: "24", icon: CalendarDays, color: "text-green-500", bg: "bg-green-50" },
    { label: "Revenus", value: "360K", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  const filteredMissions = MOCK_MISSIONS.filter((m) => filter === "all" || m.status === filter);

  const today = new Date().toISOString().split("T")[0];
  const upcomingCount = MOCK_MISSIONS.filter((m) => m.status === "upcoming").length;

  return (
    <div className="min-h-dynamic bg-cm-bg">
      <header className="sticky top-0 z-10 bg-white border-b border-cm-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button onClick={goBack}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cm-surface cursor-pointer">
              <ArrowLeft className="w-4 h-4 text-cm-text-soft" />
            </button>
            <h1 className="text-[16px] font-bold text-cm-text">Tableau de bord</h1>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cm-surface cursor-pointer">
              <Settings className="w-4 h-4 text-cm-text-soft" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cm-surface cursor-pointer">
              <LogOut className="w-4 h-4 text-cm-text-soft" />
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 px-4 py-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.bg} rounded-[14px] p-3 text-center`}>
              <Icon className={`w-5 h-5 ${s.color} mx-auto mb-1`} />
              <p className="text-[16px] font-extrabold text-cm-text">{s.value}</p>
              <p className="text-[10px] text-cm-text-muted">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Next mission */}
      {upcomingCount > 0 && (
        <div className="mx-4 mb-4 p-4 bg-cm-accent rounded-[14px]">
          <p className="text-[11px] text-white/80 font-medium mb-1">Prochaine mission</p>
          <p className="text-[15px] font-bold text-white">
            {MOCK_MISSIONS.find((m) => m.status === "upcoming")?.service}
          </p>
          <p className="text-[12px] text-white/70">
            Aujourd'hui · {MOCK_MISSIONS.find((m) => m.status === "upcoming")?.amount.toLocaleString("fr-FR")} F
          </p>
        </div>
      )}

      {/* Devenir fournisseur */}
      <div className="mx-4 mb-4 p-4 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-[14px]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-amber-900">Devenir fournisseur partenaire</p>
            <p className="text-[11px] text-amber-700 mt-0.5">Vendez vos matériaux et équipements sur notre marketplace.</p>
            <button onClick={() => nav("/supplier/register")}
              className="mt-2 h-8 px-4 rounded-lg bg-amber-600 text-white text-[10px] font-bold cursor-pointer active:scale-[0.97] transition-transform hover:bg-amber-700">
              Je m'inscris
            </button>
          </div>
        </div>
      </div>

      {/* Missions */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-extrabold text-cm-text">Missions</h2>
          <div className="flex gap-1">
            {(["all", "upcoming", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-medium cursor-pointer transition-colors ${
                  filter === f ? "bg-cm-accent text-cm-text-onAccent" : "bg-cm-surface text-cm-text-soft"
                }`}
              >
                {f === "all" ? "Toutes" : f === "upcoming" ? "À venir" : "Terminées"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filteredMissions.map((m) => (
            <div key={m.id} className="bg-white border border-cm-border rounded-[14px] p-4">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-[14px] font-bold text-cm-text">{m.service}</p>
                  <p className="text-[12px] text-cm-text-muted">{m.customer}</p>
                </div>
                <span className={`text-[13px] font-bold ${
                  m.status === "upcoming" ? "text-cm-accent" : "text-green-600"
                }`}>
                  {m.amount.toLocaleString("fr-FR")} F
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-cm-text-muted">
                <span className={
                  m.date === today
                    ? "text-cm-accent font-semibold"
                    : undefined
                }>
                  {new Date(m.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </span>
                <span>·</span>
                <span className={
                  m.status === "upcoming" ? "text-blue-500" :
                  m.status === "completed" ? "text-green-500" : "text-red-400"
                }>
                  {m.status === "upcoming" ? "À venir" : m.status === "completed" ? "Terminée" : "Annulée"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
