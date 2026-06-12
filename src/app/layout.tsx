import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/shared/site-header";
import { BottomNav } from "@/components/shared/bottom-nav";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Ça Match - Trouvez le bon pro, rapidement",
  description: "Ça Match connecte clients et professionnels de confiance en Côte d'Ivoire.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ÇaMatch",
  },
};

export const viewport = {
  themeColor: "#FF6B35",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased bg-background text-text-primary min-h-screen">
          <AuthProvider>
            <Toaster position="top-center" toastOptions={{
              style: { borderRadius: "16px", padding: "12px 16px", fontSize: "14px" },
              duration: 3000,
            }} />
            <div className="hidden md:block">
              <SiteHeader />
            </div>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
            <BottomNav />
          </AuthProvider>
        </body>
    </html>
  );
}
