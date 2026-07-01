import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import type { ProApplicationStatus } from "../../types";

interface Application {
  id: string;
  name: string;
  phone: string;
  categories: string[];
  status: ProApplicationStatus;
  submittedAt: string;
  documentsCount: number;
}

const MOCK_APPLICATIONS: Application[] = [
  { id: "app1", name: "Yao Cissé", phone: "+225 07 5966 509", categories: ["Plombier", "Électricien"], status: "SUBMITTED", submittedAt: "2026-06-28T10:00:00Z", documentsCount: 3 },
  { id: "app2", name: "Fatou Sissoko", phone: "+225 07 2846 510", categories: ["Jardinage"], status: "UNDER_REVIEW", submittedAt: "2026-06-27T14:30:00Z", documentsCount: 4 },
  { id: "app3", name: "Mamadou Sylla", phone: "+225 07 4359 973", categories: ["Électricien"], status: "APPROVED", submittedAt: "2026-06-25T09:15:00Z", documentsCount: 3 },
  { id: "app4", name: "Kadiatou Doumbia", phone: "+225 07 7160 528", categories: ["Peintre", "Décoration"], status: "REJECTED", submittedAt: "2026-06-24T11:00:00Z", documentsCount: 2 },
  { id: "app5", name: "Drissa Tounkara", phone: "+225 07 6508 900", categories: ["Maçon"], status: "SUBMITTED", submittedAt: "2026-06-29T08:45:00Z", documentsCount: 3 },
];

const STATUS_CONFIG: Record<ProApplicationStatus, { label: string; color: string; bg: string; icon: any }> = {
  NOT_STARTED: { label: "Non commencé", color: "text-gray-400", bg: "bg-gray-100", icon: Clock },
  IN_PROGRESS: { label: "En cours", color: "text-blue-600", bg: "bg-blue-50", icon: Clock },
  SUBMITTED: { label: "Soumise", color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
  UNDER_REVIEW: { label: "En révision", color: "text-purple-600", bg: "bg-purple-50", icon: Eye },
  APPROVED: { label: "Approuvée", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle },
  REJECTED: { label: "Rejetée", color: "text-red-600", bg: "bg-red-50", icon: XCircle },
};

export default function AdminApplicationsPage() {
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProApplicationStatus | "all">("all");

  const filtered = MOCK_APPLICATIONS.filter((app) => {
    const matchSearch = !search || app.name.toLowerCase().includes(search.toLowerCase()) || app.phone.includes(search);
    const matchStatus = statusFilter === "all" || app.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => nav(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </button>
          <h1 className="text-[16px] font-bold text-gray-900">Candidatures Pro</h1>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 text-[13px] bg-gray-100 border border-gray-200 rounded-[12px] outline-none text-gray-900 placeholder-gray-400"
              placeholder="Rechercher..."
            />
          </div>
          <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar">
            {(["all", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  statusFilter === s
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s === "all" ? "Tous" : STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-2">
        {filtered.map((app) => {
          const cfg = STATUS_CONFIG[app.status];
          const Icon = cfg.icon;
          const daysAgo = Math.floor((Date.now() - new Date(app.submittedAt).getTime()) / 86400000);
          return (
            <div
              key={app.id}
              onClick={() => nav(`/admin/applications/${app.id}`)}
              className="bg-white border border-gray-200 rounded-[14px] p-4 cursor-pointer hover:border-gray-300 transition-all active:scale-[0.99]"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-[14px] font-bold text-gray-900">{app.name}</h3>
                  <p className="text-[12px] text-gray-500">{app.phone}</p>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${cfg.bg} ${cfg.color}`}>
                  <Icon className="w-3 h-3" />
                  {cfg.label}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-400">
                <span>{app.categories.join(", ")}</span>
                <span>·</span>
                <span>{app.documentsCount} docs</span>
                <span>·</span>
                <span>Il y a {daysAgo || 1}j</span>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[13px] text-gray-400">
            Aucune candidature trouvée
          </div>
        )}
      </div>
    </div>
  );
}
