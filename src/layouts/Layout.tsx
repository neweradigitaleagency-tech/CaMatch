import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import RoleSwitcher from "../components/ui/RoleSwitcher";
import { useAuthStore } from "../stores/authStore";
import { useLocationStore } from "../stores/locationStore";

type LayoutVariant = "client" | "pro" | "supplier" | "admin";

interface LayoutProps {
  variant?: LayoutVariant;
}

export default function Layout({ variant = "client" }: LayoutProps) {
  const location = useLocation();
  const isClient = variant === "client";

  const refreshLocation = useLocationStore((s) => s.refreshLocation);
  const locStatus = useLocationStore((s) => s.status);
  const locAttempted = useRef(false);

  useEffect(() => {
    if (!isClient) return;
    if (locAttempted.current) return;
    if (locStatus === "idle") {
      locAttempted.current = true;
      refreshLocation();
    }
  }, [isClient, locStatus, refreshLocation]);

  const isChatRoute = isClient && location.pathname.startsWith("/messages/");

  const availableModes = useAuthStore((s) => s.availableModes);
  const hasMultipleModes = availableModes.length > 1;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div className={`min-h-dynamic text-cm-text flex flex-col font-sans cm-viewport shadow-2xl border-x border-cm-border bg-cm-bg${isClient ? " pb-safe" : ""}`}>
      <div className="h-1 shrink-0 bg-gradient-to-r from-cm-accent to-cm-forest" />
      {hasMultipleModes && (
        <div className="flex items-center justify-end px-4 py-1.5 border-b border-cm-border/30 bg-cm-elevated/50">
          <RoleSwitcher />
        </div>
      )}
      <main className={`flex-grow ${isChatRoute ? "flex flex-col" : ""}`}>
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
