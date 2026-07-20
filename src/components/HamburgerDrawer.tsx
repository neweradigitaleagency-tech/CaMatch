import { useState, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import Drawer from "./drawer/Drawer";
import DrawerHeader from "./drawer/DrawerHeader";
import DrawerSection from "./drawer/DrawerSection";
import DrawerItem from "./drawer/DrawerItem";
import {
  PRO_SECTION,
  ACCOUNT_SECTION,
  SUPPORT_SECTION,
  PREFERENCES_SECTION,
  LEGAL_SECTION,
  LEGAL_STATIC_INFO,
  LOGOUT_ITEM,
} from "../data/menuConfig";

interface Props {
  open: boolean;
  onClose: () => void;
}

function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel }: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}): ReactNode {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
        <h3 className="text-[16px] font-bold text-[#2B2B2B]">{title}</h3>
        <p className="text-[13px] text-gray-500 mt-2 leading-relaxed">{message}</p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl bg-gray-100 text-[#2B2B2B] text-[14px] font-semibold active:scale-[0.98] transition-transform"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-11 rounded-xl bg-red-600 text-white text-[14px] font-semibold active:scale-[0.98] transition-transform"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HamburgerDrawer({ open, onClose }: Props) {
  const nav = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [confirmLogout, setConfirmLogout] = useState(false);

  const isPro = user?.user_metadata?.isPro || false;
  const firstName = user?.user_metadata?.firstName || user?.email?.split("@")[0] || "Utilisateur";
  const avatarUrl = user?.user_metadata?.avatarUrl || "";
  const email = user?.email || "";

  const handleNav = (path: string) => {
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      onClose();
      return;
    }
    nav(path, { state: { fromHamburger: true } });
    onClose();
  };

  const makeHandler = (route?: string, customOnClick?: () => void) => {
    if (customOnClick) {
      return () => { customOnClick(); onClose(); };
    }
    if (route) {
      return () => handleNav(route);
    }
    return undefined;
  };

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        header={
          <DrawerHeader name={firstName} email={email} avatarUrl={avatarUrl || undefined} />
        }
        footer={
          <div className="px-4 py-3">
            <DrawerItem {...LOGOUT_ITEM} onClick={() => setConfirmLogout(true)} />
            <div className="h-6" />
          </div>
        }
      >
        <div className="h-2" />

        {!isPro && (
          <DrawerSection label={PRO_SECTION.label}>
            {PRO_SECTION.items.map((item) => (
              <DrawerItem key={item.id} {...item} onClick={makeHandler(item.route, item.onClick)} />
            ))}
          </DrawerSection>
        )}

        <DrawerSection label={ACCOUNT_SECTION.label}>
          {ACCOUNT_SECTION.items.map((item) => (
            <DrawerItem key={item.id} {...item} onClick={makeHandler(item.route, item.onClick)} />
          ))}
        </DrawerSection>

        <DrawerSection label={SUPPORT_SECTION.label}>
          {SUPPORT_SECTION.items.map((item) => (
            <DrawerItem key={item.id} {...item} onClick={makeHandler(item.route, item.onClick)} />
          ))}
        </DrawerSection>

        <DrawerSection label={PREFERENCES_SECTION.label}>
          {PREFERENCES_SECTION.items.map((item) => (
            <DrawerItem key={item.id} {...item} onClick={makeHandler(item.route, item.onClick)} />
          ))}
        </DrawerSection>

        <DrawerSection label={LEGAL_SECTION.label}>
          {LEGAL_SECTION.items.map((item) => (
            <DrawerItem key={item.id} {...item} onClick={makeHandler(item.route, item.onClick)} />
          ))}
          <div className="px-4 py-3">
            <span className="text-[11px] text-gray-400">{LEGAL_STATIC_INFO.label} {LEGAL_STATIC_INFO.value}</span>
          </div>
        </DrawerSection>
      </Drawer>

      <ConfirmModal
        open={confirmLogout}
        title="Se déconnecter"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirmLabel="Se déconnecter"
        onConfirm={async () => {
          await logout();
          setConfirmLogout(false);
          onClose();
        }}
        onCancel={() => setConfirmLogout(false)}
      />
    </>
  );
}
