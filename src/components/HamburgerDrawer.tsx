import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft, ChevronRight, LogOut, Award, Clock, Camera, Mail, IdCard,
  UserIcon, CalendarDays, Wallet, MessageCircle, HelpCircle, Settings,
  Coins, CreditCard, Shield, Bell, Eye, Moon, Globe, Smartphone,
  KeyRound, Monitor, Trash2, Send, AlertTriangle, Info, FileText,
  Landmark, TrendingUp, MapPin, Star, BadgeCheck, Plus
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { useRequestStore } from "../stores/requestStore";

interface Props {
  open: boolean;
  onClose: () => void;
  isPro?: boolean;
  proName?: string;
  proTitle?: string;
  proAvatarUrl?: string;
  proPhone?: string;
  proCompletedSteps?: number;
  proTotalSteps?: number;
  proChecklistItems?: { label: string; done: boolean; icon: React.ComponentType<{ className?: string }> }[];
}

function MenuItem({ icon: Icon, label, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-200/50 transition-colors text-left">
      <Icon className="w-5 h-5 text-gray-900 shrink-0" />
      <span className="flex-1 text-[14px] font-medium text-gray-900">{label}</span>
      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
    </button>
  );
}

function SectionHeader({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 px-4 pt-4 pb-1">
      <span className="text-[14px]">{emoji}</span>
      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function HamburgerDrawer({ open, onClose, isPro = false, proName, proTitle, proAvatarUrl, proPhone }: Props) {
  const nav = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const setPro = useAuthStore((s) => s.setPro);
  const logout = useAuthStore((s) => s.logout);
  const drawerRef = useRef<HTMLDivElement>(null);
  const missions = useRequestStore((s) => s.missions);

  const firstName = user?.user_metadata?.firstName || user?.email?.split("@")[0] || "Utilisateur";
  const phone = user?.phone || "+225 05 64 81 72";
  const avatarUrl = user?.user_metadata?.avatarUrl || "";

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleNav = (path: string) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      onClose();
      return;
    }
    nav(path, { state: { fromHamburger: true } });
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    nav("/onboarding", { replace: true });
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {open && (
          <motion.div
            key="drawer"
            ref={drawerRef}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-full max-w-sm bg-white overflow-y-auto shadow-2xl rounded-r-[var(--radius-cm-xl)]"
          >
            <div className="relative min-h-dynamic px-4 pb-8">
              <button onClick={onClose}
                className="mt-3 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                <ArrowLeft className="w-5 h-5 text-gray-900" />
              </button>

              {isPro ? <ProMenu proName={proName || firstName} proTitle={proTitle} proAvatarUrl={proAvatarUrl} proPhone={proPhone || phone} handleNav={handleNav} handleLogout={handleLogout} /> : <ClientMenu firstName={firstName} phone={phone} avatarUrl={avatarUrl} handleNav={handleNav} handleLogout={handleLogout} setPro={setPro} missions={missions} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ShortcutIcon({ icon: Icon, label, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-transform">
      <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-900" />
      </div>
      <span className="text-[10px] font-medium text-gray-900">{label}</span>
    </button>
  );
}

function ProMenu({ proName, proTitle, proAvatarUrl, proPhone, handleNav, handleLogout }: {
  proName: string; proTitle?: string; proAvatarUrl?: string; proPhone: string;
  handleNav: (path: string) => void; handleLogout: () => void;
}) {
  return (
    <>
      <div className="flex flex-col items-center pt-2 pb-6">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-100 mb-3 flex items-center justify-center">
          {proAvatarUrl ? (
            <img src={proAvatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[24px]">🔧</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[17px] font-bold text-gray-900">{proName}</span>
          <div className="w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
            <BadgeCheck className="w-3 h-3 text-white" />
          </div>
        </div>
        {proTitle && <span className="text-[13px] font-medium text-gray-500">{proTitle}</span>}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6">
        <ShortcutIcon icon={CalendarDays} label="Missions" onClick={() => handleNav("/pro/missions")} />
        <ShortcutIcon icon={Wallet} label="Revenus" onClick={() => handleNav("/pro/revenues")} />
        <ShortcutIcon icon={HelpCircle} label="Support" onClick={() => handleNav("/pro/support")} />
        <ShortcutIcon icon={Settings} label="Paramètres" onClick={() => handleNav("/pro/settings")} />
      </div>

      <SectionHeader emoji="👤" label="Mon activité" />
      <div className="bg-gray-50 rounded-2xl overflow-hidden mb-2">
        <MenuItem icon={UserIcon} label="Modifier mon profil" onClick={() => handleNav("/profile/pro-edit")} />
        <MenuItem icon={IdCard} label="Identité professionnelle" onClick={() => handleNav("/pro/professional-identity")} />
        <MenuItem icon={Shield} label="Vérifications" onClick={() => handleNav("/profile/pro-verification")} />
        <MenuItem icon={CreditCard} label="Moyens de paiement" onClick={() => handleNav("/pro/payment-methods")} />
        <MenuItem icon={Coins} label="Retirer mes revenus" onClick={() => handleNav("/pro/withdraw")} />
      </div>

      <SectionHeader emoji="💰" label="Paiements" />
      <div className="bg-gray-50 rounded-2xl overflow-hidden mb-2">
        <MenuItem icon={Wallet} label="Portefeuille" onClick={() => handleNav("/pro/wallet")} />
        <MenuItem icon={Clock} label="Historique" onClick={() => handleNav("/pro/wallet")} />
        <MenuItem icon={TrendingUp} label="Retraits" onClick={() => handleNav("/pro/withdrawals")} />
        <MenuItem icon={Landmark} label="Comptes bancaires" onClick={() => handleNav("/pro/bank-accounts")} />
      </div>

      <SectionHeader emoji="🔔" label="Préférences" />
      <div className="bg-gray-50 rounded-2xl overflow-hidden mb-2">
        <MenuItem icon={Bell} label="Notifications" onClick={() => handleNav("/profile/pro-notifications")} />
        <MenuItem icon={Globe} label="Langue" onClick={() => handleNav("/profile/language")} />
        <MenuItem icon={Coins} label="Devise" onClick={() => handleNav("/pro/currency")} />
        <MenuItem icon={Clock} label="Fuseau horaire" onClick={() => handleNav("/pro/timezone")} />
        <MenuItem icon={Moon} label="Mode sombre" onClick={() => handleNav("/pro/appearance")} />
        <MenuItem icon={Eye} label="Confidentialité" onClick={() => handleNav("/pro/privacy")} />
      </div>

      <SectionHeader emoji="🔐" label="Compte" />
      <div className="bg-gray-50 rounded-2xl overflow-hidden mb-2">
        <MenuItem icon={Smartphone} label="Téléphone" onClick={() => handleNav("/pro/phone")} />
        <MenuItem icon={Mail} label="Adresse e-mail" onClick={() => handleNav("/pro/email")} />
        <MenuItem icon={KeyRound} label="Mot de passe" onClick={() => handleNav("/pro/security")} />
        <MenuItem icon={Shield} label="Sécurité" onClick={() => handleNav("/pro/security")} />
        <MenuItem icon={Shield} label="Authentification à deux facteurs" onClick={() => handleNav("/pro/security")} />
        <MenuItem icon={Monitor} label="Appareils connectés" onClick={() => handleNav("/pro/security")} />
        <MenuItem icon={Trash2} label="Supprimer le compte" onClick={() => handleNav("/pro/settings")} />
      </div>

      <SectionHeader emoji="🛟" label="Support" />
      <div className="bg-gray-50 rounded-2xl overflow-hidden mb-2">
        <MenuItem icon={MessageCircle} label="Aide sur une mission" onClick={() => handleNav("/pro/support")} />
        <MenuItem icon={HelpCircle} label="Questions fréquentes" onClick={() => handleNav("/pro/support")} />
        <MenuItem icon={Send} label="Contacter le support" onClick={() => handleNav("/pro/support")} />
        <MenuItem icon={AlertTriangle} label="Signaler un problème" onClick={() => handleNav("/pro/support")} />
      </div>

      <SectionHeader emoji="ℹ️" label="À propos" />
      <div className="bg-gray-50 rounded-2xl overflow-hidden mb-3">
        <MenuItem icon={Info} label="Version" onClick={() => handleNav("/pro/about")} />
        <MenuItem icon={FileText} label="Conditions d'utilisation" onClick={() => handleNav("/profile/terms")} />
        <MenuItem icon={Shield} label="Politique de confidentialité" onClick={() => handleNav("/profile/terms")} />
      </div>

      <button onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 text-red-500 text-[13px] font-medium cursor-pointer hover:bg-red-50 transition-colors">
        <LogOut className="w-4 h-4" />
        Se déconnecter
      </button>

      <div className="h-6" />
    </>
  );
}

function ClientMenu({ firstName, phone, avatarUrl, handleNav, handleLogout, setPro, missions }: {
  firstName: string; phone: string; avatarUrl: string;
  handleNav: (path: string) => void; handleLogout: () => void;
  setPro: () => void; missions: import("../types").Mission[];
}) {
  const hasPhoto = !!avatarUrl;
  const user = useAuthStore((s) => s.user);
  const hasEmail = !!user?.email_confirmed_at;
  const hasIdCard = !!user?.user_metadata?.identityVerified;
  const completedSteps = [hasPhoto, hasEmail, hasIdCard].filter(Boolean).length;
  const completedCount = missions.filter((m) => m.status === "closed").length;

  return (
    <>
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

      <div className="flex items-center justify-around mb-6">
        <ShortcutIcon icon={Clock} label="Commandes" onClick={() => handleNav("/orders")} />
        <ShortcutIcon icon={HelpCircle} label="Aide" onClick={() => handleNav("/profile/help")} />
        <ShortcutIcon icon={MapPin} label="Adresses" onClick={() => handleNav("/profile/addresses")} />
        <ShortcutIcon icon={Settings} label="Paramètres" onClick={() => handleNav("/profile/settings")} />
      </div>

      {completedSteps < 3 && (
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
      )}

      <SectionHeader emoji="👤" label="Profil" />
      <div className="bg-gray-50 rounded-2xl overflow-hidden mb-2">
        <MenuItem icon={UserIcon} label="Modifier mon profil" onClick={() => handleNav("/profile/edit")} />
        <MenuItem icon={Shield} label="Vérifications" onClick={() => handleNav("/profile/security")} />
        <MenuItem icon={MapPin} label="Mes adresses" onClick={() => handleNav("/profile/addresses")} />
      </div>

      <SectionHeader emoji="💰" label="Paiements" />
      <div className="bg-gray-50 rounded-2xl overflow-hidden mb-2">
        <MenuItem icon={CreditCard} label="Cartes & Mobile Money" onClick={() => handleNav("/profile/payments")} />
        <MenuItem icon={Clock} label="Historique" onClick={() => handleNav("/orders")} />
      </div>

      <SectionHeader emoji="🔔" label="Préférences" />
      <div className="bg-gray-50 rounded-2xl overflow-hidden mb-2">
        <MenuItem icon={Bell} label="Notifications" onClick={() => handleNav("/profile/notifications")} />
        <MenuItem icon={Globe} label="Langue" onClick={() => handleNav("/profile/language")} />
        <MenuItem icon={Moon} label="Mode sombre" onClick={() => handleNav("/profile/settings")} />
      </div>

      <SectionHeader emoji="🔐" label="Compte" />
      <div className="bg-gray-50 rounded-2xl overflow-hidden mb-2">
        <MenuItem icon={Smartphone} label="Téléphone" onClick={() => handleNav("/profile/edit")} />
        <MenuItem icon={Mail} label="Email" onClick={() => handleNav("/profile/edit")} />
        <MenuItem icon={Shield} label="Sécurité" onClick={() => handleNav("/profile/security")} />
      </div>

      <SectionHeader emoji="🛟" label="Support" />
      <div className="bg-gray-50 rounded-2xl overflow-hidden mb-3">
        <MenuItem icon={HelpCircle} label="Centre d'aide" onClick={() => handleNav("/profile/help")} />
        <MenuItem icon={MessageCircle} label="Nous contacter" onClick={() => handleNav("/profile/help")} />
      </div>

      {completedCount > 0 && (
        <button onClick={() => handleNav("/orders")}
          className="w-full mb-3 bg-gray-50 rounded-2xl flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-gray-200/50 transition-colors text-left">
          <Clock className="w-5 h-5 text-gray-900 shrink-0" />
          <span className="flex-1 text-[14px] font-medium text-gray-900">Commandes terminées</span>
          <span className="text-[11px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-full">{completedCount}</span>
          <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
        </button>
      )}

      <button onClick={() => { setPro(); handleNav("/pro/dashboard"); }}
        className="w-full mb-3 bg-gray-900 rounded-2xl flex items-center gap-3 px-4 py-4 cursor-pointer hover:opacity-90 transition-all active:scale-[0.98] text-left">
        <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center">
          <Award className="w-4 h-4 text-black" />
        </div>
        <span className="flex-1 text-[14px] font-semibold text-white">Devenir prestataire</span>
        <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
      </button>

      <button onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-200 text-red-500 text-[13px] font-medium cursor-pointer hover:bg-red-50 transition-colors">
        <LogOut className="w-4 h-4" />
        Se déconnecter
      </button>

      <div className="h-6" />
    </>
  );
}
