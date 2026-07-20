import { StrictMode, lazy, Suspense, Component, useState, useEffect, type ReactNode, type ErrorInfo } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppLayout from "./layouts/AppLayout";
import ProLayout from "./layouts/ProLayout";
import AdminLayout from "./components/admin/AdminLayout";
import SupplierLayout from "./components/supplier/SupplierLayout";
import { useAuthStore } from "./stores/authStore";
import { useAdminAuthStore } from "./stores/adminAuthStore";
import RequireMode from "./components/auth/RequireMode";
import "./index.css";
import "./styles/admin.css";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 2, staleTime: 30_000 } } });

const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const CatalogPage = lazy(() => import("./pages/CatalogPage"));
const UnifiedProfilePage = lazy(() => import("./pages/UnifiedProfilePage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ProProfilePage = lazy(() => import("./pages/client/ProProfilePage"));

const CategoryDetailScreen = lazy(() => import("./components/CategoryDetailScreen"));
const RequestWizardPage = lazy(() => import("./pages/client/RequestWizardPage"));
const MatchingSearchPage = lazy(() => import("./pages/client/MatchingSearchPage"));
const ProposalsListPage = lazy(() => import("./pages/client/ProposalsListPage"));
const ProposalDetailPage = lazy(() => import("./pages/client/ProposalDetailPage"));
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
const MarketplaceHome = lazy(() => import("./components/marketplace/MarketplaceHome"));
const SellerRegistrationPage = lazy(() => import("./pages/marketplace/SellerRegistrationPage"));
const ShopPage = lazy(() => import("./pages/marketplace/ShopPage"));
const BrowseProducts = lazy(() => import("./components/marketplace/BrowseProducts"));
const CategoryExplore = lazy(() => import("./components/marketplace/CategoryExplore"));
const ProductDetail = lazy(() => import("./components/marketplace/ProductDetail"));
const ProfessionalListingScreen = lazy(() => import("./components/ProfessionalListingScreen"));
const FreelanceListingScreen = lazy(() => import("./components/FreelanceListingScreen"));
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
const ProProfessionalIdentityPage = lazy(() => import("./pages/pro/ProProfessionalIdentityPage"));
const ProPaymentMethodsPage = lazy(() => import("./pages/pro/ProPaymentMethodsPage"));
const ProWithdrawPage = lazy(() => import("./pages/pro/ProWithdrawPage"));
const ProWithdrawalsPage = lazy(() => import("./pages/pro/ProWithdrawalsPage"));
const ProBankAccountsPage = lazy(() => import("./pages/pro/ProBankAccountsPage"));
const ProCurrencyPage = lazy(() => import("./pages/pro/ProCurrencyPage"));
const ProTimezonePage = lazy(() => import("./pages/pro/ProTimezonePage"));
const ProAppearancePage = lazy(() => import("./pages/pro/ProAppearancePage"));
const ProPrivacyPage = lazy(() => import("./pages/pro/ProPrivacyPage"));
const ProPhonePage = lazy(() => import("./pages/pro/ProPhonePage"));
const ProEmailPage = lazy(() => import("./pages/pro/ProEmailPage"));
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminApplicationsPage = lazy(() => import("./pages/admin/AdminApplicationsPage"));
const AdminApplicationDetail = lazy(() => import("./pages/admin/AdminApplicationDetail"));
const AdminClientsPage = lazy(() => import("./pages/admin/AdminClientsPage"));
const AdminClientDetailPage = lazy(() => import("./pages/admin/AdminClientDetailPage"));
const AdminProsPage = lazy(() => import("./pages/admin/AdminProsPage"));
const AdminProDetailPage = lazy(() => import("./pages/admin/AdminProDetailPage"));
const AdminVerificationsPage = lazy(() => import("./pages/admin/AdminVerificationsPage"));
const AdminMissionsPage = lazy(() => import("./pages/admin/AdminMissionsPage"));
const AdminSupportPage = lazy(() => import("./pages/admin/AdminSupportPage"));
const AdminReportsPage = lazy(() => import("./pages/admin/AdminReportsPage"));
const AdminPaymentsPage = lazy(() => import("./pages/admin/AdminPaymentsPage"));
const AdminNotificationsPage = lazy(() => import("./pages/admin/AdminNotificationsPage"));
const AdminAnalyticsPage = lazy(() => import("./pages/admin/AdminAnalyticsPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage"));
const AdminLogsPage = lazy(() => import("./pages/admin/AdminLogsPage"));
const AdminMissionDetailPage = lazy(() => import("./pages/admin/AdminMissionDetailPage"));
const AdminSupportTicketDetail = lazy(() => import("./pages/admin/AdminSupportTicketDetail"));
const AdminNotificationCreatePage = lazy(() => import("./pages/admin/AdminNotificationCreatePage"));
const AdminCategoriesPage = lazy(() => import("./pages/admin/AdminCategoriesPage"));
const AdminPromotionsPage = lazy(() => import("./pages/admin/AdminPromotionsPage"));
const AdminCMSPage = lazy(() => import("./pages/admin/AdminCMSPage"));
const AdminRolesPage = lazy(() => import("./pages/admin/AdminRolesPage"));
const AdminFraudPage = lazy(() => import("./pages/admin/AdminFraudPage"));
const VerifyPhonePage = lazy(() => import("./pages/verify/VerifyPhonePage"));
const VerifyEmailPage = lazy(() => import("./pages/verify/VerifyEmailPage"));
const VerifyIdentityPage = lazy(() => import("./pages/verify/VerifyIdentityPage"));
const InvoicePage = lazy(() => import("./pages/client/InvoicePage"));
const QuoteCreatePage = lazy(() => import("./pages/client/QuoteCreatePage"));
const QuoteReviewPage = lazy(() => import("./pages/client/QuoteReviewPage"));
const ProMissionListPage = lazy(() => import("./pages/profile/ProMissionListPage"));
const EditProfilePage = lazy(() => import("./pages/profile/EditProfilePage"));
const SecurityPage = lazy(() => import("./pages/profile/SecurityPage"));
const LanguagePage = lazy(() => import("./pages/profile/LanguagePage"));
const TermsPage = lazy(() => import("./pages/profile/TermsPage"));

const SubscriptionDashboardPage = lazy(() => import("./pages/subscription/SubscriptionDashboardPage"));
const SubscriptionPlansPage = lazy(() => import("./pages/subscription/SubscriptionPlansPage"));
const SubscriptionPaymentPage = lazy(() => import("./pages/subscription/SubscriptionPaymentPage"));
const SubscriptionHistoryPage = lazy(() => import("./pages/subscription/SubscriptionHistoryPage"));
const SubscriptionInvoicesPage = lazy(() => import("./pages/subscription/SubscriptionInvoicesPage"));
const SubscriptionComparePage = lazy(() => import("./pages/subscription/SubscriptionComparePage"));
const SubscriptionSuccessPage = lazy(() => import("./pages/subscription/SubscriptionSuccessPage"));

const ProSubscriptionDashboardPage = lazy(() => import("./pages/pro/ProSubscriptionDashboardPage"));
const ProSubscriptionPlansPage = lazy(() => import("./pages/pro/ProSubscriptionPlansPage"));
const ProBoostPage = lazy(() => import("./pages/pro/ProBoostPage"));
const ProCreditsPage2 = lazy(() => import("./pages/pro/ProCreditsPage"));

const AdminSubscriptionsPage = lazy(() => import("./pages/admin/AdminSubscriptionsPage"));
const AdminPlansPage = lazy(() => import("./pages/admin/AdminPlansPage"));
const AdminFeaturesPage = lazy(() => import("./pages/admin/AdminFeaturesPage"));
const AdminInvoicesPage = lazy(() => import("./pages/admin/AdminInvoicesPage"));
const AdminCouponsPage = lazy(() => import("./pages/admin/AdminCouponsPage"));
const AdminRevenueAnalyticsPage = lazy(() => import("./pages/admin/AdminRevenueAnalyticsPage"));
const AdminFeatureFlagsPage = lazy(() => import("./pages/admin/AdminFeatureFlagsPage"));
const AdminSuppliersPage = lazy(() => import("./pages/admin/AdminSuppliersPage"));
const AdminSupplierDetailPage = lazy(() => import("./pages/admin/AdminSupplierDetailPage"));
const AdminSupplierApplicationsPage = lazy(() => import("./pages/admin/AdminSupplierApplicationsPage"));
const AdminDisputesPage = lazy(() => import("./pages/admin/AdminDisputesPage"));
const AdminDisputeDetailPage = lazy(() => import("./pages/admin/AdminDisputeDetailPage"));
const AdminDeliveriesPage = lazy(() => import("./pages/admin/AdminDeliveriesPage"));
const AdminDeliveryDetailPage = lazy(() => import("./pages/admin/AdminDeliveryDetailPage"));

// Supplier portal lazy imports
const SupplierRegisterPage = lazy(() => import("./pages/supplier/SupplierRegisterPage"));
const SupplierDashboardPage = lazy(() => import("./pages/supplier/SupplierDashboardPage"));
const SupplierProductsPage = lazy(() => import("./pages/supplier/SupplierProductsPage"));
const SupplierProductNewPage = lazy(() => import("./pages/supplier/SupplierProductNewPage"));
const SupplierProductEditPage = lazy(() => import("./pages/supplier/SupplierProductEditPage"));
const SupplierOrdersPage = lazy(() => import("./pages/supplier/SupplierOrdersPage"));
const SupplierOrderDetailPage = lazy(() => import("./pages/supplier/SupplierOrderDetailPage"));
const SupplierDeliveryZonesPage = lazy(() => import("./pages/supplier/SupplierDeliveryZonesPage"));
const SupplierStatsPage = lazy(() => import("./pages/supplier/SupplierStatsPage"));
const SupplierProfilePage = lazy(() => import("./pages/supplier/SupplierProfilePage"));
const SupplierPaymentsPage = lazy(() => import("./pages/supplier/SupplierPaymentsPage"));
const SupplierPaymentDetailPage = lazy(() => import("./pages/supplier/SupplierPaymentDetailPage"));
const SupplierDisputesPage = lazy(() => import("./pages/supplier/SupplierDisputesPage"));
const SupplierDisputeDetailPage = lazy(() => import("./pages/supplier/SupplierDisputeDetailPage"));
const SupplierDeliveriesPage = lazy(() => import("./pages/supplier/SupplierDeliveriesPage"));
const SupplierDeliveryDetailPage = lazy(() => import("./pages/supplier/SupplierDeliveryDetailPage"));
const SupplierBalancePage = lazy(() => import("./pages/supplier/SupplierBalancePage"));
const SupplierSettingsPage = lazy(() => import("./pages/supplier/SupplierSettingsPage"));
const SupplierStockPage = lazy(() => import("./pages/supplier/SupplierStockPage"));
const SupplierClientsPage = lazy(() => import("./pages/supplier/SupplierClientsPage"));
const SupplierClientDetailPage = lazy(() => import("./pages/supplier/SupplierClientDetailPage"));
const SupplierPromotionsPage = lazy(() => import("./pages/supplier/SupplierPromotionsPage"));
const SupplierInvoicesPage = lazy(() => import("./pages/supplier/SupplierInvoicesPage"));
const SupplierInvoiceDetailPage = lazy(() => import("./pages/supplier/SupplierInvoiceDetailPage"));
const SupplierDocumentsPage = lazy(() => import("./pages/supplier/SupplierDocumentsPage"));
const SupplierImportPage = lazy(() => import("./pages/supplier/SupplierImportPage"));
const SupplierPickingPage = lazy(() => import("./pages/supplier/SupplierPickingPage"));

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

function AdminAuthGate({ children }: { children?: React.ReactNode }) {
  const initialized = useAdminAuthStore((s) => s.initialized);
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  const isLoading = useAdminAuthStore((s) => s.isLoading);

  if (!initialized || isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children ? <>{children}</> : <Outlet />;
}

function AdminInitGate({ children }: { children?: React.ReactNode }) {
  const initialize = useAdminAuthStore((s) => s.initialize);
  const initialized = useAdminAuthStore((s) => s.initialized);
  const [ready, setReady] = useState(!initialized);

  useEffect(() => {
    if (!initialized) {
      initialize().finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  if (!ready) return <PageLoader />;
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

      {/* Admin routes — separate auth from regular users */}
      <Route element={<AdminInitGate />}>
        <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><AdminLoginPage /></Suspense>} />
        <Route element={<AdminAuthGate />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<Suspense fallback={<PageLoader />}><AdminDashboardPage /></Suspense>} />
            <Route path="/admin/clients" element={<Suspense fallback={<PageLoader />}><AdminClientsPage /></Suspense>} />
            <Route path="/admin/clients/:id" element={<Suspense fallback={<PageLoader />}><AdminClientDetailPage /></Suspense>} />
            <Route path="/admin/pros" element={<Suspense fallback={<PageLoader />}><AdminProsPage /></Suspense>} />
            <Route path="/admin/pros/:id" element={<Suspense fallback={<PageLoader />}><AdminProDetailPage /></Suspense>} />
            <Route path="/admin/verifications" element={<Suspense fallback={<PageLoader />}><AdminVerificationsPage /></Suspense>} />
            <Route path="/admin/missions" element={<Suspense fallback={<PageLoader />}><AdminMissionsPage /></Suspense>} />
            <Route path="/admin/support" element={<Suspense fallback={<PageLoader />}><AdminSupportPage /></Suspense>} />
            <Route path="/admin/reports" element={<Suspense fallback={<PageLoader />}><AdminReportsPage /></Suspense>} />
            <Route path="/admin/payments" element={<Suspense fallback={<PageLoader />}><AdminPaymentsPage /></Suspense>} />
            <Route path="/admin/notifications" element={<Suspense fallback={<PageLoader />}><AdminNotificationsPage /></Suspense>} />
            <Route path="/admin/analytics" element={<Suspense fallback={<PageLoader />}><AdminAnalyticsPage /></Suspense>} />
            <Route path="/admin/settings" element={<Suspense fallback={<PageLoader />}><AdminSettingsPage /></Suspense>} />
            <Route path="/admin/logs" element={<Suspense fallback={<PageLoader />}><AdminLogsPage /></Suspense>} />
            <Route path="/admin/missions/:id" element={<Suspense fallback={<PageLoader />}><AdminMissionDetailPage /></Suspense>} />
            <Route path="/admin/support/:id" element={<Suspense fallback={<PageLoader />}><AdminSupportTicketDetail /></Suspense>} />
            <Route path="/admin/notifications/create" element={<Suspense fallback={<PageLoader />}><AdminNotificationCreatePage /></Suspense>} />
            <Route path="/admin/categories" element={<Suspense fallback={<PageLoader />}><AdminCategoriesPage /></Suspense>} />
            <Route path="/admin/promotions" element={<Suspense fallback={<PageLoader />}><AdminPromotionsPage /></Suspense>} />
            <Route path="/admin/cms" element={<Suspense fallback={<PageLoader />}><AdminCMSPage /></Suspense>} />
            <Route path="/admin/roles" element={<Suspense fallback={<PageLoader />}><AdminRolesPage /></Suspense>} />
            <Route path="/admin/fraud" element={<Suspense fallback={<PageLoader />}><AdminFraudPage /></Suspense>} />
            <Route path="/admin/applications" element={<Suspense fallback={<PageLoader />}><AdminApplicationsPage /></Suspense>} />
            <Route path="/admin/applications/:id" element={<Suspense fallback={<PageLoader />}><AdminApplicationDetail /></Suspense>} />
            <Route path="/admin/subscriptions" element={<Suspense fallback={<PageLoader />}><AdminSubscriptionsPage /></Suspense>} />
            <Route path="/admin/plans" element={<Suspense fallback={<PageLoader />}><AdminPlansPage /></Suspense>} />
            <Route path="/admin/features" element={<Suspense fallback={<PageLoader />}><AdminFeaturesPage /></Suspense>} />
            <Route path="/admin/invoices" element={<Suspense fallback={<PageLoader />}><AdminInvoicesPage /></Suspense>} />
            <Route path="/admin/coupons" element={<Suspense fallback={<PageLoader />}><AdminCouponsPage /></Suspense>} />
            <Route path="/admin/analytics/revenue" element={<Suspense fallback={<PageLoader />}><AdminRevenueAnalyticsPage /></Suspense>} />
            <Route path="/admin/feature-flags" element={<Suspense fallback={<PageLoader />}><AdminFeatureFlagsPage /></Suspense>} />
            <Route path="/admin/suppliers" element={<Suspense fallback={<PageLoader />}><AdminSuppliersPage /></Suspense>} />
            <Route path="/admin/suppliers/:id" element={<Suspense fallback={<PageLoader />}><AdminSupplierDetailPage /></Suspense>} />
            <Route path="/admin/suppliers/applications" element={<Suspense fallback={<PageLoader />}><AdminSupplierApplicationsPage /></Suspense>} />
            <Route path="/admin/disputes" element={<Suspense fallback={<PageLoader />}><AdminDisputesPage /></Suspense>} />
            <Route path="/admin/disputes/:id" element={<Suspense fallback={<PageLoader />}><AdminDisputeDetailPage /></Suspense>} />
            <Route path="/admin/deliveries" element={<Suspense fallback={<PageLoader />}><AdminDeliveriesPage /></Suspense>} />
            <Route path="/admin/deliveries/:id" element={<Suspense fallback={<PageLoader />}><AdminDeliveryDetailPage /></Suspense>} />
          </Route>
        </Route>
      </Route>

      {/* Supplier portal & registration — protected */}
      <Route element={<AuthGate />}>
        <Route path="/supplier/register" element={<Suspense fallback={<PageLoader />}><SupplierRegisterPage /></Suspense>} />
        <Route element={<SupplierLayout />}>
          <Route path="/supplier/dashboard" element={<Suspense fallback={<PageLoader />}><SupplierDashboardPage /></Suspense>} />
          <Route path="/supplier/products" element={<Suspense fallback={<PageLoader />}><SupplierProductsPage /></Suspense>} />
          <Route path="/supplier/products/new" element={<Suspense fallback={<PageLoader />}><SupplierProductNewPage /></Suspense>} />
          <Route path="/supplier/products/:id/edit" element={<Suspense fallback={<PageLoader />}><SupplierProductEditPage /></Suspense>} />
          <Route path="/supplier/orders" element={<Suspense fallback={<PageLoader />}><SupplierOrdersPage /></Suspense>} />
          <Route path="/supplier/orders/:id" element={<Suspense fallback={<PageLoader />}><SupplierOrderDetailPage /></Suspense>} />
          <Route path="/supplier/delivery-zones" element={<Suspense fallback={<PageLoader />}><SupplierDeliveryZonesPage /></Suspense>} />
          <Route path="/supplier/stats" element={<Suspense fallback={<PageLoader />}><SupplierStatsPage /></Suspense>} />
          <Route path="/supplier/profile" element={<Suspense fallback={<PageLoader />}><SupplierProfilePage /></Suspense>} />
          <Route path="/supplier/payments" element={<Suspense fallback={<PageLoader />}><SupplierPaymentsPage /></Suspense>} />
          <Route path="/supplier/payments/:id" element={<Suspense fallback={<PageLoader />}><SupplierPaymentDetailPage /></Suspense>} />
          <Route path="/supplier/disputes" element={<Suspense fallback={<PageLoader />}><SupplierDisputesPage /></Suspense>} />
          <Route path="/supplier/disputes/:id" element={<Suspense fallback={<PageLoader />}><SupplierDisputeDetailPage /></Suspense>} />
          <Route path="/supplier/deliveries" element={<Suspense fallback={<PageLoader />}><SupplierDeliveriesPage /></Suspense>} />
          <Route path="/supplier/deliveries/:id" element={<Suspense fallback={<PageLoader />}><SupplierDeliveryDetailPage /></Suspense>} />
          <Route path="/supplier/balance" element={<Suspense fallback={<PageLoader />}><SupplierBalancePage /></Suspense>} />
          <Route path="/supplier/settings" element={<Suspense fallback={<PageLoader />}><SupplierSettingsPage /></Suspense>} />
          <Route path="/supplier/stock" element={<Suspense fallback={<PageLoader />}><SupplierStockPage /></Suspense>} />
          <Route path="/supplier/clients" element={<Suspense fallback={<PageLoader />}><SupplierClientsPage /></Suspense>} />
          <Route path="/supplier/clients/:id" element={<Suspense fallback={<PageLoader />}><SupplierClientDetailPage /></Suspense>} />
          <Route path="/supplier/promotions" element={<Suspense fallback={<PageLoader />}><SupplierPromotionsPage /></Suspense>} />
          <Route path="/supplier/invoices" element={<Suspense fallback={<PageLoader />}><SupplierInvoicesPage /></Suspense>} />
          <Route path="/supplier/invoices/:id" element={<Suspense fallback={<PageLoader />}><SupplierInvoiceDetailPage /></Suspense>} />
          <Route path="/supplier/documents" element={<Suspense fallback={<PageLoader />}><SupplierDocumentsPage /></Suspense>} />
          <Route path="/supplier/picking" element={<Suspense fallback={<PageLoader />}><SupplierPickingPage /></Suspense>} />
          <Route path="/supplier/import" element={<Suspense fallback={<PageLoader />}><SupplierImportPage /></Suspense>} />
        </Route>
      </Route>

      {/* User routes */}
      <Route element={<AuthGate />}>
        <Route element={<RequireMode mode="pro" />}>
          <Route element={<ProLayout />}>
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
          <Route path="pro/professional-identity" element={<Suspense fallback={<PageLoader />}><ProProfessionalIdentityPage /></Suspense>} />
          <Route path="pro/payment-methods" element={<Suspense fallback={<PageLoader />}><ProPaymentMethodsPage /></Suspense>} />
          <Route path="pro/withdraw" element={<Suspense fallback={<PageLoader />}><ProWithdrawPage /></Suspense>} />
          <Route path="pro/withdrawals" element={<Suspense fallback={<PageLoader />}><ProWithdrawalsPage /></Suspense>} />
          <Route path="pro/bank-accounts" element={<Suspense fallback={<PageLoader />}><ProBankAccountsPage /></Suspense>} />
          <Route path="pro/currency" element={<Suspense fallback={<PageLoader />}><ProCurrencyPage /></Suspense>} />
          <Route path="pro/timezone" element={<Suspense fallback={<PageLoader />}><ProTimezonePage /></Suspense>} />
          <Route path="pro/appearance" element={<Suspense fallback={<PageLoader />}><ProAppearancePage /></Suspense>} />
          <Route path="pro/privacy" element={<Suspense fallback={<PageLoader />}><ProPrivacyPage /></Suspense>} />
          <Route path="pro/phone" element={<Suspense fallback={<PageLoader />}><ProPhonePage /></Suspense>} />
          <Route path="pro/email" element={<Suspense fallback={<PageLoader />}><ProEmailPage /></Suspense>} />
          <Route path="pro/subscription" element={<Suspense fallback={<PageLoader />}><ProSubscriptionDashboardPage /></Suspense>} />
          <Route path="pro/subscription/plans" element={<Suspense fallback={<PageLoader />}><ProSubscriptionPlansPage /></Suspense>} />
          <Route path="pro/boost" element={<Suspense fallback={<PageLoader />}><ProBoostPage /></Suspense>} />
          <Route path="pro/credits" element={<Suspense fallback={<PageLoader />}><ProCreditsPage2 /></Suspense>} />
          <Route path="pro/edit" element={<Navigate to="/profile/pro-edit" replace />} />
          <Route path="pro/planning" element={<Navigate to="/profile/pro-planning" replace />} />
          <Route path="pro/notifications" element={<Navigate to="/profile/pro-notifications" replace />} />
            </Route>
          </Route>
          <Route element={<AppLayout />}>
        <Route index element={<Suspense fallback={<PageLoader />}><HomePage /></Suspense>} />
        <Route path="search" element={<Suspense fallback={<PageLoader />}><SearchPage /></Suspense>} />
        <Route path="catalog" element={<Suspense fallback={<PageLoader />}><CatalogPage /></Suspense>} />
        <Route path="messages" element={<Suspense fallback={<PageLoader />}><MessagingListPage /></Suspense>} />
        <Route path="messages/:conversationId" element={<Suspense fallback={<PageLoader />}><ChatPage /></Suspense>} />
        <Route path="orders" element={<Suspense fallback={<PageLoader />}><OrdersPage /></Suspense>} />
        <Route path="orders/new" element={<Suspense fallback={<PageLoader />}><RequestWizardPage /></Suspense>} />
        <Route path="orders/matching/:requestId" element={<Suspense fallback={<PageLoader />}><MatchingSearchPage /></Suspense>} />
        <Route path="orders/proposals/:requestId" element={<Suspense fallback={<PageLoader />}><ProposalsListPage /></Suspense>} />
        <Route path="orders/proposals/:requestId/:proposalId" element={<Suspense fallback={<PageLoader />}><ProposalDetailPage /></Suspense>} />
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
        <Route path="profile/pro-missions" element={<RequireMode mode="pro"><Suspense fallback={<PageLoader />}><ProMissionListPage /></Suspense></RequireMode>} />
        <Route path="profile" element={<Suspense fallback={<PageLoader />}><ProfilePage /></Suspense>} />
        <Route path="my-profile" element={<Suspense fallback={<PageLoader />}><UnifiedProfilePage /></Suspense>} />
        <Route path="profile/settings" element={<Suspense fallback={<PageLoader />}><AppSettingsPage /></Suspense>} />
        <Route path="profile/payments" element={<Suspense fallback={<PageLoader />}><ClientPaymentsPage /></Suspense>} />
        <Route path="profile/addresses" element={<Suspense fallback={<PageLoader />}><ClientAddressesPage /></Suspense>} />
        <Route path="profile/notifications" element={<Suspense fallback={<PageLoader />}><ClientNotificationsPage /></Suspense>} />
        <Route path="profile/help" element={<Suspense fallback={<PageLoader />}><ClientHelpPage /></Suspense>} />
        <Route path="profile/edit" element={<Suspense fallback={<PageLoader />}><EditProfilePage /></Suspense>} />
        <Route path="profile/security" element={<Suspense fallback={<PageLoader />}><SecurityPage /></Suspense>} />
        <Route path="profile/language" element={<Suspense fallback={<PageLoader />}><LanguagePage /></Suspense>} />
        <Route path="profile/terms" element={<Suspense fallback={<PageLoader />}><TermsPage /></Suspense>} />
        <Route path="verify/phone" element={<Suspense fallback={<PageLoader />}><VerifyPhonePage /></Suspense>} />
        <Route path="verify/email" element={<Suspense fallback={<PageLoader />}><VerifyEmailPage /></Suspense>} />
        <Route path="verify/identity" element={<Suspense fallback={<PageLoader />}><VerifyIdentityPage /></Suspense>} />
        <Route path="profile/pro-edit" element={<RequireMode mode="pro"><Suspense fallback={<PageLoader />}><ProEditPage /></Suspense></RequireMode>} />
        <Route path="profile/pro-verification" element={<RequireMode mode="pro"><Suspense fallback={<PageLoader />}><ProVerificationPage /></Suspense></RequireMode>} />
        <Route path="profile/pro-finances" element={<RequireMode mode="pro"><Suspense fallback={<PageLoader />}><ProFinancesPage /></Suspense></RequireMode>} />
        <Route path="profile/pro-subscription" element={<RequireMode mode="pro"><Suspense fallback={<PageLoader />}><ProSubscriptionPage /></Suspense></RequireMode>} />
        <Route path="profile/pro-planning" element={<RequireMode mode="pro"><Suspense fallback={<PageLoader />}><ProPlanningPage /></Suspense></RequireMode>} />
        <Route path="profile/pro-notifications" element={<RequireMode mode="pro"><Suspense fallback={<PageLoader />}><ProNotificationsPage /></Suspense></RequireMode>} />
        <Route path="profile/pro-help" element={<RequireMode mode="pro"><Suspense fallback={<PageLoader />}><ProHelpPage /></Suspense></RequireMode>} />
        {/* Redirects: canonical subscription path is /settings/subscription/* */}
        <Route path="subscription/plans" element={<Navigate to="/settings/subscription/plans" replace />} />
        <Route path="subscription/compare" element={<Navigate to="/settings/subscription/plans" replace />} />
        <Route path="subscription/success" element={<Navigate to="/settings/subscription" replace />} />
        <Route path="client/subscription" element={<Navigate to="/settings/subscription" replace />} />
        <Route path="client/subscription/plans" element={<Navigate to="/settings/subscription/plans" replace />} />
        <Route path="client/subscription/payment" element={<Navigate to="/settings/subscription/payment" replace />} />
        <Route path="client/subscription/history" element={<Navigate to="/settings/subscription/history" replace />} />
        <Route path="client/subscription/invoices" element={<Navigate to="/settings/subscription/invoices" replace />} />

        <Route path="settings/subscription" element={<Suspense fallback={<PageLoader />}><SubscriptionDashboardPage /></Suspense>} />
        <Route path="settings/subscription/plans" element={<Suspense fallback={<PageLoader />}><SubscriptionPlansPage /></Suspense>} />
        <Route path="settings/subscription/payment" element={<Suspense fallback={<PageLoader />}><SubscriptionPaymentPage /></Suspense>} />
        <Route path="settings/subscription/history" element={<Suspense fallback={<PageLoader />}><SubscriptionHistoryPage /></Suspense>} />
        <Route path="settings/subscription/invoices" element={<Suspense fallback={<PageLoader />}><SubscriptionInvoicesPage /></Suspense>} />
        <Route path="marketplace" element={<Suspense fallback={<PageLoader />}><MarketplaceHome /></Suspense>} />
        <Route path="marketplace/register" element={<Suspense fallback={<PageLoader />}><SellerRegistrationPage /></Suspense>} />
        <Route path="marketplace/shop/:sellerId" element={<Suspense fallback={<PageLoader />}><ShopPage /></Suspense>} />
        <Route path="marketplace/browse/:vertical" element={<Suspense fallback={<PageLoader />}><CategoryExplore /></Suspense>} />
        <Route path="marketplace/item/:productId" element={<Suspense fallback={<PageLoader />}><ProductDetail /></Suspense>} />
        <Route path="marketplace/:categoryId" element={<Suspense fallback={<PageLoader />}><BrowseProducts /></Suspense>} />
        <Route path="professionals" element={<Suspense fallback={<PageLoader />}><ProfessionalListingScreen /></Suspense>} />
        <Route path="freelance" element={<Suspense fallback={<PageLoader />}><FreelanceListingScreen /></Suspense>} />

        {/* Legacy explorer redirects */}
        <Route path="explorer" element={<Navigate to="/" replace />} />
        <Route path="requests" element={<Navigate to="/orders" replace />} />
        <Route path="requests/*" element={<Navigate to="/orders" replace />} />
        <Route path="explorer/request-creation" element={<Navigate to="/orders/new" replace />} />
        <Route path="explorer/pro-selection" element={<Navigate to="/search" replace />} />
        <Route path="explorer/categories" element={<Navigate to="/search" replace />} />
        <Route path="explorer/search" element={<Navigate to="/search" replace />} />
        <Route path="explorer/category/:categoryId" element={<Navigate to="/search" replace />} />
        <Route path="explorer/matching" element={<Navigate to="/search" replace />} />
        <Route path="explorer/matching/success" element={<Navigate to="/search" replace />} />

        {/* Still active explorer routes (will be migrated to /search/*) */}
        <Route path="explorer/pro/:id" element={<Suspense fallback={<PageLoader />}><ProProfilePage /></Suspense>} />
        <Route path="explorer/design-provider/:id" element={<Suspense fallback={<PageLoader />}><ProviderProfileScreen /></Suspense>} />

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
