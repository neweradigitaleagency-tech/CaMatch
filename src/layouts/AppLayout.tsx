import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useChatStore } from "../stores/chatStore";
import { useThemeStore } from "../stores/themeStore";
import { useAuthStore } from "../stores/authStore";
import BottomNav from "../components/BottomNav";
import { AnimatePresence, motion } from "motion/react";
import ErrorBoundary from "../components/ui/ErrorBoundary";

export default function AppLayout() {
  const nav = useNavigate();
  const location = useLocation();
  const conversations = useChatStore((s) => s.conversations);
  const isDark = useThemeStore((s) => s.isDark);
  const isPro = useAuthStore((s) => s.isPro);

  const unreadCount = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const activeTab = location.pathname === "/" ? "home"
    : location.pathname.startsWith("/messages") ? "messages"
    : location.pathname.startsWith("/search") ? "search"
    : location.pathname.startsWith("/orders") ? (isPro ? "dashboard" : "orders")
    : location.pathname.startsWith("/profile") ? "profile"
    : "home";

  const handleTabChange = (tab: string) => {
    const routes: Record<string, string> = {
      home: "/",
      messages: "/messages",
      search: "/search",
      orders: "/orders",
      dashboard: "/orders",
      profile: "/profile",
    };
    nav(routes[tab] || "/");
  };

  const hideNavRoutes = ["/messages/", "/orders/new", "/orders/tracker/", "/profile/pro-", "/profile/edit", "/profile/security", "/profile/language", "/profile/terms", "/explorer/pro/", "/explorer/matching", "/explorer/request-creation", "/explorer/pro-selection", "/orders/qr-payment", "/orders/review"];
  const showNav = !hideNavRoutes.some((r) => location.pathname.startsWith(r)) && location.pathname !== "/auth" && location.pathname !== "/onboarding";

  return (
    <div className={`min-h-screen ${isDark ? "dark" : ""} text-ca-text-primary flex flex-col font-sans max-w-md mx-auto relative shadow-2xl border-x border-[rgba(232,224,208,0.30)] overflow-x-hidden`} style={{ background: "linear-gradient(180deg, #D8F3DC 0%, #F5F0E8 100%)" }}>
      <main className="flex-grow overflow-y-auto pb-28">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
      {showNav && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          unreadCount={unreadCount}
          isPro={isPro}
        />
      )}
    </div>
  );
}
