"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        className="text-center"
      >
        <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-12 h-12 text-text-tertiary" />
        </div>
        <h1 className="text-2xl font-extrabold text-text-primary mb-2">
          Vous êtes hors ligne
        </h1>
        <p className="text-sm text-text-secondary mb-8 max-w-xs mx-auto">
          Vérifiez votre connexion internet et réessayez. Certaines fonctionnalités peuvent encore être disponibles.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3.5 rounded-2xl active:scale-[0.97] transition-all duration-200 shadow-card"
        >
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </button>
        <div className="mt-4">
          <Link
            href="/"
            className="text-sm text-primary font-medium hover:underline"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
