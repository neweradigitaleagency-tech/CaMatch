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
    <div className="min-h-dynamic text-cm-text flex flex-col font-sans cm-viewport shadow-2xl border-x border-cm-border bg-cm-bg pb-safe">
      <div className="h-1 shrink-0 bg-gradient-to-r from-cm-accent to-cm-forest" />
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
