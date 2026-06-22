import { useLocation } from "react-router-dom";

const BASE_NAV = [
  { id: "home", label: "Accueil", icon: "🏠", route: "/" },
  { id: "messages", label: "Messages", icon: "📥", route: "/messages" },
  { id: "search", label: "Recherche", icon: "🔍", route: "/search" },
  { id: "profile", label: "Profil", icon: "👤", route: "/profile" },
];

const CLIENT_NAV = { id: "orders", label: "Commandes", icon: "🗒️", route: "/orders" };
const PRO_NAV = { id: "dashboard", label: "Dashboard", icon: "📊", route: "/orders" };

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount?: number;
  isPro?: boolean;
}

export default function BottomNav({ activeTab, onTabChange, unreadCount = 0, isPro = false }: BottomNavProps) {
  const location = useLocation();

  const navItems = [
    ...BASE_NAV.slice(0, 3),
    isPro ? PRO_NAV : CLIENT_NAV,
    ...BASE_NAV.slice(3),
  ];

  const handleClick = (item: typeof navItems[0]) => {
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
      <div className="bg-[rgba(255,255,255,0.70)] backdrop-blur-[20px] rounded-[20px] shadow-[0_8px_32px_rgba(45,106,79,0.10)] border border-[rgba(255,255,255,0.35)] px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className="relative flex flex-col items-center justify-center py-1.5 px-3 min-w-0 active:scale-90 transition-transform duration-150"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative z-10 flex flex-col items-center gap-0.5">
                <div className="relative">
                  <span className={`text-[20px] transition-all duration-200 ${isActive ? "scale-110" : "opacity-60"}`}>
                    {item.icon}
                  </span>
                  {unreadCount > 0 && item.id === "messages" && (
                    <span className="absolute -top-1.5 -right-2 bg-ca-error text-white text-[10px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 leading-none shadow-sm">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold tracking-wide transition-all duration-200 ${
                    isActive ? "text-ca-text-primary scale-105" : "text-ca-text-muted"
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
