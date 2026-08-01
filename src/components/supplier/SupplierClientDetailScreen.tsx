import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Phone, Mail, MapPin, ShoppingBag, TrendingUp, Calendar, MessageSquare } from "lucide-react"
import { useSupplierClient } from "../../hooks/supplier/useSupplierClients"
import { getStatusLabel } from "../../services/supplier/orders.service"
import { formatXOF } from "../../utils/format"

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-cm-surface/50 animate-pulse rounded-xl h-8 w-48" />
      <div className="bg-cm-surface/50 animate-pulse rounded-xl h-40" />
      <div className="bg-cm-surface/50 animate-pulse rounded-xl h-32" />
    </div>
  )
}

export default function SupplierClientDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: client, isLoading } = useSupplierClient(id)

  if (isLoading) return <DetailSkeleton />

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-[13px] text-cm-text-muted">Client introuvable</p>
        <button onClick={() => navigate("/supplier/clients")}
          className="mt-3 h-9 px-4 bg-cm-text text-white text-[12px] font-bold rounded-xl cursor-pointer">
          Retour
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="sticky top-0 z-10 bg-cm-surface -mx-4 lg:-mx-6 px-4 lg:px-6 py-3 border-b border-cm-border">
        <button onClick={() => navigate("/supplier/clients")}
          className="flex items-center gap-1.5 text-[13px] font-medium text-cm-text-soft hover:text-cm-text cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Clients
        </button>
      </div>

      <div className="bg-cm-elevated rounded-xl border border-cm-border p-5">
        <h1 className="text-[20px] font-bold text-cm-text">{client.name}</h1>
        <div className="mt-3 space-y-2 text-[13px]">
          {client.phone && (
            <div className="flex items-center gap-2 text-cm-text-soft">
              <Phone className="w-4 h-4 text-cm-text-muted" />
              <span>{client.phone}</span>
              <div className="flex gap-1.5 ml-auto">
                <a href={`tel:${client.phone}`}
                  className="h-7 px-3 rounded-lg bg-cm-green/10 text-cm-green text-[11px] font-semibold flex items-center hover:bg-cm-green/20 cursor-pointer no-underline">
                  Appeler
                </a>
                <a href={`https://wa.me/${client.phone.replace(/\s/g, "")}`} target="_blank" rel="noopener noreferrer"
                  className="h-7 px-3 rounded-lg bg-green-50 text-green-600 text-[11px] font-semibold flex items-center hover:bg-green-100 cursor-pointer no-underline">
                  WhatsApp
                </a>
              </div>
            </div>
          )}
          {client.email && (
            <div className="flex items-center gap-2 text-cm-text-soft">
              <Mail className="w-4 h-4 text-cm-text-muted" />
              <span>{client.email}</span>
            </div>
          )}
          {client.city && (
            <div className="flex items-center gap-2 text-cm-text-soft">
              <MapPin className="w-4 h-4 text-cm-text-muted" />
              <span>{client.city}{client.address ? ` · ${client.address}` : ""}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-3">
          <ShoppingBag className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-[18px] font-bold text-cm-text">{client.totalOrders}</p>
          <p className="text-[10px] text-cm-text-muted">Commandes</p>
        </div>
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-3">
          <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
          <p className="text-[16px] font-bold text-cm-text">{formatXOF(client.totalSpent)}</p>
          <p className="text-[10px] text-cm-text-muted">Total dépensé</p>
        </div>
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-3">
          <TrendingUp className="w-5 h-5 text-indigo-500 mb-2" />
          <p className="text-[16px] font-bold text-cm-text">{formatXOF(Math.round(client.totalSpent / Math.max(client.totalOrders, 1)))}</p>
          <p className="text-[10px] text-cm-text-muted">Panier moyen</p>
        </div>
        <div className="bg-cm-elevated rounded-xl border border-cm-border p-3">
          <Calendar className="w-5 h-5 text-amber-500 mb-2" />
          <p className="text-[14px] font-bold text-cm-text">{new Date(client.createdAt).toLocaleDateString("fr-FR")}</p>
          <p className="text-[10px] text-cm-text-muted">Client depuis</p>
        </div>
      </div>

      <div className="bg-cm-elevated rounded-xl border border-cm-border p-5">
        <h2 className="text-[15px] font-bold text-cm-text mb-4">Historique des commandes ({client.orders.length})</h2>
        {client.orders.length === 0 ? (
          <p className="text-[12px] text-cm-text-muted text-center py-4">Aucune commande</p>
        ) : (
          <div className="space-y-2">
            {client.orders.map((order) => (
              <div key={order.id} onClick={() => navigate(`/supplier/orders/${order.id}`)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-cm-surface cursor-pointer transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-cm-text">{order.id.toUpperCase()}</p>
                  <p className="text-[11px] text-cm-text-muted">{order.deliveryCity} · {new Date(order.createdAt).toLocaleDateString("fr-FR")}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-[13px] font-bold text-cm-text">{formatXOF(order.total)}</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    order.status === "DELIVERED" ? "bg-green-50 text-green-700" :
                    order.status === "CANCELLED" ? "bg-red-50 text-red-600" :
                    "bg-cm-surface text-cm-text-soft"
                  }`}>{getStatusLabel(order.status)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
