import { StrictMode, lazy, Suspense, Component, useState, useEffect, type ReactNode, type ErrorInfo } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
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

const CategoryDetailScreen = lazy(() => import("./components/CategoryDetailScreen"));
const RequestCreationPage = lazy(() => import("./pages/client/RequestCreationPage"));
const ProSelectionPage = lazy(() => import("./pages/client/ProSelectionPage"));
const RequestDetailPage = lazy(() => import("./pages/client/RequestDetailPage"));
const MissionTrackerPage = lazy(() => import("./pages/client/MissionTrackerPage"));
const ReviewPage = lazy(() => import("./pages/client/ReviewPage"));
const DisputePage = lazy(() => import("./pages/client/DisputePage"));
const CancellationPage = lazy(() => import("./pages/client/CancellationPage"));
const ReportPage = lazy(() => import("./pages/client/ReportPage"));
const QRPaymentPage = lazy(() => import("./pages/client/QRPaymentPage"));
const EscrowPaymentPage = lazy(() => import("./pages/client/EscrowPaymentPage"));
const MessagingListPage = lazy(() => import("./pages/client/MessagingListPage"));
const ChatPage = lazy(() => import("./pages/client/ChatPage"));
const AppSettingsPage = lazy(() => import("./pages/client/AppSettingsPage"));
const ClientPaymentsPage = lazy(() => import("./pages/client/ClientPaymentsPage"));
const ClientAddressesPage = lazy(() => import("./pages/client/ClientAddressesPage"));
const ClientNotificationsPage = lazy(() => import("./pages/client/ClientNotificationsPage"));
const ClientHelpPage = lazy(() => import("./pages/client/ClientHelpPage"));
const SearchScreen = lazy(() => import("./screens/SearchScreen"));
const ProviderProfileScreen = lazy(() => import("./screens/ProviderProfileScreen"));
const CategorySelectScreen = lazy(() => import("./screens/CategorySelectScreen"));
const ProEditPage = lazy(() => import("./pages/profile/ProEditPage"));
const ProVerificationPage = lazy(() => import("./pages/profile/ProVerificationPage"));
const ProFinancesPage = lazy(() => import("./pages/profile/ProFinancesPage"));
const ProSubscriptionPage = lazy(() => import("./pages/profile/ProSubscriptionPage"));
const ProPlanningPage = lazy(() => import("./pages/profile/ProPlanningPage"));
const ProNotificationsPage = lazy(() => import("./pages/profile/ProNotificationsPage"));
const ProHelpPage = lazy(() => import("./pages/profile/ProHelpPage"));
const ProOnboardingPage = lazy(() => import("./pages/ProOnboardingPage"));
const ProDashboardScreen = lazy(() => import("./components/ProDashboardScreen"));
const ProServicesPage = lazy(() => import("./pages/pro/ProServicesPage"));
const ProRevenusPage = lazy(() => import("./pages/pro/ProRevenusPage"));
const ProWalletPage = lazy(() => import("./pages/pro/ProWalletPage"));
const ProMessagesPage = lazy(() => import("./pages/pro/ProMessagesPage"));
const ProMissionDetailPage = lazy(() => import("./pages/pro/ProMissionDetailPage"));
const ProGalleryPage = lazy(() => import("./pages/pro/ProGalleryPage"));
const ProStatsPage = lazy(() => import("./pages/pro/ProStatsPage"));
const ProBadgesPage = lazy(() => import("./pages/pro/ProBadgesPage"));
const ProMissionsPage = lazy(() => import("./pages/pro/ProMissionsPage"));
const ProPreviewPage = lazy(() => import("./pages/profile/ProPreviewPage"));
const MatchingScreen = lazy(() => import("./pages/explorer/MatchingScreen"));
const ProSecurityPage = lazy(() => import("./pages/pro/ProSecurityPage"));
const ProSettingsPage = lazy(() => import("./pages/pro/ProSettingsPage"));
const ProSupportPage = lazy(() => import("./pages/pro/ProSupportPage"));
const ProAboutPage = lazy(() => import("./pages/pro/ProAboutPage"));
const AdminApplicationsPage = lazy(() => import("./pages/admin/AdminApplicationsPage"));
const AdminApplicationDetail = lazy(() => import("./pages/admin/AdminApplicationDetail"));
const InvoicePage = lazy(() => import("./pages/client/InvoicePage"));
const QuoteCreatePage = lazy(() => import("./pages/client/QuoteCreatePage"));
const QuoteReviewPage = lazy(() => import("./pages/client/QuoteReviewPage"));
const ProMissionListPage = lazy(() => import("./pages/profile/ProMissionListPage"));
const EditProfilePage = lazy(() => import("./pages/profile/EditProfilePage"));
const SecurityPage = lazy(() => import("./pages/profile/SecurityPage"));
const LanguagePage = lazy(() => import("./pages/profile/LanguagePage"));
const TermsPage = lazy(() => import("./pages/profile/TermsPage"));

class ErrorFallback extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crash:", error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dynamic flex items-center justify-center p-6 bg-cm-bg">
          <div className="text-center max-w-xs">
            <div className="w-14 h-14 rounded-[16px] bg-cm-accent-soft flex items-center justify-center mx-auto mb-4">
              <span className="text-[24px]">!</span>
            </div>
            <h2 className="text-[15px] font-extrabold text-cm-text mb-2">Une erreur est survenue</h2>
            <p className="text-[12px] text-cm-text-muted mb-4">
              L'application n'a pas pu se charger correctement.
            </p>
            <p className="text-[10px] text-cm-text-muted mb-4 font-mono bg-cm-elevated rounded-[14px] p-3 border border-cm-border text-left break-all max-h-24 overflow-y-auto">
              {this.state.error?.message || "Erreur inconnue"}
            </p>
            <button onClick={() => window.location.reload()}
              className="h-10 px-6 bg-cm-text text-white text-[12px] font-bold rounded-[14px] cursor-pointer hover:opacity-90 transition-all active:scale-[0.97]">
              Recharger la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function PageLoader() {
  return (
    <div className="min-h-dynamic flex items-center justify-center bg-cm-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-cm-border-soft border-t-cm-text rounded-full animate-spin" />
        <p className="text-[12px] text-cm-text-muted">Chargement...</p>
      </div>
    </div>
  );
}

function AuthGate({ children }: { children?: React.ReactNode }) {
  const initialized = useAuthStore((s) => s.initialized);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (!initialized || isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/onboarding" replace />;
  return children ? <>{children}</> : <Outlet />;
}

function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const initialized = useAuthStore((s) => s.initialized);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    initialize().finally(() => setBooted(true));
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  if (!booted) return <PageLoader />;

  return (
    <Routes>
      <Route path="/onboarding" element={<Suspense fallback={<PageLoader />}><OnboardingPage /></Suspense>} />
      <Route path="/auth" element={<Suspense fallback={<PageLoader />}><AuthPage /></Suspense>} />
      <Route element={<AuthGate />}>
        <Route path="pro/onboarding" element={<Suspense fallback={<PageLoader />}><ProOnboardingPage /></Suspense>} />
        <Route path="pro/onboarding/:step" element={<Suspense fallback={<PageLoader />}><ProOnboardingPage /></Suspense>} />
        <Route path="pro/dashboard" element={<Suspense fallback={<PageLoader />}><ProDashboardScreen /></Suspense>} />
        <Route path="pro/services" element={<Suspense fallback={<PageLoader />}><ProServicesPage /></Suspense>} />
        <Route path="pro/revenues" element={<Suspense fallback={<PageLoader />}><ProRevenusPage /></Suspense>} />
        <Route path="pro/wallet" element={<Suspense fallback={<PageLoader />}><ProWalletPage /></Suspense>} />
        <Route path="pro/messages" element={<Suspense fallback={<PageLoader />}><ProMessagesPage /></Suspense>} />
        <Route path="pro/messages/:conversationId" element={<Suspense fallback={<PageLoader />}><ProMessagesPage /></Suspense>} />
        <Route path="pro/mission/:id" element={<Suspense fallback={<PageLoader />}><ProMissionDetailPage /></Suspense>} />
        <Route path="pro/missions" element={<Suspense fallback={<PageLoader />}><ProMissionsPage /></Suspense>} />
        <Route path="pro/preview" element={<Navigate to="/profile/pro-preview" replace />} />
        <Route path="pro/gallery" element={<Suspense fallback={<PageLoader />}><ProGalleryPage /></Suspense>} />
        <Route path="pro/stats" element={<Suspense fallback={<PageLoader />}><ProStatsPage /></Suspense>} />
        <Route path="pro/badges" element={<Suspense fallback={<PageLoader />}><ProBadgesPage /></Suspense>} />
        <Route path="pro/security" element={<Suspense fallback={<PageLoader />}><ProSecurityPage /></Suspense>} />
        <Route path="pro/settings" element={<Suspense fallback={<PageLoader />}><ProSettingsPage /></Suspense>} />
        <Route path="pro/support" element={<Suspense fallback={<PageLoader />}><ProSupportPage /></Suspense>} />
        <Route path="pro/about" element={<Suspense fallback={<PageLoader />}><ProAboutPage /></Suspense>} />
        <Route path="pro/edit" element={<Navigate to="/profile/pro-edit" replace />} />
        <Route path="pro/planning" element={<Navigate to="/profile/pro-planning" replace />} />
        <Route path="pro/notifications" element={<Navigate to="/profile/pro-notifications" replace />} />
        <Route path="admin/applications" element={<Suspense fallback={<PageLoader />}><AdminApplicationsPage /></Suspense>} />
        <Route path="admin/applications/:id" element={<Suspense fallback={<PageLoader />}><AdminApplicationDetail /></Suspense>} />
        <Route element={<AppLayout />}>
        <Route index element={<Suspense fallback={<PageLoader />}><HomePage /></Suspense>} />
        <Route path="search" element={<Suspense fallback={<PageLoader />}><SearchPage /></Suspense>} />
        <Route path="messages" element={<Suspense fallback={<PageLoader />}><MessagingListPage /></Suspense>} />
        <Route path="messages/:conversationId" element={<Suspense fallback={<PageLoader />}><ChatPage /></Suspense>} />
        <Route path="orders" element={<Suspense fallback={<PageLoader />}><OrdersPage /></Suspense>} />
        <Route path="orders/new" element={<Suspense fallback={<PageLoader />}><RequestCreationPage /></Suspense>} />
        <Route path="orders/:id" element={<Suspense fallback={<PageLoader />}><RequestDetailPage /></Suspense>} />
        <Route path="orders/tracker/:id" element={<Suspense fallback={<PageLoader />}><MissionTrackerPage /></Suspense>} />
        <Route path="orders/review" element={<Suspense fallback={<PageLoader />}><ReviewPage /></Suspense>} />
        <Route path="orders/dispute/:id" element={<Suspense fallback={<PageLoader />}><DisputePage /></Suspense>} />
        <Route path="orders/cancel/:id" element={<Suspense fallback={<PageLoader />}><CancellationPage /></Suspense>} />
        <Route path="orders/report" element={<Suspense fallback={<PageLoader />}><ReportPage /></Suspense>} />
        <Route path="orders/qr-payment" element={<Suspense fallback={<PageLoader />}><QRPaymentPage /></Suspense>} />
        <Route path="orders/invoice" element={<Suspense fallback={<PageLoader />}><InvoicePage /></Suspense>} />
        <Route path="orders/quote/create/:requestId" element={<Suspense fallback={<PageLoader />}><QuoteCreatePage /></Suspense>} />
        <Route path="orders/quote/:requestId" element={<Suspense fallback={<PageLoader />}><QuoteReviewPage /></Suspense>} />
        <Route path="orders/payment/:requestId" element={<Suspense fallback={<PageLoader />}><EscrowPaymentPage /></Suspense>} />
        <Route path="profile/pro-missions" element={<Suspense fallback={<PageLoader />}><ProMissionListPage /></Suspense>} />
        <Route path="profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
        <Route path="profile/settings" element={<Suspense fallback={<PageLoader />}><AppSettingsPage /></Suspense>} />
        <Route path="profile/payments" element={<Suspense fallback={<PageLoader />}><ClientPaymentsPage /></Suspense>} />
        <Route path="profile/addresses" element={<Suspense fallback={<PageLoader />}><ClientAddressesPage /></Suspense>} />
        <Route path="profile/notifications" element={<Suspense fallback={<PageLoader />}><ClientNotificationsPage /></Suspense>} />
        <Route path="profile/help" element={<Suspense fallback={<PageLoader />}><ClientHelpPage /></Suspense>} />
        <Route path="profile/edit" element={<Suspense fallback={<PageLoader />}><EditProfilePage /></Suspense>} />
        <Route path="profile/security" element={<Suspense fallback={<PageLoader />}><SecurityPage /></Suspense>} />
        <Route path="profile/language" element={<Suspense fallback={<PageLoader />}><LanguagePage /></Suspense>} />
        <Route path="profile/terms" element={<Suspense fallback={<PageLoader />}><TermsPage /></Suspense>} />
        <Route path="profile/pro-edit" element={<Suspense fallback={<PageLoader />}><ProEditPage /></Suspense>} />
        <Route path="profile/pro-verification" element={<Suspense fallback={<PageLoader />}><ProVerificationPage /></Suspense>} />
        <Route path="profile/pro-finances" element={<Suspense fallback={<PageLoader />}><ProFinancesPage /></Suspense>} />
        <Route path="profile/pro-subscription" element={<Suspense fallback={<PageLoader />}><ProSubscriptionPage /></Suspense>} />
        <Route path="profile/pro-planning" element={<Suspense fallback={<PageLoader />}><ProPlanningPage /></Suspense>} />
        <Route path="profile/pro-notifications" element={<Suspense fallback={<PageLoader />}><ProNotificationsPage /></Suspense>} />
        <Route path="profile/pro-help" element={<Suspense fallback={<PageLoader />}><ProHelpPage /></Suspense>} />

        <Route path="explorer" element={<Navigate to="/" replace />} />
        <Route path="requests" element={<Navigate to="/orders" replace />} />
        <Route path="requests/*" element={<Navigate to="/orders" replace />} />
        <Route path="explorer/pro/:id" element={<Suspense fallback={<PageLoader />}><ProProfilePage /></Suspense>} />
        <Route path="explorer/request-creation" element={<Suspense fallback={<PageLoader />}><RequestCreationPage /></Suspense>} />
        <Route path="explorer/pro-selection" element={<Suspense fallback={<PageLoader />}><ProSelectionPage /></Suspense>} />
        <Route path="explorer/categories" element={<Suspense fallback={<PageLoader />}><CategorySelectScreen /></Suspense>} />
        <Route path="explorer/search" element={<Suspense fallback={<PageLoader />}><SearchScreen /></Suspense>} />
        <Route path="explorer/design-provider/:id" element={<Suspense fallback={<PageLoader />}><ProviderProfileScreen /></Suspense>} />
        <Route path="explorer/category/:categoryId" element={<Suspense fallback={<PageLoader />}><CategoryDetailScreen /></Suspense>} />
        <Route path="explorer/matching" element={<Suspense fallback={<PageLoader />}><MatchingScreen /></Suspense>} />
        <Route path="explorer/matching/success" element={<Suspense fallback={<PageLoader />}><MatchingScreen /></Suspense>} />

        <Route path="profile/pro-preview" element={<Suspense fallback={<PageLoader />}><ProPreviewPage /></Suspense>} />
      </Route>
      </Route>
    </Routes>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorFallback>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorFallback>
  </StrictMode>
);
