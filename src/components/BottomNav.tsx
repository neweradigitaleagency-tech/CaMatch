import { useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Compass, MessageSquare, Search, ClipboardList, User, type LucideIcon } from "lucide-react";

const NAV_ITEMS: { id: string; label: string; icon: LucideIcon; route: string }[] = [
  { id: "home", label: "Accueil", icon: Compass, route: "/" },
  { id: "messages", label: "Messages", icon: MessageSquare, route: "/messages" },
  { id: "search", label: "Recherche", icon: Search, route: "/search" },
  { id: "orders", label: "Commandes", icon: ClipboardList, route: "/orders" },
  { id: "profile", label: "Profil", icon: User, route: "/profile" },
];

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount?: number;
}

export default function BottomNav({ activeTab, onTabChange, unreadCount = 0 }: BottomNavProps) {
  const location = useLocation();

  const handleClick = (item: typeof NAV_ITEMS[0]) => {
    const target = item.route;
    if (item.id === "home") {
      if (location.pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
    } else if (location.pathname === target || location.pathname.startsWith(target + "/")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    onTabChange(item.id);
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-20" aria-label="Navigation principale">
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 border border-white/40 px-2 py-2 flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className="relative flex flex-col items-center justify-center py-1.5 px-3 min-w-0 active:scale-90 transition-transform duration-150"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-cm-green/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive ? "text-cm-green" : "text-secondary/60"
                    }`}
                  />
                  {unreadCount > 0 && item.id === "messages" && (
                    <span className="absolute -top-1.5 -right-2 bg-cm-error text-white text-caption font-medium min-w-[14px] h-3.5 flex items-center justify-center rounded-full px-1 leading-none shadow-sm">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-caption font-medium tracking-wide transition-colors duration-200 ${
                    isActive ? "text-cm-green font-bold" : "text-secondary/50"
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
