import { Home, Compass, MessageCircle, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { isImmersiveRoute } from "../../navigation/navigationGraph";

const TABS = [
  { to: "/", label: "Accueil", icon: Home, end: true },
  { to: "/search", label: "Explorer", icon: Compass, end: false },
  { to: "/messages", label: "Messages", icon: MessageCircle, end: false },
  { to: "/my-profile", label: "Compte", icon: User, end: false },
] as const;

/**
 * Barre de navigation basse (client). Masquée sur les écrans immersifs
 * (missions, conversations, transactions) via le graph de navigation.
 */
export default function BottomTabBar() {
  const location = useLocation();
  if (isImmersiveRoute(location.pathname)) return null;

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 w-full max-w-[448px] bg-cm-bg/90 backdrop-blur-xl border-t border-cm-border pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Navigation principale"
    >
      <div className="flex items-stretch h-[64px]">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            onClick={(e) => {
              if (location.pathname === tab.to) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer touch-manipulation transition-colors ${
                isActive ? "text-cm-accent" : "text-cm-text-soft"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <tab.icon
                  className="w-[22px] h-[22px]"
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-[10px] font-semibold leading-none">
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
