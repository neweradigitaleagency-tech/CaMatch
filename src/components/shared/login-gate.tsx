"use client";

import { useUser } from "@/lib/auth-context";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

interface LoginGateProps {
  children: React.ReactNode;
  requiredRole?: "client" | "pro";
}

export function LoginGate({ children, requiredRole }: LoginGateProps) {
  const { role } = useUser();

  if (role === "visitor") {
    return (
      <main className="min-h-screen flex items-center justify-center -mx-4 -mt-6 sm:-mx-6 lg:-mx-8 px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-brand-orange/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-brand-orange" />
          </div>
          <h1 className="text-xl font-extrabold text-text-primary mb-2">
            Connectez-vous pour continuer
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            Créez un compte ou connectez-vous pour accéder à cette fonctionnalité.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-brand-orange text-white font-bold px-8 py-3.5 rounded-2xl active:scale-[0.97] transition-all duration-200 shadow-cta"
          >
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  if (requiredRole && role !== requiredRole) {
    return (
      <main className="min-h-screen flex items-center justify-center -mx-4 -mt-6 sm:-mx-6 lg:-mx-8 px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-xl font-extrabold text-text-primary mb-2">
            Accès réservé aux professionnels
          </h1>
          <p className="text-sm text-text-secondary mb-6">
            Cette page est accessible uniquement aux comptes professionnels.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gray-100 text-text-secondary font-medium px-6 py-3 rounded-2xl active:scale-[0.97] transition-all"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
