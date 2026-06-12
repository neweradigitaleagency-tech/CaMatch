"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Bell, Shield, Globe, LogOut, Trash2, Camera, MapPin, Star, CheckCircle2, Heart, ChevronDown } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { BadgeLevel, VerificationBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Mission {
  id: string;
  status: string;
  service: string;
  description: string | null;
  createdAt: string;
  pro?: { profile?: { firstName?: string; lastName?: string; avatarUrl?: string } };
  client?: { profile?: { firstName?: string; lastName?: string; avatarUrl?: string } };
}

interface ProResult {
  id: string;
  name: string | null;
  profession: string | null;
  rating: number;
  avatarUrl: string | null;
  badge: string;
}

export default function ProfilePage() {
  const [role, setRole] = useState<"client" | "pro">("client");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [pros, setPros] = useState<ProResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pendingMissions, setPendingMissions] = useState<Mission[]>([]);

  const demoId = "0195e7f8-3d78-7fd7-9acb-881faa4a225c";

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const [missionsRes, prosRes] = await Promise.all([
          fetch(`/api/missions?userId=${demoId}&role=pro`),
          fetch("/api/pros?sort=note"),
        ]);
        const mData = await missionsRes.json();
        const pData = await prosRes.json();
        if (!cancelled) {
          setMissions(mData.missions || []);
          setPendingMissions((mData.missions || []).filter((m: Mission) => m.status === "PENDING"));
          setPros((pData.pros || []).slice(0, 4));
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const handleMissionAction = (missionId: string) => {
    setPendingMissions((prev) => prev.filter((m) => m.id !== missionId));
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; class: string }> = {
      PENDING: { label: "🟡 En attente", class: "bg-amber-50 text-amber-700" },
      ACTIVE: { label: "🔵 En cours", class: "bg-blue-50 text-blue-700" },
      COMPLETED: { label: "🟢 Terminée", class: "bg-green-50 text-green-700" },
      CANCELLED: { label: "⛔ Annulée", class: "bg-red-50 text-red-700" },
    };
    const s = map[status] || { label: status, class: "bg-gray-50 text-gray-600" };
    return <span className={cn("text-2xs font-semibold px-2.5 py-1 rounded-full", s.class)}>{s.label}</span>;
  };

  const settingsSections = [
    {
      title: "Compte",
      items: [
        { icon: Bell, label: "Notifications" },
        { icon: Globe, label: "Langue", value: "Français" },
        { icon: Shield, label: "Vérification d'identité" },
        { icon: LogOut, label: "Se déconnecter", danger: true },
        { icon: Trash2, label: "Supprimer mon compte", danger: true },
      ],
    },
  ];

  return (
    <main className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-lg mx-auto flex items-center justify-between h-14 px-4">
          <h1 className="text-lg font-bold text-text-primary">Profil</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-6">
        {/* Identity Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-6 bg-white rounded-2xl border border-gray-100 shadow-soft"
        >
          <div className="relative mb-4">
            <Avatar size="xl" alt="Vous" />
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full border-2 border-white flex items-center justify-center text-white shadow-soft">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-xl font-extrabold text-text-primary">Vous</h2>
          <p className="text-sm text-text-secondary">+225 01 02 03 04 05</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center gap-1 text-xs text-text-secondary">
              <MapPin className="w-3 h-3" />
              Cocody, Abidjan
            </span>
          </div>
          <p className="text-xs text-text-tertiary mt-1">Membre depuis 2026</p>
          <button className="mt-3 text-xs text-primary font-medium">Modifier mon profil</button>
        </motion.div>

        {/* Role Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gray-50 rounded-2xl p-1.5 flex"
        >
          <button
            onClick={() => setRole("client")}
            className={cn("flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200", role === "client" ? "bg-white text-text-primary shadow-soft" : "text-text-secondary")}
          >
            👤 Client
          </button>
          <button
            onClick={() => setRole("pro")}
            className={cn("flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200", role === "pro" ? "bg-white text-text-primary shadow-soft" : "text-text-secondary")}
          >
            🛠️ Professionnel
          </button>
        </motion.div>

        {/* ─── CLIENT DASHBOARD ─── */}
        {role === "client" && (
          <>
            {/* Mes Missions */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
              <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Mes Missions
              </h3>
              {loading ? (
                <div className="space-y-2">{[...Array(2)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
              ) : missions.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <p className="text-sm text-text-secondary">Vous n&apos;avez pas encore fait de demande.</p>
                  <a href="/search" className="mt-2 inline-block text-sm text-primary font-medium">Trouvez votre premier pro →</a>
                </div>
              ) : (
                <div className="space-y-2">
                  {missions.map((m) => (
                    <div key={m.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-soft">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" alt={m.pro?.profile?.firstName || "Pro"} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text-primary truncate">{m.service}</p>
                          <p className="text-xs text-text-secondary truncate">{m.pro?.profile?.firstName} {m.pro?.profile?.lastName}</p>
                        </div>
                        {statusBadge(m.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Mes Pros Favoris */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                Mes Pros Favoris
              </h3>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {pros.map((pro) => (
                  <a
                    key={pro.id}
                    href={`/pro/${pro.id}`}
                    className="flex-shrink-0 w-36 bg-white rounded-2xl border border-gray-100 p-3 text-center shadow-soft hover:shadow-card transition-all"
                  >
                    <div className="flex justify-center mb-2">
                      <Avatar size="md" src={pro.avatarUrl} alt={pro.name || ""} />
                    </div>
                    <p className="text-xs font-semibold text-text-primary truncate">{pro.name}</p>
                    <p className="text-2xs text-text-secondary truncate">{pro.profession}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-2xs font-semibold">{pro.rating?.toFixed(1)}</span>
                    </div>
                    <button className="mt-2 text-2xs bg-primary text-white px-3 py-1 rounded-full font-medium w-full">
                      Contacter
                    </button>
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Paramètres */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="w-full flex items-center justify-between py-3 text-sm font-bold text-text-primary"
              >
                Paramètres
                <ChevronDown className={cn("w-4 h-4 transition-transform", settingsOpen && "rotate-180")} />
              </button>
              {settingsOpen && (
                <div className="space-y-2">
                  {settingsSections.map((section) => (
                    <div key={section.title} className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 shadow-soft">
                      {section.items.map((item) => (
                        <button key={item.label} className={cn("w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors text-left")}>
                          <item.icon className={cn("w-5 h-5", item.danger ? "text-red-500" : "text-text-tertiary")} />
                          <span className={cn("flex-1 text-sm", item.danger ? "text-red-500 font-medium" : "text-text-primary")}>{item.label}</span>
                          {item.value && <span className="text-xs text-text-tertiary">{item.value}</span>}
                          <ChevronRight className="w-4 h-4 text-text-tertiary" />
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}

        {/* ─── PRO DASHBOARD ─── */}
        {role === "pro" && (
          <>
            {/* Pro Identity */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <Avatar size="lg" alt="Vous" verified />
                <div>
                  <h3 className="font-bold text-text-primary">Kouamé Jean</h3>
                  <p className="text-xs text-text-secondary">Électricien</p>
                  <div className="flex items-center gap-2 mt-1">
                    <VerificationBadge />
                    <BadgeLevel level="GOLD" />
                  </div>
                </div>
              </div>
              {/* Availability Toggle */}
              <div className="mt-4 flex items-center justify-between bg-green-50 rounded-xl px-4 py-3">
                <span className="text-sm font-semibold text-green-700 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  Disponible maintenant
                </span>
                <button className="w-10 h-6 bg-green-500 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow" />
                </button>
              </div>
            </motion.div>

            {/* Trust Score */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-soft text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center mx-auto mb-3">
                <div className="w-20 h-20 rounded-full bg-white flex flex-col items-center justify-center">
                  <span className="text-xl font-extrabold text-text-primary">847</span>
                  <span className="text-2xs text-text-tertiary">SCORE</span>
                </div>
              </div>
              <BadgeLevel level="GOLD" />
              <p className="text-xs text-text-secondary mt-2">Il te manque 3 missions pour passer Élite</p>
              <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: "70%" }} />
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
              <h3 className="text-sm font-bold text-text-primary mb-3">Mes Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "👁️", label: "Vues du profil", value: "—" },
                  { icon: "📋", label: "Demandes reçues", value: String(pendingMissions.length) },
                  { icon: "✅", label: "Missions terminées", value: String(missions.filter((m) => m.status === "COMPLETED").length) },
                  { icon: "⭐", label: "Note moyenne", value: "4.8" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-soft text-center">
                    <span className="text-lg block mb-1">{stat.icon}</span>
                    <p className="text-lg font-extrabold text-text-primary">{stat.value}</p>
                    <p className="text-2xs text-text-secondary">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pending Missions */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <h3 className="text-sm font-bold text-text-primary mb-3">Demandes en attente</h3>
              {pendingMissions.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                  <p className="text-sm text-text-secondary">Aucune demande pour le moment. Assurez-vous d&apos;être disponible !</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingMissions.map((m) => (
                    <div key={m.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-soft">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar size="sm" alt="Client" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text-primary">{m.service}</p>
                          <p className="text-xs text-text-secondary">{m.client?.profile?.firstName} {m.client?.profile?.lastName}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleMissionAction(m.id)} className="flex-1 bg-green-500 text-white text-sm font-semibold py-2.5 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1">
                          ✓ Accepter
                        </button>
                        <button onClick={() => handleMissionAction(m.id)} className="flex-1 bg-gray-100 text-text-secondary text-sm font-medium py-2.5 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1">
                          ✗ Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Mon Profil Public Preview */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-4 border border-primary-200">
              <p className="text-sm font-bold text-text-primary mb-1">Mon Profil Public</p>
              <p className="text-xs text-text-secondary mb-3">Aperçu de l&apos;apparence de votre profil aux clients</p>
              <div className="flex gap-2">
                <a href={`/pro/${demoId}`} target="_blank" className="flex-1 bg-primary text-white text-sm font-semibold py-2.5 rounded-xl text-center active:scale-95 transition-all">
                  Voir comme un client →
                </a>
                <a href="/profile/edit" className="flex-1 bg-white text-text-primary text-sm font-medium py-2.5 rounded-xl border border-gray-200 text-center active:scale-95 transition-all">
                  Modifier mon profil →
                </a>
              </div>
            </motion.div>

            {/* Paramètres */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="w-full flex items-center justify-between py-3 text-sm font-bold text-text-primary"
              >
                Paramètres
                <ChevronDown className={cn("w-4 h-4 transition-transform", settingsOpen && "rotate-180")} />
              </button>
              {settingsOpen && (
                <div className="space-y-2">
                  {settingsSections.map((section) => (
                    <div key={section.title} className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 shadow-soft">
                      {section.items.map((item) => (
                        <button key={item.label} className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors text-left">
                          <item.icon className={cn("w-5 h-5", item.danger ? "text-red-500" : "text-text-tertiary")} />
                          <span className={cn("flex-1 text-sm", item.danger ? "text-red-500 font-medium" : "text-text-primary")}>{item.label}</span>
                          {item.value && <span className="text-xs text-text-tertiary">{item.value}</span>}
                          <ChevronRight className="w-4 h-4 text-text-tertiary" />
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}

        <p className="text-center text-2xs text-text-tertiary pb-4">
          &Ccedil;a Match v1.0 MVP &middot; C&ocirc;te d&apos;Ivoire
        </p>
      </div>
    </main>
  );
}