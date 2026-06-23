import { useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useChatStore } from "../stores/chatStore";
import { useAuthStore } from "../stores/authStore";
import { useLocationStore } from "../stores/locationStore";
import BottomNav from "../components/BottomNav";
import { AnimatePresence, motion } from "motion/react";
import ErrorBoundary from "../components/ui/ErrorBoundary";

export default function AppLayout() {
  const nav = useNavigate();
  const location = useLocation();
  const conversations = useChatStore((s) => s.conversations);
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

  const refreshLocation = useLocationStore((s) => s.refreshLocation);
  const locStatus = useLocationStore((s) => s.status);
  const locAttempted = useRef(false);

  useEffect(() => {
    if (locAttempted.current) return;
    if (locStatus === "idle") {
      locAttempted.current = true;
      refreshLocation();
    }
  }, [locStatus, refreshLocation]);

  const hideNavRoutes = ["/messages/", "/orders/new", "/orders/tracker/", "/profile/pro-", "/profile/edit", "/profile/security", "/profile/language", "/profile/terms", "/explorer/pro/", "/explorer/matching", "/explorer/request-creation", "/explorer/pro-selection", "/orders/qr-payment", "/orders/review", "/orders/invoice"];
  const showNav = !hideNavRoutes.some((r) => location.pathname.startsWith(r)) && location.pathname !== "/auth" && location.pathname !== "/onboarding";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div className={`min-h-screen ${""} text-cm-text flex flex-col font-sans max-w-md mx-auto relative shadow-2xl border-x border-cm-border overflow-x-hidden`} style={{ background: "#FAFAF9" }}>
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
