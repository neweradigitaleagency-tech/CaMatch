import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { RealtimeNotification, NotificationType } from "../types/notifications"

const MOCK_EVENTS: { type: NotificationType; title: string; description: string; link?: string }[] = [
  { type: "new_order", title: "Nouvelle commande", description: "Commande #156 — 3 articles (95 000 FCFA)", link: "/supplier/orders" },
  { type: "payment_received", title: "Paiement reçu", description: "75 000 FCFA via Orange Money — Commande #149", link: "/supplier/payments" },
  { type: "low_stock", title: "Stock faible", description: "Ciment Portland 42.5R — plus que 12 sacs", link: "/supplier/stock" },
  { type: "new_dispute", title: "Nouveau litige", description: "Commande #142 — Client signale un produit manquant", link: "/supplier/disputes" },
  { type: "delivery_update", title: "Livraison en cours", description: "Commande #151 — Livreur arrive dans 15 min", link: "/supplier/deliveries" },
  { type: "document_approved", title: "Document approuvé", description: "Registre de commerce validé par l'administration", link: "/supplier/documents" },
  { type: "document_rejected", title: "Document rejeté", description: "Attestation fiscale — motif : document expiré", link: "/supplier/documents" },
  { type: "payout_processed", title: "Virement effectué", description: "450 000 FCFA versés sur votre compte MTN", link: "/supplier/balance" },
  { type: "order_delivered", title: "Commande livrée", description: "Commande #148 livrée avec succès à Kouamé Paul", link: "/supplier/deliveries" },
  { type: "promotion_ended", title: "Promotion terminée", description: "Remise 15% sur le ciment — campagne terminée", link: "/supplier/promotions" },
]

interface RealtimeNotificationsContextType {
  notifications: RealtimeNotification[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  panelOpen: boolean
  setPanelOpen: (open: boolean) => void
}

const RealtimeNotificationsContext = createContext<RealtimeNotificationsContextType | null>(null)

export function RealtimeNotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem("realtime-notifications")
    if (stored) {
      try { setNotifications(JSON.parse(stored)) } catch {}
    }
  }, [])

  useEffect(() => {
    sessionStorage.setItem("realtime-notifications", JSON.stringify(notifications))
  }, [notifications])

  const addNotification = useCallback(() => {
    const event = MOCK_EVENTS[Math.floor(Math.random() * MOCK_EVENTS.length)]!
    const notif: RealtimeNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: event.type,
      title: event.title,
      description: event.description,
      link: event.link,
      read: false,
      createdAt: new Date().toISOString(),
    }
    setNotifications((prev) => [notif, ...prev].slice(0, 50))
  }, [])

  useEffect(() => {
    const interval = setInterval(addNotification, 30000 + Math.random() * 20000)
    return () => clearInterval(interval)
  }, [addNotification])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <RealtimeNotificationsContext.Provider value={{
      notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications, panelOpen, setPanelOpen,
    }}>
      {children}
    </RealtimeNotificationsContext.Provider>
  )
}

export function useRealtimeNotifications() {
  const ctx = useContext(RealtimeNotificationsContext)
  if (!ctx) throw new Error("useRealtimeNotifications must be used within RealtimeNotificationsProvider")
  return ctx
}
