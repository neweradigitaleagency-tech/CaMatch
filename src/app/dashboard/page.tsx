"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Settings, Briefcase, Plus, Calendar, Target, Camera, TrendingUp, ChevronRight, Bell, Star, CheckCircle2, DollarSign, Clock, UserCheck, Zap, Share2, BarChart3, MapPin, ShieldCheck, Image as ImageIcon } from "lucide-react";
import { TrustScoreBar } from "@/components/ui/trust-score-bar";
import { BadgeLevel } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { LoginGate } from "@/components/shared/login-gate";

type Tab = "semaine" | "mois" | "tout";
type DayStatus = "dispo" | "indispo";

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const quickActions = [
  { label: "Ajouter une photo", icon: ImageIcon, color: "bg-blue-50 text-blue-600", action: "photo" },
  { label: "Partager mon profil", icon: Share2, color: "bg-green-50 text-green-600", action: "share" },
  { label: "Voir les stats", icon: BarChart3, color: "bg-purple-50 text-purple-600", action: "stats" },
  { label: "Modifier mes tarifs", icon: DollarSign, color: "bg-amber-50 text-amber-600", action: "pricing" },
];

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    let start = 0;
    const duration = 600;
    const step = Math.max(1, Math.ceil(value / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return <>{display.toLocaleString()}{suffix}</>;
}

export default function DashboardPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Tab>("semaine");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [schedule, setSchedule] = useState<Record<string, DayStatus>>(
    Object.fromEntries(DAYS.map((d, i) => [d, i < 5 ? "dispo" : "indispo"] as const))
  );
  const [editingSchedule, setEditingSchedule] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchMissions = async () => {
      try {
        const res = await fetch("/api/missions?userId=demo-pro-id&role=pro");
        const data = await res.json();
        if (!cancelled) setMissions(data.missions ?? []);
      } catch (err) {
        console.error("Failed to fetch missions:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMissions();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const demo = [
      { id: "1", text: "Nouvelle demande : Ménage à Cocody", time: "Il y a 5 min", type: "demande" as const, read: false },
      { id: "2", text: "Avis reçu : ⭐⭐⭐⭐⭐", time: "Il y a 2h", type: "avis" as const, read: false },
      { id: "3", text: "Mission complétée : Installation à Riviera", time: "Hier", type: "mission" as const, read: true },
    ];
    setNotifications(demo);
  }, []);

  const missionCount = missions.length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const completedCount = missions.filter((m: any) => m.status === "completed").length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeCount = missions.filter((m: any) => m.status === "active" || m.status === "pending").length;
  const revenue = completedCount * 45000;
  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const responseRate = 94;

  const stats = [
    { label: "Terminées", value: completedCount, icon: CheckCircle2, color: "bg-blue-50 text-blue-600", suffix: "" },
    { label: "Actives", value: activeCount, icon: Zap, color: "bg-green-50 text-green-600", suffix: "" },
    { label: "Revenus", value: revenue, icon: DollarSign, color: "bg-amber-50 text-amber-600", suffix: " FCFA" },
    { label: "Note", value: 4.8, icon: Star, color: "bg-purple-50 text-purple-600", suffix: "/5", decimal: true },
  ];

  const toggleDay = useCallback((day: string) => {
    setSchedule((prev) => ({ ...prev, [day]: prev[day] === "dispo" ? "indispo" : "dispo" }));
  }, []);

  const handleAction = useCallback((action: string) => {
    const msgs: Record<string, string> = {
      photo: "Ajout de photos bientôt disponible",
      share: "Lien copié !",
      stats: "Statistiques détaillées bientôt disponibles",
      pricing: "Modification des tarifs bientôt disponible",
    };
    alert(msgs[action] || "Bientôt disponible");
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentMissions = missions.slice(0, 4);

  return (
    <LoginGate requiredRole="pro">
    <main className="min-h-screen pb-24 md:pb-12">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <Link href="/profile" className="relative group">
            <Avatar size="md" alt="Kouamé Jean" verified />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
          </Link>
          <div>
            <h1 className="text-lg lg:text-2xl font-bold text-text-primary">Bonjour, Kouamé</h1>
            <p className="text-xs text-text-secondary flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Cocody, Abidjan
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotifPanel(!showNotifPanel)}
            className="btn-ghost p-2 relative"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-danger text-white text-2xs font-bold rounded-full flex items-center justify-center">
                {unreadNotifs}
              </span>
            )}
          </button>
          <button className="btn-ghost p-2">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-5 lg:space-y-0">
        <div className="lg:col-span-2 space-y-5 lg:space-y-6">

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-text-primary">Aperçu</h2>
              </div>
              <div className="flex gap-1 bg-gray-100 rounded-xl p-0.5">
                {(["semaine", "mois", "tout"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setPeriod(t)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-2xs font-medium transition-all",
                      period === t ? "bg-white text-text-primary shadow-soft" : "text-text-tertiary hover:text-text-secondary"
                    )}
                  >
                    {t === "semaine" ? "7j" : t === "mois" ? "30j" : "Tout"}
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-xl mx-auto mb-2" />
                    <div className="h-6 bg-gray-200 rounded w-12 mx-auto mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-14 mx-auto" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map((stat) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-gray-50 rounded-xl p-4 text-center hover:shadow-soft transition-shadow cursor-default"
                  >
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2", stat.color)}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xl font-extrabold text-text-primary block">
                      <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                    </span>
                    <span className="text-2xs text-text-secondary">{stat.label}</span>
                  </motion.div>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center gap-1.5 text-2xs text-text-tertiary">
              <Clock className="w-3 h-3" />
              Réponse moyenne : <span className="font-semibold text-text-primary">{responseRate}%</span>
              <span className="mx-1">·</span>
              <UserCheck className="w-3 h-3" />
              Taux d&apos;acceptation : <span className="font-semibold text-text-primary">88%</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-text-primary">Missions récentes</h2>
              </div>
              <button onClick={() => alert("Toutes les missions bientôt disponible")} className="text-xs text-primary font-medium flex items-center gap-0.5">
                Voir tout <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse flex gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentMissions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-text-primary mb-1">Aucune mission pour l&apos;instant</p>
                <p className="text-xs text-text-secondary">Les missions apparaîtront ici quand des clients vous contacteront</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentMissions.map((m, i) => {
                  const isCompleted = m.status === "completed";
                  const statusColors = isCompleted ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700";
                  const statusLabel = isCompleted ? "Terminée" : "En cours";
                  return (
                    <motion.div
                      key={m.id || i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      whileHover={{ scale: 1.005 }}
                      className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-soft transition-all cursor-default"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", statusColors)}>
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text-primary">{m.title || "Mission sans titre"}</p>
                          <p className="text-xs text-text-secondary">Client · {m.createdAt || "Date inconnue"}</p>
                        </div>
                        <span className={cn("text-2xs font-semibold px-2.5 py-1 rounded-full", statusColors)}>
                          {statusLabel}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-bold text-text-primary">Notifications</h2>
                {unreadNotifs > 0 && (
                  <span className="bg-accent text-white text-2xs font-bold px-1.5 py-0.5 rounded-full">
                    {unreadNotifs}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowNotifPanel(!showNotifPanel)}
                className="text-xs text-primary font-medium"
              >
                {showNotifPanel ? "Réduire" : "Tout voir"}
              </button>
            </div>
            {notifications.length === 0 ? (
              <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
                <p className="text-xs text-text-tertiary">Aucune notification</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl transition-colors",
                      n.read ? "bg-white border border-gray-100" : "bg-primary-50/30 border border-primary-100"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                      n.type === "demande" ? "bg-blue-50 text-blue-600" :
                      n.type === "avis" ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
                    )}>
                      {n.type === "demande" ? <Bell className="w-4 h-4" /> :
                       n.type === "avis" ? <Star className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm", n.read ? "text-text-primary" : "font-semibold text-text-primary")}>
                        {n.text}
                      </p>
                      <span className="text-xs text-text-tertiary">{n.time}</span>
                    </div>
                    {!n.read && <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <div className="space-y-5 lg:space-y-6">

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.02 }}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-soft"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Confiance
              </h3>
              <button onClick={() => alert("Détail du score bientôt disponible")} className="text-2xs text-primary font-medium">
                Détail
              </button>
            </div>
            <TrustScoreBar score={847} size="lg" />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <BadgeLevel level="GOLD" />
                <span className="text-xs text-text-secondary">Or · 847 pts</span>
              </div>
              <span className="text-2xs text-text-tertiary">
                +12 pts ce mois
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-2 gap-2">
              {[
                { label: "Avis positifs", value: "24" },
                { label: "Missions", value: String(missionCount) },
                { label: "Réponse", value: `${responseRate}%` },
                { label: "Vérifié", value: "Oui" },
              ].map((item) => (
                <div key={item.label} className="text-center p-1.5 bg-gray-50 rounded-lg">
                  <span className="text-xs font-bold text-text-primary block">{item.value}</span>
                  <span className="text-2xs text-text-tertiary">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-bold text-text-primary">Actions rapides</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((a) => (
                <motion.button
                  key={a.action}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAction(a.action)}
                  className="bg-white rounded-xl p-3 border border-gray-100 hover:shadow-soft transition-all text-left"
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", a.color)}>
                    <a.icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-text-primary">{a.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-soft"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-text-primary">Disponibilité</h2>
              </div>
              <button
                onClick={() => setEditingSchedule(!editingSchedule)}
                className="text-xs text-primary font-medium"
              >
                {editingSchedule ? "Enregistrer" : "Modifier"}
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {DAYS.map((d) => {
                const isDispo = schedule[d] === "dispo";
                return (
                  <button
                    key={d}
                    onClick={() => editingSchedule && toggleDay(d)}
                    className={cn(
                      "flex-shrink-0 w-12 text-center p-2 rounded-xl transition-all duration-200",
                      isDispo ? "bg-primary-50 text-primary-700" : "bg-gray-100 text-text-tertiary",
                      editingSchedule && "cursor-pointer ring-2 ring-offset-1",
                      editingSchedule && isDispo && "ring-primary/30",
                      editingSchedule && !isDispo && "ring-gray-300"
                    )}
                  >
                    <span className="text-2xs font-medium block">{d}</span>
                    <div className={cn("w-2 h-2 rounded-full mx-auto mt-1 transition-colors", isDispo ? "bg-primary" : "bg-gray-300")} />
                  </button>
                );
              })}
            </div>
            {editingSchedule && (
              <p className="text-2xs text-text-tertiary text-center mt-2">Cliquez sur un jour pour modifier</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-soft"
          >
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold text-text-primary">Portfolio</h2>
            </div>
            {missionCount > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
                      <Camera className="w-5 h-5 text-text-tertiary" />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleAction("photo")}
                  className="w-full text-xs text-primary font-medium flex items-center justify-center gap-1 py-2 hover:bg-primary-50 rounded-xl transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  Ajouter des photos
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <ImageIcon className="w-5 h-5 text-text-tertiary" />
                </div>
                <p className="text-xs text-text-secondary mb-2">Ajoutez vos premières photos de chantier</p>
                <button
                  onClick={() => handleAction("photo")}
                  className="bg-primary text-white text-xs font-medium px-4 py-2 rounded-xl inline-flex items-center gap-1 active:scale-95 transition-transform"
                >
                  <Plus className="w-3 h-3" />
                  Ajouter
                </button>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-5 text-white"
          >
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5" />
              <h3 className="font-bold">Objectifs</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">Passer Platine</span>
                <span className="text-2xs text-white/60">Or → Platine</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((missionCount / 15) * 100, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-white/70">
                <span><strong>{missionCount}</strong>/15 missions</span>
                <span>💎 Platine</span>
              </div>
              <div className="mt-2 pt-2 border-t border-white/20 text-xs text-white/70 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Avis 5★</span>
                  <span>12/20</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white/60 rounded-full" style={{ width: "60%" }} />
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-white/20 text-xs text-white/70 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Complétion profil</span>
                  <span>70%</span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white/60 rounded-full" style={{ width: "70%" }} />
                </div>
                <p className="text-2xs text-white/50 mt-1">Ajoutez votre photo et vos tarifs pour atteindre 100%</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20 flex gap-2">
              <button onClick={() => handleAction("photo")} className="flex-1 text-xs bg-white/20 hover:bg-white/30 rounded-xl py-2 font-medium transition-colors">
                Compléter
              </button>
              <button onClick={() => alert("Objectifs détaillés bientôt disponibles")} className="flex-1 text-xs bg-white/20 hover:bg-white/30 rounded-xl py-2 font-medium transition-colors">
                Détails
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </main>
    </LoginGate>
  );
}
