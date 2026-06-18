import { motion } from "motion/react";
import { Compass, ClipboardList, MessageSquare, User, LayoutDashboard, Calendar, DollarSign, type LucideIcon } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const CLIENT_NAV: NavItem[] = [
  { id: "explorer", label: "Explorer", icon: Compass },
  { id: "requests", label: "Demandes", icon: ClipboardList },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "profile", label: "Profil", icon: User },
];

const PRO_NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "planning", label: "Planning", icon: Calendar },
  { id: "finance", label: "Finance", icon: DollarSign },
  { id: "profile", label: "Profil", icon: User },
];

interface BottomNavProps {
  role: "client" | "pro";
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNav({ role, activeTab, onTabChange }: BottomNavProps) {
  const items = role === "client" ? CLIENT_NAV : PRO_NAV;

  return (
    <nav className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-20">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_4px_30px_rgba(11,19,14,0.12)] border border-pale-mint/30 px-2 py-2 flex items-center justify-around">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="relative flex flex-col items-center justify-center py-1.5 px-3 min-w-0 active:scale-90 transition-transform duration-150"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-pale-mint rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div className={`relative z-10 flex flex-col items-center gap-0.5`}>
                <Icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive ? "text-brand-forest" : "text-secondary/60"
                  }`}
                />
                <span
                  className={`text-[9px] font-bold tracking-wide transition-colors duration-200 ${
                    isActive ? "text-brand-forest" : "text-secondary/50"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
