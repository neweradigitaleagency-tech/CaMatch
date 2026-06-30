import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Settings, HelpCircle, MapPin, CreditCard, Shield, LogOut, ChevronRight, Star, Award, Camera } from "lucide-react";
import { useAuthStore } from "../stores/authStore";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function HamburgerDrawer({ open, onClose }: Props) {
  const nav = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const drawerRef = useRef<HTMLDivElement>(null);

  const firstName = user?.user_metadata?.firstName || user?.email?.split("@")[0] || "Utilisateur";
  const avatarUrl = user?.user_metadata?.avatarUrl || "";

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleNav = (path: string) => {
    nav(path);
    onClose();
  };

  const menuItems = [
    { icon: MapPin, label: "Mes adresses", desc: "Gérer mes adresses", path: "/profile/addresses" },
    { icon: CreditCard, label: "Paiements", desc: "Moyens de paiement", path: "/profile/payments" },
    { icon: Shield, label: "Sécurité", desc: "Mot de passe, 2FA, PIN", path: "/profile/security" },
    { icon: Settings, label: "Paramètres", desc: "Dark mode, langue, notifications", path: "/profile/settings" },
    { icon: HelpCircle, label: "Aide", desc: "FAQ, support", path: "/profile/help" },
    { icon: Star, label: "Évaluer l'application", desc: "Donnez votre avis", path: "" },
  ];

  const handleLogout = async () => {
    await logout();
    nav("/onboarding", { replace: true });
  };

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
          <div className="max-w-md mx-auto relative min-h-screen">
            {/* Close button */}
            <button onClick={onClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
              <X className="w-4 h-4 text-gray-600" />
            </button>

            {/* Profile section */}
            <div className="pt-14 pb-4 px-5 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
              <div className="relative group w-16 h-16 mx-auto mb-2">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[28px] font-bold text-gray-400">
                      {firstName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-[18px] font-bold text-gray-900 text-center">{firstName}</p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[11px] font-medium text-green-600">En ligne</span>
              </div>
              <button onClick={() => handleNav("/profile/edit")}
                className="w-full mt-2 py-2 bg-gray-900 text-white text-[11px] font-semibold rounded-full cursor-pointer hover:opacity-90 transition-all active:scale-[0.97]">
                Modifier le profil
              </button>
            </div>

            {/* Menu items */}
            <div className="px-3 pt-3 pb-2">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-1">Menu</p>
              <div className="space-y-0.5">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNav(item.path)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[13px] font-medium text-gray-900">{item.label}</span>
                      {item.desc && <p className="text-[10px] text-gray-400">{item.desc}</p>}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 mx-5" />

            {/* Secondary items */}
            <div className="px-3 pt-2 pb-2">
              <button
                onClick={() => handleNav("/pro/onboarding")}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-gray-900">Devenir prestataire</span>
                  <p className="text-[10px] text-gray-400">Gagnez de l'argent avec vos compétences</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
              </button>
            </div>

            {/* Logout */}
            <div className="px-3 mt-2 mb-12">
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-500 text-[12px] font-medium cursor-pointer hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
