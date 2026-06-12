"use client";

import { useEffect, useState } from "react";

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prompt = deferredPrompt as any;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-lg mx-auto bg-white rounded-2xl border border-gray-200 shadow-elevated p-4 flex items-center gap-3 animate-slide-up">
      <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v8m0 0l-4-4m4 4l4-4m-4 4v8" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-text-primary">Installer &Ccedil;a Match</p>
        <p className="text-xs text-text-secondary">Acc&egrave;s rapide depuis votre &eacute;cran d&apos;accueil</p>
      </div>
      <button onClick={handleInstall} className="bg-primary text-white text-sm font-medium px-4 py-2 rounded-xl active:scale-95 transition-transform">
        Installer
      </button>
      <button onClick={() => setShowPrompt(false)} className="text-text-tertiary p-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
