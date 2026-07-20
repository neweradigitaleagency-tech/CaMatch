export type NotificationType =
  | 'new_order'
  | 'payment_received'
  | 'low_stock'
  | 'new_dispute'
  | 'delivery_update'
  | 'document_approved'
  | 'document_rejected'
  | 'payout_processed'
  | 'promotion_ended'
  | 'order_delivered'

export interface RealtimeNotification {
  id: string
  type: NotificationType
  title: string
  description: string
  link?: string
  read: boolean
  createdAt: string
}

export const NOTIFICATION_ACTIONS: Record<NotificationType, { label: string; defaultLink: string }> = {
  new_order: { label: 'Nouvelle commande', defaultLink: '/supplier/orders' },
  payment_received: { label: 'Paiement reçu', defaultLink: '/supplier/payments' },
  low_stock: { label: 'Stock faible', defaultLink: '/supplier/stock' },
  new_dispute: { label: 'Nouveau litige', defaultLink: '/supplier/disputes' },
  delivery_update: { label: 'Livraison mise à jour', defaultLink: '/supplier/deliveries' },
  document_approved: { label: 'Document approuvé', defaultLink: '/supplier/documents' },
  document_rejected: { label: 'Document rejeté', defaultLink: '/supplier/documents' },
  payout_processed: { label: 'Paiement traité', defaultLink: '/supplier/balance' },
  promotion_ended: { label: 'Promotion terminée', defaultLink: '/supplier/promotions' },
  order_delivered: { label: 'Commande livrée', defaultLink: '/supplier/deliveries' },
}
