import { StrictMode, lazy, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppLayout from "./layouts/AppLayout";
import { useAuthStore } from "./stores/authStore";
import "./index.css";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 2, staleTime: 30_000 } } });

const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const AuthPage = lazy(() => import("./pages/client/AuthPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ProProfilePage = lazy(() => import("./pages/client/ProProfilePage"));
const AiMatchPricingPage = lazy(() => import("./pages/client/AiMatchPricingPage"));
const RequestCreationPage = lazy(() => import("./pages/client/RequestCreationPage"));
const ProSelectionPage = lazy(() => import("./pages/client/ProSelectionPage"));
const RequestDetailPage = lazy(() => import("./pages/client/RequestDetailPage"));
const MissionTrackerPage = lazy(() => import("./pages/client/MissionTrackerPage"));
const ReviewPage = lazy(() => import("./pages/client/ReviewPage"));
const QRPaymentPage = lazy(() => import("./pages/client/QRPaymentPage"));
const MessagingListPage = lazy(() => import("./pages/client/MessagingListPage"));
const ChatPage = lazy(() => import("./pages/client/ChatPage"));
const AppSettingsPage = lazy(() => import("./pages/client/AppSettingsPage"));
const ClientPaymentsPage = lazy(() => import("./pages/client/ClientPaymentsPage"));
const ClientAddressesPage = lazy(() => import("./pages/client/ClientAddressesPage"));
const ClientNotificationsPage = lazy(() => import("./pages/client/ClientNotificationsPage"));
const ClientHelpPage = lazy(() => import("./pages/client/ClientHelpPage"));
const ProEditPage = lazy(() => import("./pages/profile/ProEditPage"));
const ProVerificationPage = lazy(() => import("./pages/profile/ProVerificationPage"));
const ProFinancesPage = lazy(() => import("./pages/profile/ProFinancesPage"));
const ProSubscriptionPage = lazy(() => import("./pages/profile/ProSubscriptionPage"));
const ProPlanningPage = lazy(() => import("./pages/profile/ProPlanningPage"));
const ProNotificationsPage = lazy(() => import("./pages/profile/ProNotificationsPage"));
const ProHelpPage = lazy(() => import("./pages/profile/ProHelpPage"));

function PageLoader() {
  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#00A86B]/20 border-t-[#00A86B] rounded-full animate-spin" />
        <p className="text-xs text-secondary/60">Chargement...</p>
      </div>
    </div>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const initialized = useAuthStore((s) => s.initialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (!initialized || isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const initialized = useAuthStore((s) => s.initialized);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    initialize().finally(() => setBooted(true));
  }, []);

  if (!booted) return <PageLoader />;

  return (
    <Routes>
      <Route path="/onboarding" element={<Suspense fallback={<PageLoader />}><OnboardingPage /></Suspense>} />
      <Route path="/auth" element={<Suspense fallback={<PageLoader />}><AuthPage /></Suspense>} />
      <Route element={<AuthGate><AppLayout /></AuthGate>}>
        {/* 5 tabs principales */}
        <Route index element={<Suspense fallback={<PageLoader />}><HomePage /></Suspense>} />
        <Route path="search" element={<Suspense fallback={<PageLoader />}><SearchPage /></Suspense>} />
        <Route path="messages" element={<Suspense fallback={<PageLoader />}><MessagingListPage /></Suspense>} />
        <Route path="messages/:conversationId" element={<Suspense fallback={<PageLoader />}><ChatPage /></Suspense>} />
        <Route path="orders" element={<Suspense fallback={<PageLoader />}><OrdersPage /></Suspense>} />
        <Route path="orders/new" element={<Suspense fallback={<PageLoader />}><RequestCreationPage /></Suspense>} />
        <Route path="orders/:id" element={<Suspense fallback={<PageLoader />}><RequestDetailPage /></Suspense>} />
        <Route path="orders/tracker/:id" element={<Suspense fallback={<PageLoader />}><MissionTrackerPage /></Suspense>} />
        <Route path="orders/review" element={<Suspense fallback={<PageLoader />}><ReviewPage /></Suspense>} />
        <Route path="orders/qr-payment" element={<Suspense fallback={<PageLoader />}><QRPaymentPage /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
        <Route path="profile/settings" element={<Suspense fallback={<PageLoader />}><AppSettingsPage /></Suspense>} />
        <Route path="profile/payments" element={<Suspense fallback={<PageLoader />}><ClientPaymentsPage /></Suspense>} />
        <Route path="profile/addresses" element={<Suspense fallback={<PageLoader />}><ClientAddressesPage /></Suspense>} />
        <Route path="profile/notifications" element={<Suspense fallback={<PageLoader />}><ClientNotificationsPage /></Suspense>} />
        <Route path="profile/help" element={<Suspense fallback={<PageLoader />}><ClientHelpPage /></Suspense>} />
        <Route path="profile/pro-edit" element={<Suspense fallback={<PageLoader />}><ProEditPage /></Suspense>} />
        <Route path="profile/pro-verification" element={<Suspense fallback={<PageLoader />}><ProVerificationPage /></Suspense>} />
        <Route path="profile/pro-finances" element={<Suspense fallback={<PageLoader />}><ProFinancesPage /></Suspense>} />
        <Route path="profile/pro-subscription" element={<Suspense fallback={<PageLoader />}><ProSubscriptionPage /></Suspense>} />
        <Route path="profile/pro-planning" element={<Suspense fallback={<PageLoader />}><ProPlanningPage /></Suspense>} />
        <Route path="profile/pro-notifications" element={<Suspense fallback={<PageLoader />}><ProNotificationsPage /></Suspense>} />
        <Route path="profile/pro-help" element={<Suspense fallback={<PageLoader />}><ProHelpPage /></Suspense>} />

        {/* Redirections */}
        <Route path="explorer" element={<Navigate to="/" replace />} />
        <Route path="requests" element={<Navigate to="/orders" replace />} />
        <Route path="requests/*" element={<Navigate to="/orders" replace />} />
        <Route path="pro/dashboard" element={<Navigate to="/orders" replace />} />

        {/* Explorer deep links (conservés pour compatibilité) */}
        <Route path="explorer/pro/:id" element={<Suspense fallback={<PageLoader />}><ProProfilePage /></Suspense>} />
        <Route path="explorer/matching" element={<Suspense fallback={<PageLoader />}><AiMatchPricingPage /></Suspense>} />
        <Route path="explorer/request-creation" element={<Suspense fallback={<PageLoader />}><RequestCreationPage /></Suspense>} />
        <Route path="explorer/pro-selection" element={<Suspense fallback={<PageLoader />}><ProSelectionPage /></Suspense>} />
      </Route>
    </Routes>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
