import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import ErrorBoundary from "../ui/ErrorBoundary";
import { isImmersiveRoute } from "../../navigation/navigationGraph";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import { useAppNavigation } from "../../navigation/useAppNavigation";
import { useMarketplaceCartStore } from "../../stores/marketplaceCartStore";

export default function MarketplaceLayout() {
  const location = useLocation();
  const { navigate } = useAppNavigation();
  const immersive = isImmersiveRoute(location.pathname);
  const goBack = useBackNavigation(location.pathname === "/marketplace" ? "/" : "/marketplace");
  const cartCount = useMarketplaceCartStore((s) => (s.items ?? []).reduce((sum, i) => sum + i.quantity, 0));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname]);

  return (
    <div className="min-h-dynamic text-cm-text flex flex-col font-sans cm-viewport shadow-2xl border-x border-cm-border bg-cm-bg pb-safe">
      <div className="h-1 shrink-0 bg-gradient-to-r from-cm-accent to-cm-forest" />

      {!immersive && (
        <header className="shrink-0 bg-cm-elevated/92 backdrop-blur-lg border-b border-cm-border">
          <div className="px-4 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={goBack}
                aria-label="Retour"
                className="p-1 -ml-1 shrink-0 cursor-pointer active:scale-[0.97] transition-transform touch-min"
              >
                <ArrowLeft className="w-5 h-5 text-cm-text" />
              </button>
              <p className="text-[15px] font-bold tracking-tight truncate leading-none">
                marketplace
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => navigate("/marketplace/cart")}
                aria-label="Panier"
                className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-cm-surface cursor-pointer active:scale-90 transition-transform touch-min"
              >
                <ShoppingCart className="w-5 h-5 text-cm-text" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-cm-error text-white text-[9px] font-bold rounded-full px-1 pointer-events-none">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>
      )}

      <main className="flex-grow flex flex-col">
        <ErrorBoundary>
          {immersive ? (
            <Outlet />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                className="flex-1 flex flex-col"
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
