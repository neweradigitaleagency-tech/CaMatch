"use client";

import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";

export function PushNotificationPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      const dismissed = localStorage.getItem("push-dismissed");
      if (!dismissed) {
        const timer = setTimeout(() => setShow(true), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAllow = async () => {
    const result = await Notification.requestPermission();
    if (result === "granted") {
      new Notification("Ça Match", {
        body: "Vous recevrez les alertes de messages et missions",
        icon: "/icons/icon-192.png",
      });
    }
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("push-dismissed", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-50 max-w-lg mx-auto bg-white rounded-2xl border border-gray-200 shadow-elevated p-4 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-text-primary">Activer les notifications</p>
          <p className="text-xs text-text-secondary mt-0.5">
            Soyez alerté des nouveaux messages et demandes de mission
          </p>
          <div className="flex gap-2 mt-3">
            <button onClick={handleAllow} className="bg-primary text-white text-xs font-medium px-4 py-2 rounded-xl active:scale-95 transition-transform">
              Autoriser
            </button>
            <button onClick={handleDismiss} className="bg-gray-100 text-text-secondary text-xs font-medium px-4 py-2 rounded-xl active:scale-95 transition-transform">
              Plus tard
            </button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-text-tertiary p-1 flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
