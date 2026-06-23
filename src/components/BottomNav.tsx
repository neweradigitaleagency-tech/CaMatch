import { useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { id: "home", icon: "home", route: "/" },
  { id: "search", icon: "search", route: "/search" },
  { id: "messages", icon: "inbox", route: "/messages" },
  { id: "orders", icon: "clipboard", route: "/orders" },
  { id: "profile", icon: "user", route: "/profile" },
];

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount?: number;
  isPro?: boolean;
}

function NavIcon({ name, active }: { name: string; active: boolean }) {
  const stroke = active ? "#151e12" : "#a0b898";
  const sw = "2";
  const cls = "w-6 h-6 transition-colors duration-150";

  switch (name) {
    case "home":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      );
    case "search":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
      );
    case "inbox":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-5l-2 3H9l-2-3H2" />
          <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
        </svg>
      );
    case "clipboard":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="8" y1="9" x2="16" y2="9" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="12" y2="17" />
        </svg>
      );
    case "user":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    default:
      return null;
  }
}

export default function BottomNav({ activeTab, onTabChange, unreadCount = 0, isPro = false }: BottomNavProps) {
  const location = useLocation();

  const items = NAV_ITEMS.map((item) => {
    if (item.id === "orders") {
      return { ...item, id: isPro ? "dashboard" : "orders", route: "/orders" };
    }
    return item;
  });

  const handleClick = (item: typeof items[0]) => {
    const target = item.route;
    if (location.pathname === target || location.pathname.startsWith(target + "/")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    onTabChange(item.id);
  };

  return (
    <nav className="sticky bottom-0 z-20 border-t border-cm-border bg-cm-elevated" aria-label="Navigation">
      <div className="flex items-center justify-around px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom,8px))]">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className="relative flex flex-col items-center justify-center py-1 px-4 min-w-0 cm-scale-btn"
              aria-label={item.id}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <NavIcon name={item.icon} active={isActive} />
                {unreadCount > 0 && item.id === "messages" && (
                  <span className="absolute -top-1.5 -right-2 bg-cm-error text-white text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              {isActive && (
                <div className="w-5 h-0.5 bg-cm-accent rounded-full mt-1.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
