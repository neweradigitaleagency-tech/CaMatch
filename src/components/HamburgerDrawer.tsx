import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Settings, HelpCircle, MapPin, CreditCard, Shield, LogOut, ChevronRight, Award, Clock, BadgeCheck, Camera, Mail, IdCard } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useRequestStore } from "../stores/requestStore";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function HamburgerDrawer({ open, onClose }: Props) {
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const drawerRef = useRef<HTMLDivElement>(null);
  const missions = useRequestStore((s) => s.missions);
  const completedCount = missions.filter((m) => m.status === "closed").length;

  const firstName = user?.user_metadata?.firstName || user?.email?.split("@")[0] || "Utilisateur";
  const phone = user?.phone || "+225 05 64 81 72";
  const avatarUrl = user?.user_metadata?.avatarUrl || "";
  const hasPhoto = !!avatarUrl;
  const hasEmail = !!user?.email_confirmed_at;
  const hasIdCard = !!user?.user_metadata?.identityVerified;
  const completedSteps = [hasPhoto, hasEmail, hasIdCard].filter(Boolean).length;

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleNav = (path: string) => {
    nav(path, { state: { fromHamburger: true } });
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    nav("/onboarding", { replace: true });
  };

  const quickIcons = [
    { icon: Clock, label: "Commandes", path: "/orders" },
    { icon: HelpCircle, label: "Aide", path: "/profile/help" },
    { icon: MapPin, label: "Adresses", path: "/profile/addresses" },
    { icon: Settings, label: "Paramètres", path: "/profile/settings" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={drawerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-white overflow-y-auto"
        >
          <div className="max-w-md mx-auto relative min-h-screen px-4 pb-8">
            {/* Back button - Yango style */}
            <button onClick={onClose}
              className="mt-3 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5 text-gray-900" />
            </button>

            {/* Profile section - Yango style */}
            <div className="flex flex-col items-center pt-2 pb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-100 mb-3 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[24px]">🐻</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[17px] font-bold text-gray-900">{firstName}</span>
                <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                  <BadgeCheck className="w-3 h-3 text-white" />
                </div>
              </div>
              <span className="text-[14px] text-gray-400 mt-0.5">{phone}</span>
            </div>

            {/* 4 icons row - Yango style */}
            <div className="flex items-center justify-around mb-6">
              {quickIcons.map((item) => (
                <button key={item.label} onClick={() => handleNav(item.path)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-all">
                  <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-gray-900" />
                  </div>
                  <span className="text-[11px] font-medium text-gray-900">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Complétez votre profil */}
            <div className="mb-4 p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-bold text-gray-900 uppercase tracking-wide">Complétez votre profil</span>
              </div>
              <div className="flex gap-1 mb-2">
                {[hasPhoto, hasEmail, hasIdCard].map((done, i) => (
                  <div key={i} className={`flex-1 h-1.5 rounded-full ${done ? "bg-gray-900" : "bg-gray-200"}`} />
                ))}
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[12px] font-semibold text-gray-900">{completedSteps} sur 3</span>
                {completedSteps === 3 && (
                  <span className="text-[12px] font-semibold text-gray-900">Terminé</span>
                )}
              </div>
              <div className="space-y-2">
                <div className={`rounded-xl p-3 flex items-center gap-3 ${hasPhoto ? "bg-white/60" : "bg-white shadow-sm"}`}>
                  <Camera className={`w-5 h-5 ${hasPhoto ? "text-gray-400" : "text-gray-900"}`} />
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-gray-900">Ajouter une photo</p>
                    <p className="text-[11px] text-gray-400">Visible par les prestataires</p>
                  </div>
                  {hasPhoto && <BadgeCheck className="w-4 h-4 text-gray-900 shrink-0" />}
                </div>
                <div className={`rounded-xl p-3 flex items-center gap-3 ${hasEmail ? "bg-white/60" : "bg-white shadow-sm"}`}>
                  <Mail className={`w-5 h-5 ${hasEmail ? "text-gray-400" : "text-gray-900"}`} />
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-gray-900">Vérifier votre email</p>
                    <p className="text-[11px] text-gray-400">Recevez les confirmations</p>
                  </div>
                  {hasEmail && <BadgeCheck className="w-4 h-4 text-gray-900 shrink-0" />}
                </div>
                <div className={`rounded-xl p-3 flex items-center gap-3 ${hasIdCard ? "bg-white/60" : "bg-white shadow-sm"}`}>
                  <IdCard className={`w-5 h-5 ${hasIdCard ? "text-gray-400" : "text-gray-900"}`} />
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-gray-900">Vérifier votre identité</p>
                    <p className="text-[11px] text-gray-400">Carte d'identité ou passeport</p>
                  </div>
                  {hasIdCard && <BadgeCheck className="w-4 h-4 text-gray-900 shrink-0" />}
                </div>
              </div>
            </div>

            {/* Paiements & Sécurité */}
            <div className="bg-gray-50 rounded-2xl overflow-hidden mb-3">
              <button onClick={() => handleNav("/profile/payments")}
                className="w-full flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-200/50 transition-colors text-left">
                <CreditCard className="w-5 h-5 text-gray-900 shrink-0" />
                <span className="flex-1 text-[14px] font-medium text-gray-900">Paiements</span>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </button>
              <button onClick={() => handleNav("/profile/security")}
                className="w-full flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-200/50 transition-colors text-left border-t border-gray-100">
                <Shield className="w-5 h-5 text-gray-900 shrink-0" />
                <span className="flex-1 text-[14px] font-medium text-gray-900">Sécurité</span>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </button>
            </div>

            {/* Commandes section - shows completed missions */}
            {completedCount > 0 && (
              <button onClick={() => handleNav("/orders")}
                className="w-full mb-3 bg-gray-50 rounded-2xl flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-200/50 transition-colors text-left">
                <Clock className="w-5 h-5 text-gray-900 shrink-0" />
                <span className="flex-1 text-[14px] font-medium text-gray-900">Commandes terminées</span>
                <span className="text-[11px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-full">{completedCount}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </button>
            )}



            {/* Devenir prestataire */}
            <button onClick={() => handleNav("/pro/onboarding")}
              className="w-full mb-3 bg-gray-900 rounded-2xl flex items-center gap-3 px-4 py-4 cursor-pointer hover:opacity-90 transition-all active:scale-[0.98] text-left">
              <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center">
                <Award className="w-4 h-4 text-black" />
              </div>
              <span className="flex-1 text-[14px] font-semibold text-white">Devenir prestataire</span>
              <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
            </button>

            {/* Logout */}
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 text-red-500 text-[13px] font-medium cursor-pointer hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" />
              Se déconnecter
            </button>

            <div className="h-6" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
