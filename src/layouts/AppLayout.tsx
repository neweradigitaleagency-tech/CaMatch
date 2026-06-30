import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useLocationStore } from "../stores/locationStore";
import { AnimatePresence, motion } from "motion/react";
import ErrorBoundary from "../components/ui/ErrorBoundary";

export default function AppLayout() {
  const location = useLocation();

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

  const isChatRoute = location.pathname.startsWith("/messages/");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div className={`min-h-screen ${""} text-cm-text flex flex-col font-sans max-w-md mx-auto relative shadow-2xl border-x border-cm-border overflow-x-hidden bg-cm-bg`}>
      <main className={`flex-grow ${isChatRoute ? "flex flex-col" : "overflow-y-auto"}`}>
        <ErrorBoundary>
          {isChatRoute ? (
            <Outlet />
          ) : (
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
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
}
