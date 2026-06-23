import { useState, useEffect, useCallback } from "react";

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!supported) return "denied";
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [supported]);

  const registerServiceWorker = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return null;
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      if (reg.active) {
        setSubscribed(true);
      }
      return reg;
    } catch {
      return null;
    }
  }, []);

  const sendLocalNotification = useCallback((title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/vite.svg" });
    }
  }, []);

  return {
    supported,
    permission,
    subscribed,
    requestPermission,
    registerServiceWorker,
    sendLocalNotification,
  };
}
